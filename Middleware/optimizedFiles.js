"use strict";

const fs = require("fs");
const path = require("path");

const native = {
  existsSync: fs.existsSync.bind(fs),
  statSync: fs.statSync.bind(fs),
  readdirSync: fs.readdirSync.bind(fs),
  mkdirSync: fs.mkdirSync.bind(fs),
  readFileSync: fs.readFileSync.bind(fs),
  writeFileSync: fs.writeFileSync.bind(fs),
  copyFileSync: fs.copyFileSync.bind(fs),
  renameSync: fs.renameSync.bind(fs),
  unlinkSync: fs.unlinkSync.bind(fs)
};

const PATCHED_FS = new WeakMap();
const PATCHED_EXPRESS = new WeakMap();
let defaultOptimizer = null;

function inside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative));
}

function globToRegExp(pattern) {
  const normalized = pattern.replace(/\\/g, "/").replace(/^\.\//, "");
  let source = "^";
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (char === "*" && normalized[i + 1] === "*") {
      i++;
      if (normalized[i + 1] === "/") {
        i++;
        source += "(?:.*/)?";
      } else {
        source += ".*";
      }
    } else if (char === "*") {
      source += "[^/]*";
    } else if (char === "?") {
      source += "[^/]";
    } else {
      source += char.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
    }
  }
  return new RegExp(source + "$");
}

function compileExcludes(patterns) {
  return (patterns || []).map(globToRegExp);
}

function isExcluded(relative, patterns) {
  const normalized = relative.split(path.sep).join("/");
  return patterns.some(pattern => pattern.test(normalized));
}

function minifyHTML(input) {
  // Keep comments (the site's replacement markers depend on them), and preserve
  // raw-text elements where whitespace is meaningful.
  const rawTags = new Set(["pre", "textarea", "script", "style"]);
  const tokenPattern = /<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>|[^<]+|</g;
  let output = "";
  let rawTag = null;
  let match;

  while ((match = tokenPattern.exec(input))) {
    const token = match[0];
    if (rawTag) {
      output += token;
      if (new RegExp("</\\s*" + rawTag + "\\s*>", "i").test(token)) rawTag = null;
      continue;
    }

    if (token.startsWith("<!--")) {
      output += token;
      continue;
    }

    const tagMatch = token.match(/^<\s*(\/?)\s*([A-Za-z][\w:-]*)/);
    if (tagMatch) {
      const closing = !!tagMatch[1];
      const tag = tagMatch[2].toLowerCase();
      output += token;
      if (!closing && rawTags.has(tag) && !/\/\s*>$/.test(token)) rawTag = tag;
      continue;
    }

    output += token === "<" ? token : token.replace(/\s+/g, " ");
  }

  return output;
}

