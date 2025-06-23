const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bid_amount: {
        type: Number,
        required: true,
        min: 0
    },
    bid_time: {
        type: Date,
        default: Date.now
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Method to check if bid is valid
bidSchema.methods.isValid = function() {
    const now = new Date();
    return now >= this.start_date && now <= this.end_date;
};

// Static method to get highest bid for a product
bidSchema.statics.getHighestBid = async function(productId) {
    return this.findOne({ product_id: productId })
        .sort({ bid_amount: -1 })
        .populate('user_id', 'username');
};

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid; 