const { LOG_LEVELS, logInfo, logWarn, logError, logDebug } = require('./logger');

describe('Logger', () => {
    test('logInfo', () => {
        const message = 'This is an info message';
        const expected = '\u001b[32mThis is an info message\u001b[39m';
        expect(logInfo(message)).toBe(expected);
    });

    test('logWarn', () => {
        const message = 'This is a warning message';
        const expected = '\u001b[33mThis is a warning message\u001b[39m';
        expect(logWarn(message)).toBe(expected);
    });

    test('logError', () => {
        const message = 'This is an error message';
        const expected = '\u001b[31mThis is an error message\u001b[39m';
        expect(logError(message)).toBe(expected);
    });

    test('logDebug', () => {
        const message = 'This is a debug message';
        const expected = '\u001b[34mThis is a debug message\u001b[39m';
        expect(logDebug(message)).toBe(expected);
    });
});