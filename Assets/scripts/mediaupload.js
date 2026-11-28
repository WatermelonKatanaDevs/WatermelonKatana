(function () {
  var existing = document.getElementById("upload-container");
  var backdrop = document.getElementById("media-upload-backdrop");
  var style = document.getElementById("media-upload-style");

  if (!style) {
    style = document.createElement("style");
    style.id = "media-upload-style";
    style.textContent = [
      "#media-upload-backdrop { position: fixed; inset: 0; z-index: 10000; display: none; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; background: rgba(0,0,0,.65); }",
      "#upload-container { position: relative; width: min(560px, calc(100vw - 32px)); max-height: 90vh; overflow: auto; box-sizing: border-box; padding: 18px; border-radius: 12px; color: var(--palette-textcolor, #fff); background: var(--palette-background-card, #333); box-shadow: 0 12px 40px rgba(0,0,0,.45); }",
      "#upload-container h2 { margin: 0 0 14px; }",
      "#upload-container label { display: block; margin: 10px 0 5px; }",
      "#upload-container #link-insert, #upload-container #file-upload { display: block; width: 100%; max-width: 100%; box-sizing: border-box; margin: 0 0 10px; }",
      "#upload-container #upload-preview { display: none; max-width: 100%; max-height: 55vh; object-fit: contain; margin: 10px auto; border-radius: 6px; }",
      "#upload-container #upload-status { min-height: 1.3em; margin: 8px 0; overflow-wrap: anywhere; }",
      "#upload-container #upload-status[data-error='true'] { color: #ff8585; }",
      "#upload-container #upload-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; margin-top: 12px; }",
      "#upload-container button:disabled { opacity: .6; cursor: wait; }"
    ].join("\n");
    (document.head || document.documentElement).appendChild(style);
  }

  function getOrCreate(tag, id, parent) {
    var element = document.getElementById(id);
    if (!element) {
      element = document.createElement(tag);
      element.id = id;
      parent.appendChild(element);
    }
    return element;
  }

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "media-upload-backdrop";
  }

  var container = existing || document.createElement("div");
  container.id = "upload-container";
  container.setAttribute("role", "dialog");
  container.setAttribute("aria-modal", "true");
  container.setAttribute("aria-labelledby", "upload-title");

  var title = getOrCreate("h2", "upload-title", container);
  title.textContent = "Choose an image";

  var linkLabel = getOrCreate("label", "link-insert-label", container);
  linkLabel.textContent = "Image URL";
  linkLabel.htmlFor = "link-insert";

  var link = getOrCreate("input", "link-insert", container);
  link.type = "text";
  link.autocomplete = "url";
  link.placeholder = "https://… or /api/media/…";

  var fileLabel = getOrCreate("label", "file-upload-label", container);
  fileLabel.textContent = "Or choose an image file";
  fileLabel.htmlFor = "file-upload";

  var file = getOrCreate("input", "file-upload", container);
  file.type = "file";
  file.accept = "image/*";

  var preview = getOrCreate("img", "upload-preview", container);
  preview.alt = "Selected image preview";

  var status = getOrCreate("p", "upload-status", container);
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  var actions = getOrCreate("div", "upload-actions", container);
  var submit = getOrCreate("button", "file-upload-submit", actions);
  submit.type = "button";
  submit.textContent = "Upload";

  var cancel = getOrCreate("button", "file-upload-cancel", actions);
  cancel.type = "button";
  cancel.textContent = "Cancel";

  if (container.parentNode !== backdrop) backdrop.appendChild(container);
  if (!backdrop.parentNode) document.body.appendChild(backdrop);

  var pendingResolve = null;
  var activeUpload = null;
  var activeReader = null;
  var previewObjectUrl = null;
  var uploading = false;
  var previousFocus = null;
  var MAX_UPLOAD_BYTES = 22 * 1024 * 1024;

  function showMessage(message, isError) {
    status.textContent = message || "";
    status.dataset.error = isError ? "true" : "false";
  }

  function releasePreviewUrl() {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }
  }

  function cancelImagePreview(img) {
    releasePreviewUrl();
    img = img || preview;
    img.removeAttribute("src");
    img.style.display = "none";
    img.style.margin = "0";
  }

  function setPreview() {
    var selected = file.files && file.files[0];
    link.value = "";
    cancelImagePreview(preview);

    if (!selected) return;
    if (!selected.type || !selected.type.startsWith("image/")) {
      file.value = "";
      showMessage("Please choose a supported image file.", true);
      return;
    }

    previewObjectUrl = URL.createObjectURL(selected);
    preview.src = previewObjectUrl;
    preview.style.display = "block";
    preview.style.margin = "10px auto";
    showMessage(selected.name + " (" + formatFileSize(selected.size) + ")", false);
  }

  function setPreviewLink() {
    var value = link.value.trim();
    file.value = "";
    cancelImagePreview(preview);

    if (!value) {
      showMessage("", false);
      return;
    }

    preview.src = value;
    preview.style.display = "block";
    preview.style.margin = "10px auto";
    showMessage("", false);
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function finishUpload(url) {
    if (activeUpload) {
      activeUpload.abort();
      activeUpload = null;
    }
    if (activeReader && activeReader.readyState === FileReader.LOADING) {
      activeReader.abort();
    }
    activeReader = null;
    uploading = false;
    submit.disabled = false;
    submit.textContent = "Upload";
    backdrop.style.display = "none";
    backdrop.setAttribute("aria-hidden", "true");
    cancelImagePreview(preview);
    file.value = "";
    link.value = "";
    showMessage("", false);

    var resolve = pendingResolve;
    pendingResolve = null;
    window.onfileupload = null;
    if (resolve) resolve(url || null);

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
    previousFocus = null;
  }

  function getFileUpload(url) {
    if (pendingResolve) finishUpload(null);

    return new Promise(function (resolve) {
      pendingResolve = resolve;
      window.onfileupload = resolve;
      previousFocus = document.activeElement;
      uploading = false;
      submit.disabled = false;
      submit.textContent = "Upload";
      file.value = "";
      link.value = url || "";
      cancelImagePreview(preview);
      showMessage("", false);

      if (url) setPreviewLink();

      backdrop.style.display = "flex";
      backdrop.setAttribute("aria-hidden", "false");
      link.focus();
    });
  }

  function readFileAsBase64(selected) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      activeReader = reader;

      reader.onload = function () {
        if (activeReader === reader) activeReader = null;
        var result = String(reader.result || "");
        var comma = result.indexOf(",");
        if (comma < 0) {
          reject(new Error("The selected image could not be read."));
          return;
        }
        resolve(result.slice(comma + 1));
      };

      reader.onerror = function () {
        if (activeReader === reader) activeReader = null;
        reject(reader.error || new Error("The selected image could not be read."));
      };

      reader.onabort = function () {
        if (activeReader === reader) activeReader = null;
        var error = new Error("Image reading was cancelled.");
        error.name = "AbortError";
        reject(error);
      };

      reader.readAsDataURL(selected);
    });
  }

  async function uploadMedia() {
    if (uploading) return;

    var url = link.value.trim();
    if (url) {
      finishUpload(url);
      return;
    }

    var selected = file.files && file.files[0];
    if (!selected) {
      showMessage("Choose an image file or enter an image URL first.", true);
      return;
    }
    if (!selected.type || !selected.type.startsWith("image/")) {
      showMessage("Please choose a supported image file.", true);
      return;
    }
    if (selected.size > MAX_UPLOAD_BYTES) {
      showMessage("This image is too large. Please choose an image smaller than 22 MB.", true);
      return;
    }

    uploading = true;
    submit.disabled = true;
    submit.textContent = "Uploading…";
    showMessage("Preparing image…", false);

    var controller = new AbortController();
    activeUpload = controller;

    try {
      var base64 = await readFileAsBase64(selected);
      if (controller.signal.aborted) return;

      var params = new URLSearchParams();
      params.set("image", base64);
      params.set("name", selected.name.replace(/\.[^.]+$/, ""));

      showMessage("Uploading image…", false);
      var response = await fetch("/api/media/upload", {
        method: "POST",
        body: params,
        signal: controller.signal
      });

      var data = await response.json().catch(function () { return {}; });
      if (!response.ok || !data.media || !data.media.url) {
        throw new Error(
          (data.error || data.message || "The image upload failed.") +
          " (HTTP " + response.status + ")"
        );
      }

      activeUpload = null;
      finishUpload(data.media.url);
    } catch (error) {
      if (controller.signal.aborted || (error && error.name === "AbortError")) return;

      activeUpload = null;
      uploading = false;
      submit.disabled = false;
      submit.textContent = "Upload";
      showMessage(error && error.message ? error.message : "The image upload failed. Please try again.", true);
      console.error("Media upload failed:", error);
    }
  }

  // Keep the legacy global helpers available to the existing publish/profile pages.
  window.getFileUpload = getFileUpload;
  window.uploadMedia = uploadMedia;
  window.setPreview = setPreview;
  window.setPreviewLink = setPreviewLink;
  window.cancelImagePreview = cancelImagePreview;
  window.fileUploaded = finishUpload;
  window._arrayBufferToBase64 = function (buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = "";
    var chunkSize = 0x8000;
    for (var i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return window.btoa(binary);
  };

  if (container.dataset.mediaUploadBound !== "true") {
    file.addEventListener("change", setPreview);
    link.addEventListener("change", setPreviewLink);
    preview.addEventListener("error", function () {
      if (link.value.trim()) {
        cancelImagePreview(preview);
        showMessage("That image URL could not be previewed. Check the URL and try again.", true);
      }
    });
    submit.addEventListener("click", function (event) {
      event.preventDefault();
      uploadMedia();
    });
    cancel.addEventListener("click", function (event) {
      event.preventDefault();
      finishUpload(null);
    });
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) finishUpload(null);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && backdrop.style.display !== "none") {
        finishUpload(null);
      }
    });
    container.dataset.mediaUploadBound = "true";
  }

  backdrop.setAttribute("aria-hidden", "true");
  backdrop.style.display = "none";
})();