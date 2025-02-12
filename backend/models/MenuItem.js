const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['coffee', 'tea', 'pastries', 'snacks']
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

// Ensure indexes for better query performance
menuItemSchema.index({ name: 1 }, { unique: true });
menuItemSchema.index({ category: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