function createOptimizer(app, options = {}) {
  const baseDir = path.resolve(options.baseDir || process.cwd());
  const outputDir = path.resolve(baseDir, options.output || ".optimized");
  const entries = (options.directories || []).map(item => {
    const config = typeof item === "string" ? { source: item } : item;
    if (!config || typeof config.source !== "string") {
      throw new TypeError("Each optimizedFiles directory must have a source path.");
    }
    const sourceRoot = path.resolve(baseDir, config.source);
    if (!inside(baseDir, sourceRoot)) {
      throw new Error("Optimized directory must be inside baseDir: " + config.source);
    }
    const relativeRoot = path.relative(baseDir, sourceRoot);
    const outputRoot = path.resolve(outputDir, relativeRoot);
    if (!inside(outputDir, outputRoot)) throw new Error("Invalid optimized output path.");
    return {
      source: config.source,
      sourceRoot,
      outputRoot,
      excludes: compileExcludes([...(options.exclude || []), ...(config.exclude || [])])
    };
  });

  function findEntry(filePath) {
    let absolute;
    try {
      absolute = path.resolve(filePath);
    } catch (_) {
      return null;
    }
    return entries
      .filter(entry => inside(entry.sourceRoot, absolute))
      .sort((a, b) => b.sourceRoot.length - a.sourceRoot.length)[0] || null;
  }

  function resolve(filePath) {
    if (typeof filePath !== "string" && !Buffer.isBuffer(filePath)) return filePath;
    const entry = findEntry(filePath.toString());
    if (!entry) return filePath;
    const absolute = path.resolve(filePath.toString());
    const relative = path.relative(entry.sourceRoot, absolute);
    const optimized = path.resolve(entry.outputRoot, relative);
    if (!inside(entry.outputRoot, optimized) || !native.existsSync(optimized)) return filePath;
    try {
      if (!native.statSync(optimized).isFile()) return filePath;
    } catch (_) {
      return filePath;
    }
    return optimized;
  }

  function resolveForRead(filePath) {
    const result = resolve(filePath);
    return result;
  }

  function transformFile(source, destination, relative, entry) {
    const extension = path.extname(source).toLowerCase();
    const excluded = isExcluded(relative, entry.excludes);
    const data = native.readFileSync(source);

    if (excluded) {
      native.writeFileSync(destination, data);
      return;
    }

    if (extension === ".js" || extension === ".mjs" || extension === ".cjs") {
      const esbuild = require("esbuild");
      const loader = extension === ".mjs" ? "js" : extension === ".cjs" ? "js" : "js";
      const result = esbuild.transformSync(data.toString("utf8"), {
        loader,
        minifyWhitespace: true,
        minifySyntax: true,
        minifyIdentifiers: false,
        legalComments: "none",
        target: "esnext"
      });
      native.writeFileSync(destination, result.code);
      return;
    }

    if (extension === ".css") {
      const esbuild = require("esbuild");
      const result = esbuild.transformSync(data.toString("utf8"), {
        loader: "css",
        minify: true,
        legalComments: "none"
      });
      native.writeFileSync(destination, result.code);
      return;
    }

    if (extension === ".html" || extension === ".htm") {
      native.writeFileSync(destination, minifyHTML(data.toString("utf8")));
      return;
    }

    if (extension === ".json") {
      try {
        native.writeFileSync(destination, JSON.stringify(JSON.parse(data.toString("utf8"))));
      } catch (_) {
        native.writeFileSync(destination, data);
      }
      return;
    }

    // Images, fonts, audio, archives, and unknown formats are copied byte-for-byte.
    native.writeFileSync(destination, data);
  }

  function walk(sourceDir, entry, counts) {
    if (!native.existsSync(sourceDir)) {
      counts.missing.push(path.relative(baseDir, sourceDir));
      return;
    }
    const stat = native.statSync(sourceDir);
    if (!stat.isDirectory()) return;

    for (const item of native.readdirSync(sourceDir, { withFileTypes: true })) {
      const source = path.join(sourceDir, item.name);
      const relative = path.relative(entry.sourceRoot, source);
      const destination = path.join(entry.outputRoot, relative);

      if (item.isSymbolicLink()) continue;
      if (item.isDirectory()) {
        native.mkdirSync(destination, { recursive: true });
        walk(source, entry, counts);
      } else if (item.isFile()) {
        native.mkdirSync(path.dirname(destination), { recursive: true });
        try {
          transformFile(source, destination, relative, entry);
          counts.files++;
          const sourceSize = native.statSync(source).size;
          const outputSize = native.statSync(destination).size;
          counts.sourceBytes += sourceSize;
          counts.outputBytes += outputSize;
          if (outputSize < sourceSize) counts.reducedFiles++;
        } catch (error) {
          // A failed optimization must never prevent deployment or lose the file.
          native.copyFileSync(source, destination);
          counts.fallbacks.push({ file: path.relative(baseDir, source), error: error.message });
        }
      }
    }
  }

  async function build() {
    const counts = {
      files: 0,
      reducedFiles: 0,
      sourceBytes: 0,
      outputBytes: 0,
      missing: [],
      fallbacks: []
    };
    native.mkdirSync(outputDir, { recursive: true });
    for (const entry of entries) {
      native.mkdirSync(entry.outputRoot, { recursive: true });
      walk(entry.sourceRoot, entry, counts);
    }
    if (options.log !== false) {
      const saved = counts.sourceBytes - counts.outputBytes;
      console.log(
        "[optimizedFiles] Processed " + counts.files + " files; reduced " +
        counts.reducedFiles + "; saved " + Math.max(0, saved) + " bytes."
      );
      if (counts.missing.length) console.warn("[optimizedFiles] Missing directories:", counts.missing.join(", "));
      for (const fallback of counts.fallbacks) {
        console.warn("[optimizedFiles] Kept original file after optimization error:", fallback.file, fallback.error);
      }
    }
    return counts;
  }

  function patchFS(fsModule) {
    if (!fsModule || typeof fsModule !== "object") throw new TypeError("patchFS expects the Node.js fs module.");
    if (PATCHED_FS.has(fsModule)) return PATCHED_FS.get(fsModule);

    const originals = {};
    for (const name of ["createReadStream", "readFile", "readFileSync"]) {
      if (typeof fsModule[name] !== "function") continue;
      originals[name] = fsModule[name];
    }

    if (originals.createReadStream) {
      fsModule.createReadStream = function (filePath, ...args) {
        return originals.createReadStream.call(this, resolveForRead(filePath), ...args);
      };
    }

    if (originals.readFile) {
      fsModule.readFile = function (filePath, ...args) {
        return originals.readFile.call(this, resolveForRead(filePath), ...args);
      };
    }

    if (originals.readFileSync) {
      fsModule.readFileSync = function (filePath, ...args) {
        return originals.readFileSync.call(this, resolveForRead(filePath), ...args);
      };
    }

    if (fsModule.promises && typeof fsModule.promises.readFile === "function") {
      const promises = fsModule.promises;
      const originalPromiseReadFile = promises.readFile;
      promises.readFile = function (filePath, ...args) {
        return originalPromiseReadFile.call(this, resolveForRead(filePath), ...args);
      };
      originals.promiseReadFile = originalPromiseReadFile;
    }

    const undo = () => {
      for (const [name, original] of Object.entries(originals)) {
        if (name === "promiseReadFile") {
          if (fsModule.promises) fsModule.promises.readFile = original;
        } else {
          fsModule[name] = original;
        }
      }
      PATCHED_FS.delete(fsModule);
    };
    PATCHED_FS.set(fsModule, undo);
    return undo;
  }

  function patchExpress(expressModule) {
    if (!expressModule || typeof expressModule.static !== "function") return;
    if (PATCHED_EXPRESS.has(expressModule)) return;

    const originalStatic = expressModule.static;
    expressModule.static = function (root, staticOptions) {
      const absoluteRoot = path.resolve(baseDir, root);
      const entry = findEntry(absoluteRoot);
      if (!entry) return originalStatic.call(this, root, staticOptions);

      const relativeRoot = path.relative(entry.sourceRoot, absoluteRoot);
      const optimizedRoot = path.resolve(entry.outputRoot, relativeRoot);
      if (!inside(entry.outputRoot, optimizedRoot)) return originalStatic.call(this, root, staticOptions);

      const optimizedMiddleware = originalStatic.call(this, optimizedRoot, staticOptions);
      const originalMiddleware = originalStatic.call(this, root, staticOptions);
      return function optimizedStaticFallback(req, res, next) {
        optimizedMiddleware(req, res, error => {
          if (error) return next(error);
          originalMiddleware(req, res, next);
        });
      };
    };
    PATCHED_EXPRESS.set(expressModule, originalStatic);
  }

  function patchResponse() {
    if (!app || !app.response) return;
    const response = app.response;
    if (response.__optimizedFilesPatched) return;

    for (const method of ["sendFile", "sendfile", "download"]) {
      if (typeof response[method] !== "function") continue;
      const original = response[method];
      response[method] = function (filePath, ...args) {
        return original.call(this, resolveForRead(filePath), ...args);
      };
    }
    Object.defineProperty(response, "__optimizedFilesPatched", {
      configurable: true,
      value: true
    });
  }

  return { build, resolve, patchFS, patchExpress, outputDir, entries };
}

