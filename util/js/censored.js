const words = require('profane-words');
const pattern = `\\b(${words.join("|")})\\b`;
const censorPattern = new RegExp(pattern, 'gi');
const testPattern = new RegExp(pattern, "i");
// const { LOG_LEVELS, logInfo, logWarn, logError, logDebug } = require('./logger');

const censorText = (text) => {
    censorPattern.lastIndex = 0;
    return text.replace(censorPattern, '****');
};

const isProfane = (text) => {
    return text.test(testPattern);
}

module.exports = { isProfane, censorText };
