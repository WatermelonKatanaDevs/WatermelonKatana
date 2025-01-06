const slugify = require('slugify');

const generateSlug = async(name, findBySlug) => {
    let slug = slugify(name, {
        lower: true,
        strict: true,
    });

    let isSlugTaken = await findBySlug(slug);

    let counter = 1;
    while (isSlugTaken) {
        slug = `${slugify(name, { lower: true, strict: true })}-${counter}`;
        isSlugTaken = await findBySlug(slug);
        counter++;
    }

    return slug;
}

module.exports = { generateSlug };