function optimizedFiles(app, options) {
  const optimizer = createOptimizer(app, options);
  defaultOptimizer = optimizer;
  if (app) {
    optimizer.patchExpress(require("express"));
    const response = app.response || app;
    if (response) {
      const originalAppResponse = app.response;
      optimizer.patchResponse = undefined;
      // Patch this app's response prototype without affecting unrelated Express apps.
      const proto = originalAppResponse;
      if (proto && !proto.__optimizedFilesPatched) {
        for (const method of ["sendFile", "sendfile", "download"]) {
          if (typeof proto[method] !== "function") continue;
          const original = proto[method];
          proto[method] = function (filePath, ...args) {
            return original.call(this, optimizer.resolve(filePath), ...args);
          };
        }
        Object.defineProperty(proto, "__optimizedFilesPatched", { configurable: true, value: true });
      }
    }
    app.optimizedFiles = optimizer;
  }
  return optimizer;
}

optimizedFiles.create = createOptimizer;
optimizedFiles.patchFS = function (fsModule) {
  if (!defaultOptimizer) {
    throw new Error("Call optimizedFiles(app, options) before optimizedFiles.patchFS(fs).");
  }
  return defaultOptimizer.patchFS(fsModule);
};
optimizedFiles.minifyHTML = minifyHTML;

if (require.main === module && process.argv.includes("--build")) {
  const directories = ["Assets", "Pages", "Editor", "Turbo"];
  createOptimizer(null, { directories }).build().catch(error => {
    console.error("[optimizedFiles] Build failed:", error);
    process.exitCode = 1;
  });
}

module.exports = optimizedFiles;
