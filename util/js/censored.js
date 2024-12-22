const words = require('profane-words');
const { LOG_LEVELS, logInfo, logWarn, logError, logDebug } = require('./logger');

const censorText = (text) => {
    let censoredText = text;
    words.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        censoredText = censoredText.replace(regex, '****');
        console.log(logWarn(`Censoring word: ${word}`));
    });
    return censoredText;
};

const isProfane = (text) => {
    for (let word of words) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(text)) {
            return true;
        }
    }
    return false;
}

module.exports = { isProfane, censorText };