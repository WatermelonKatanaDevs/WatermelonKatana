const { Logger, LOG_LEVELS } = require('./logger');

describe('Logger', () => {
    it('should format message with INFO level', () => {
        const logger = new Logger('This is an info message', LOG_LEVELS.INFO);
        const formattedMessage = logger.formatMessage();
        expect(formattedMessage).toBe('\u001b[32mThis is an info message\u001b[39m');
    });

    it('should format message with WARN level', () => {
        const logger = new Logger('This is a warning message', LOG_LEVELS.WARN);
        const formattedMessage = logger.formatMessage();
        expect(formattedMessage).toBe('\u001b[33mThis is a warning message\u001b[39m');
    });

    it('should format message with ERROR level', () => {
        const logger = new Logger('This is an error message', LOG_LEVELS.ERROR);
        const formattedMessage = logger.formatMessage();
        expect(formattedMessage).toBe('\u001b[31mThis is an error message\u001b[39m');
    });

    it('should format message with DEBUG level', () => {
        const logger = new Logger('This is a debug message', LOG_LEVELS.DEBUG);
        const formattedMessage = logger.formatMessage();
        expect(formattedMessage).toBe('\u001b[34mThis is a debug message\u001b[39m');
    });
});