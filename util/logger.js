/*
    Logger

    Logger class to log messages with different levels.
    Uses chalk to color the output.
 */

const chalk = require('chalk');

/**
 * Log Levels
 * @type {{ERROR: string, INFO: string, DEBUG: string, WARN: string}}
 */
const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
}

/**
 * Logger class to log messages with different levels
 * @param {string} message - Message to log
 * @param {string} level - Log level
 * @returns {string} - Formatted message
 */
class Logger {
    constructor(message, level) {
        this.message = message;
        this.level = level;
    }

    formatMessage() {
        switch (this.level) {
            case LOG_LEVELS.INFO:
                return chalk.blue(this.message);
            case LOG_LEVELS.WARN:
                return chalk.yellow(this.message);
            case LOG_LEVELS.ERROR:
                return chalk.red(this.message);
            case LOG_LEVELS.DEBUG:
                return chalk.green(this.message);
            default:
                return this.message;
        }
    }

    static info(message) {
        return new Logger(message, LOG_LEVELS.INFO).formatMessage();
    }

    static warn(message) {
        return new Logger(message, LOG_LEVELS.WARN).formatMessage();
    }

    static error(message) {
        return new Logger(message, LOG_LEVELS.ERROR).formatMessage();
    }

    static debug(message) {
        return new Logger(message, LOG_LEVELS.DEBUG).formatMessage();
    }
}

module.exports = { Logger, LOG_LEVELS };