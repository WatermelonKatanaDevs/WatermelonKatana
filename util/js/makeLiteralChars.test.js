const makeLiteralChars = require('./makeLiteralChars');

describe('makeLiteralChars', () => {
    it('should replace & with &amp;', () => {
        const input = 'Hello & World';
        const expected = 'Hello &amp; World';
        expect(makeLiteralChars(input)).toBe(expected);
    });

    it('should replace < with &lt;', () => {
        const input = 'Hello < World';
        const expected = 'Hello &lt; World';
        expect(makeLiteralChars(input)).toBe(expected);
    });

    it('should replace > with &gt;', () => {
        const input = 'Hello > World';
        const expected = 'Hello &gt; World';
        expect(makeLiteralChars(input)).toBe(expected);
    });

    it('should replace " with &quot;', () => {
        const input = 'Hello " World';
        const expected = 'Hello &quot; World';
        expect(makeLiteralChars(input)).toBe(expected);
    });

    it('should replace \' with &apos;', () => {
        const input = "Hello ' World";
        const expected = 'Hello &apos; World';
        expect(makeLiteralChars(input)).toBe(expected);
    });

    it('should replace multiple special characters', () => {
        const input = 'Hello & < > " \' World';
        const expected = 'Hello &amp; &lt; &gt; &quot; &apos; World';
        expect(makeLiteralChars(input)).toBe(expected);
    });
});