const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    starting_price: {
        type: Number,
        required: true,
        min: 0
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    sold: {
        type: Boolean,
        default: false
    },
    is_listed: {
        type: Boolean,
        default: true
    },
    highest_bid_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
        default: null
    },
    category_new_used: {
        type: String,
        required: true,
        enum: ['new', 'used']
    },
    images: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true
        },
        image: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Virtual for highest bid amount
productSchema.virtual('highest_bid_amount').get(function() {
    return this.highest_bid_id ? this.highest_bid_id.bid_amount : this.starting_price;
});

// Method to check if product is active
productSchema.methods.isActive = function() {
    const now = new Date();
    return this.is_listed && !this.sold && now >= this.start_date && now <= this.end_date;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 