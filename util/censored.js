const words = require('profane-words');

const censored = (text) => {
    let censoredText = text;
    words.forEach((word) => {
        censoredText = censoredText.replace(word, '****');
    });
    return censoredText;
}

module.exports = censored;
