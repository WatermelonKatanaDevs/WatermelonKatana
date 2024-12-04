function makeLiteralChars(string) {
    string = string.replace(/\&/g,"&amp;");
    string = string.replace(/</g,"&lt;");
    string = string.replace(/>/g,"&gt;");
    string = string.replace(/"/g,"&quot;");
    string = string.replace(/'/g,"&apos;");

    return string;
}

module.exports = makeLiteralChars;