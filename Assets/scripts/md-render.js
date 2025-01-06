async function fetchMarkdown(url) {
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });
    const markdown = await response.text();
    const htmlContent = marked.parse(markdown);
    document.getElementById('content').innerHTML = htmlContent;
  } catch (error) {
    console.error('Error fetching README:', error);
    document.getElementById('content').innerText = 'Failed to load README content';
  }
}

/**
 * WatermelonParse
 * A simple Markdown-to-HTML parser for WatermelonKatana
 * By: @colack
 */
class WatermelonParse {
  /**
   * Parses a given Markdown string and converts it to HTML.
   * Supports headers, bold, italic, blockquotes, lists, unordered lists, and code blocks.
   * @param {string} markdown - The Markdown input to parse.
   * @returns {string} - The parsed HTML string.
   */
  static parse(markdown) {
    const lines = markdown.split("\n");
    let output = "";
    let inCodeBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          output += "<pre><code>";
          inCodeBlock = true;
        } else {
          output += "</code></pre>\n";
          inCodeBlock = false;
        }
        continue;
      }
      if (inCodeBlock) {
        output += `${line}\n`;
        continue;
      }

      if (trimmed.startsWith("#")) {
        let level = 0;
        while (trimmed[level] === "#") {
          level++;
        }
        if (level > 0 && level <= 6) {
          const content = trimmed.slice(level).trim();
          output += `<h${level}>${content}</h${level}>\n`;
          continue;
        }
      }

      if (trimmed.startsWith(">")) {
        const content = trimmed.slice(1).trim();
        output += `<blockquote>${content}</blockquote>\n`;
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const content = trimmed.replace(/^[-*]\s+/, "");
        output += `<ul><li>${content}</li></ul>\n`;
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s+/, "");
        output += `<ol><li>${content}</li></ol>\n`;
        continue;
      }

      let formattedLine = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

      formattedLine = formattedLine.replace(/\*(.+?)\*/g, "<em>$1</em>");

      output += `${formattedLine}\n`;
    }

    if (inCodeBlock) {
      output += "</code></pre>\n";
    }

    return output.trim();
  }
}