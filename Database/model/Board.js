const mongoose = require('mongoose');
const { generateSlug } = require('../../util/js/slugify');

const BoardSchema = new mongoose.Schema({
    name: { type: String, rqeuired: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
});

BoardSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = generateSlug(this.name);
    }
    next();
});

module.exports = mongoose.model('Board', BoardSchema);