const words = require('profane-words');
const pattern = `\\b${words.join("|")}\\b`;
const censorPattern = new RegExp(pattern, 'gi');
const testPattern = new RegExp(pattern, "i");
// const { LOG_LEVELS, logInfo, logWarn, logError, logDebug } = require('./logger');

const censorText = (text) => {
    return text.replace(censorPattern, '****');
    // let censoredText = text;
    // censoredText = censoredText.replace(new RegExp(pattern, 'gi'), '****');
    // words.forEach((word) => {
    //     const regex = new RegExp(`\\b${word}\\b`, 'gi');
    //     censoredText = censoredText.replace(regex, '****');
    //     //console.log(logWarn(`Censoring word: ${word}`));
    // });
    // return censoredText;
};

const isProfane = (text) => {
    return text.test(testPattern);
    // for (let word of words) {
    //     const regex = new RegExp(`\\b${word}\\b`, 'i');
    //     if (regex.test(text)) {
    //         return true;
    //     }
    // }
    // return false;
}

module.exports = { isProfane, censorText };
