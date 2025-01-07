const { generateSlug } = require('./slugify');
const slugify = require('slugify');

describe('generateSlug', () => {
    let mockFindBySlug;

    beforeEach(() => {
        mockFindBySlug = jest.fn();
    });

    it('should generate a slug for a given name', async () => {
        mockFindBySlug.mockResolvedValue(false); // No slug exists

        const name = 'Test Name';
        const result = await generateSlug(name, mockFindBySlug);

        expect(result).toBe(slugify(name, { lower: true, strict: true }));
        expect(mockFindBySlug).toHaveBeenCalledWith(slugify(name, { lower: true, strict: true }));
    });

    it('should append a counter if the slug is already taken', async () => {
        mockFindBySlug
            .mockResolvedValueOnce(true) // First slug is taken
            .mockResolvedValueOnce(false); // Second slug is available

        const name = 'Test Name';
        const result = await generateSlug(name, mockFindBySlug);

        expect(result).toBe(`${slugify(name, { lower: true, strict: true })}-1`);
        expect(mockFindBySlug).toHaveBeenCalledTimes(2);
    });

    it('should increment the counter until an available slug is found', async () => {
        mockFindBySlug
            .mockResolvedValueOnce(true) // First slug is taken
            .mockResolvedValueOnce(true) // Second slug is taken
            .mockResolvedValueOnce(false); // Third slug is available

        const name = 'Test Name';
        const result = await generateSlug(name, mockFindBySlug);

        expect(result).toBe(`${slugify(name, { lower: true, strict: true })}-2`);
        expect(mockFindBySlug).toHaveBeenCalledTimes(3);
    });

    it('should handle special characters and generate a strict slug', async () => {
        mockFindBySlug.mockResolvedValue(false);

        const name = 'Têst N@me!';
        const result = await generateSlug(name, mockFindBySlug);

        expect(result).toBe(slugify(name, { lower: true, strict: true }));
    });

    it('should work when the initial slug is available without needing a counter', async () => {
        mockFindBySlug.mockResolvedValue(false);

        const name = 'Unique Name';
        const result = await generateSlug(name, mockFindBySlug);

        expect(result).toBe(slugify(name, { lower: true, strict: true }));
        expect(mockFindBySlug).toHaveBeenCalledTimes(1);
    });
});