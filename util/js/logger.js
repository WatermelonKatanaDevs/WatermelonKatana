const picocolors = require('picocolors');

const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
}

function logInfo(message) {
    return picocolors.green(message);
}

function logWarn(message) {
    return picocolors.yellow(message);
}

function logError(message) {
    return picocolors.red(message);
}

function logDebug(message) {
    return picocolors.blue(message);
}

module.exports = { LOG_LEVELS, logInfo, logWarn, logError, logDebug };