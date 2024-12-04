const censored = require('./censored');

describe('censored', () => {
    it('should censor profane words', () => {
        const text = 'Fuck you';
        const censoredText = censored(text);
        expect(censoredText).toBe('**** you');
    });
});
