const words = require('profane-words');

const censored = (text) => {
    let censoredText = text;
    words.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        censoredText = censoredText.replace(regex, '****');
    });
    return censoredText;
};

module.exports = censored;
