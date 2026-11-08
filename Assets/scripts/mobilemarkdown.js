(function () {
  function escapeText(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  window.renderMarkdownText = function (value) {
    let string = escapeText(value);
    const escapable = "*_~()`[]\\!#@";
    for (let i = 0; i < escapable.length; i++) string = string.replaceAll("\\" + escapable[i], "&#" + escapable.charCodeAt(i) + ";");
    string = string.replace(/(?<![\\[(][^\\])]+)\\*\\*([^*\\n]+)\\*\\*/g, "<strong>$1</strong>");
    string = string.replace(/(?<![\\[(][^\\])]+)\\*([^*\\n]+)\\*/g, "<em>$1</em>");
    string = string.replace(/(?<![\\[(][^\\])]+)__([^_\\n]+)__/g, "<u>$1</u>");
    string = string.replace(/(?<![\\[(][^\\])]+)_([^_\\n]+)_/g, "<em>$1</em>");
    string = string.replace(/(?<![\\[(][^\\])]+)~~([^~\\n]+)~~/g, "<s>$1</s>");
    string = string.replace(/^-# ([^\\n]+)$/gm, "<sub>$1</sub>");
    string = string.replace(/^# ([^\\n]+)$/gm, "<h1>$1</h1>");
    string = string.replace(/^## ([^\\n]+)$/gm, "<h2>$1</h2>");
    string = string.replace(/^### ([^\\n]+)$/gm, "<h3>$1</h3>");
    string = string.replace(/!\\[([^\\]"'>]*)\\]\\(((?:https?:\\/\\/|\\/api\\/media\\/)[^\\)"']+)\\)/g, function (match, alt, url) {
      const dims = alt.match(/(?:width|height)\\s*=\\s*\\d+/g) || [];
      const attrs = dims.map(dim => {
        const pair = dim.split("=");
        return " " + pair[0].trim() + '="' + Math.max(1, Math.min(2000, parseInt(pair[1], 10))) + '"';
      }).join("");
      return '<img src="' + escapeText(url) + '" alt="' + escapeText(alt.replace(/(?:width|height)\\s*=\\s*\\d+/g, "").trim()) + '"' + attrs + ' loading="lazy">';
    });
    string = string.replace(/\\[([^\\]\\n]+)\\]\\((https?:\\/\\/[^\\)"\\n]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    string = string.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
    string = string.replace(/(^|[^\\w@])@([\\w-]{1,32})/g, '$1<a class="mention" href="/user/$2">@$2</a>');
    return string.replace(/\\n/g, "<br>");
  };
})();