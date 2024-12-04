const words = require('profane-words');
const { LOG_LEVELS, logInfo, logWarn, logError, logDebug } = require('./logger');

const censored = (text) => {
    let censoredText = text;
    words.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        censoredText = censoredText.replace(regex, '****');
        console.log(logWarn(`Censoring word: ${word}`));
    });
    return censoredText;
};

module.exports = censored;
