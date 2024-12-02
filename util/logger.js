const picocolors = require('picocolors');

const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
}

class Logger {
    constructor(message, level) {
        this.message = message;
        this.level = level;
    }

    formatMessage() {
        switch (this.level) {
            case LOG_LEVELS.INFO:
                return picocolors.green(this.message);
            case LOG_LEVELS.WARN:
                return picocolors.yellow(this.message);
            case LOG_LEVELS.ERROR:
                return picocolors.red(this.message);
            case LOG_LEVELS.DEBUG:
                return picocolors.blue(this.message);
        }
    }
}

module.exports = { Logger, LOG_LEVELS };