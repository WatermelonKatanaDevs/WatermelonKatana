function makeLiteralChars(string) {
  string = String(string ?? "");
  string = string.replace(/\&/g, "&amp;");
  string = string.replace(/</g, "&lt;");
  string = string.replace(/>/g, "&gt;");
  string = string.replace(/"/g, "&quot;");
  string = string.replace(/'/g, "&apos;");
  //string = string.replace(/ /g,"&nbsp;");
  return string;
}

function convertMarkdown(string) {
  string = makeLiteralChars(string);
  var escapable = "*_~()`[]\\!#@";
  for (var i = 0; i < escapable.length; i++) {
    string = string.split("\\" + escapable[i]).join("&#" + escapable.charCodeAt(i) + ";"); // make certain characters escapable
  }
  string = string.replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>"); // **bold**
  string = string.replace(/\*([^*\n]+)\*/g, "<i>$1</i>"); // *italics*
  string = string.replace(/__([^_\n]+)__/g, "<u>$1</u>"); // __underline__
  string = string.replace(/_([^_\n]+)_/g, "<i>$1</i>"); // _italics_
  string = string.replace(/~~([^~\n]+)~~/g, "<s>$1</s>"); // ~~strikethrough~~
  string = string.replace(/^-# ([^\n]+)$/gm, "<sub>$1</sub>"); // -# subtext
  string = string.replace(/^# ([^\n]+)$/gm, "<h1>$1</h1>"); // # header 1
  string = string.replace(/^## ([^\n]+)$/gm, "<h2>$1</h2>"); // # header 2
  string = string.replace(/^### ([^\n]+)$/gm, "<h3>$1</h3>"); // # header 3
  string = string.replace(/!\[([^\]"'>]*)\]\(((?:https?:\/\/|\/api\/media\/)[^\)"]+)\)/g, function (match, alt, url) {
    var attrs = "";
    var dims = alt.match(/(?:width|height)\s*=\s*\d+/g);
    if (dims) {
      for (var i = 0; i < dims.length; i++) {
        var pair = dims[i].split("=");
        attrs += " " + pair[0].trim() + '="' + parseInt(pair[1], 10) + '"';
      }
    }
    return '<img src="' + makeLiteralChars(url) + '"' + attrs + '>';
  }); // ![width=50 height=50](https://example.com/image)
  string = string.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\)"\n]+)\)/g, `<a href="$2">$1</a>`); // [link](https://example.com)
  string = string.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, `<a href="mailto:$1">$1</a>`); // user@example.com
  string = string.replace(/(^|\s)@([^\s]+)/g, '$1<a href="/user/$2">@$2</a>'); // @Username
  string = string.replace(/\n/g, "<br>"); // line breaks
  // still need to add: block quotes, lists, code, spoilers
  return string;
}

window.convertMarkdown = convertMarkdown;
