const express = require('express');
const router = express.Router();
const Bid = require('../models/bid.model');
const Product = require('../models/product.model');
const auth = require('../middleware/auth.middleware');

// Place bid
router.post('/products/:productId/place-bid', auth, async (req, res) => {
    try {
        const { bid_amount, start_date, end_date } = req.body;
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.user_id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'You cannot bid on your own product' });
        }

        // Add detailed logging for debugging
        const now = new Date();
        console.log('Bid placement debug info:', {
            productId: product._id,
            productTitle: product.title,
            is_listed: product.is_listed,
            sold: product.sold,
            start_date: product.start_date,
            end_date: product.end_date,
            currentTime: now,
            isActive: product.isActive(),
            startDateCheck: now >= product.start_date,
            endDateCheck: now <= product.end_date
        });

        if (!product.isActive()) {
            let reason = '';
            if (!product.is_listed) reason = 'Product is not listed';
            else if (product.sold) reason = 'Product is already sold';
            else if (now < product.start_date) reason = `Auction has not started yet (starts at ${product.start_date})`;
            else if (now > product.end_date) reason = `Auction has already ended (ended at ${product.end_date})`;
            
            return res.status(400).json({ 
                error: 'This product is not available for bidding',
                reason: reason
            });
        }

        if (bid_amount < product.starting_price) {
            return res.status(400).json({ 
                error: `Bid must be at least the starting price: ${product.starting_price}` 
            });
        }

        const highestBid = await Bid.getHighestBid(product._id);
        if (highestBid && bid_amount <= highestBid.bid_amount) {
            return res.status(400).json({ 
                error: `Bid must be higher than the current highest bid: ${highestBid.bid_amount}` 
            });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate < now) {
            return res.status(400).json({ error: 'Start date cannot be in the past' });
        }

        if (endDate <= startDate) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        if (endDate > product.end_date) {
            return res.status(400).json({ error: 'Bid end date cannot be after product end date' });
        }

        const bid = new Bid({
            product_id: product._id,
            user_id: req.user._id,
            bid_amount,
            start_date: startDate,
            end_date: endDate
        });

        await bid.save();

        // Update product's highest bid
        product.highest_bid_id = bid._id;
        await product.save();

        res.status(201).json(bid);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all bids for a product
router.get('/products/:productId/bids', async (req, res) => {
    try {
        const bids = await Bid.find({ product_id: req.params.productId })
            .populate('user_id', 'username')
            .sort({ bid_amount: -1 });
        res.json(bids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get highest bid for a product
router.get('/products/:productId/highest-bid', async (req, res) => {
    try {
        const highestBid = await Bid.getHighestBid(req.params.productId);
        
        if (!highestBid) {
            return res.status(404).json({ message: 'No bids found for this product' });
        }
        
        res.json(highestBid);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get my bids on a product
router.get('/products/:productId/my-bids', auth, async (req, res) => {
    try {
        const bids = await Bid.find({
            product_id: req.params.productId,
            user_id: req.user._id
        }).sort({ bid_amount: -1 });
        
        res.json(bids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all my active bids
router.get('/my-active-bids', auth, async (req, res) => {
    try {
        const now = new Date();
        const bids = await Bid.find({
            user_id: req.user._id,
            end_date: { $gt: now }
        })
        .populate('product_id')
        .sort({ end_date: 1 });
        
        res.json(bids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all my expired bids
router.get('/my-expired-bids', auth, async (req, res) => {
    try {
        const now = new Date();
        const bids = await Bid.find({
            user_id: req.user._id,
            end_date: { $lte: now }
        })
        .populate('product_id')
        .sort({ end_date: -1 });
        
        res.json(bids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all my bids
router.get('/my-bids', auth, async (req, res) => {
    try {
        const bids = await Bid.find({ user_id: req.user._id })
            .populate('product_id')
            .sort({ end_date: -1 });
        res.json(bids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sell product to bidder
router.post('/products/:productId/sell/:bidId', auth, async (req, res) => {
    try {
        console.log('Sell product request:', {
            productId: req.params.productId,
            bidId: req.params.bidId,
            userId: req.user._id
        });
        const product = await Product.findById(req.params.productId);
        const bid = await Bid.findById(req.params.bidId);

        if (!product || !bid) {
            console.error('Product or bid not found', { product, bid });
            return res.status(404).json({ error: 'Product or bid not found' });
        }

        if (product.user_id.toString() !== req.user._id.toString()) {
            console.error('Permission denied: user is not the owner', { productUserId: product.user_id, currentUserId: req.user._id });
            return res.status(403).json({ error: 'You do not have permission to sell this product' });
        }

        if (product.sold) {
            console.error('Product already sold', { productId: product._id });
            return res.status(400).json({ error: 'This product has already been sold' });
        }

        if (bid.product_id.toString() !== product._id.toString()) {
            console.error('Bid is not for the specified product', { bidProductId: bid.product_id, productId: product._id });
            return res.status(400).json({ error: 'This bid is not for the specified product' });
        }

        // Check if bid is still valid
        const now = new Date();
        if (now > bid.end_date) {
            console.error('Bid has expired', { now, bidEndDate: bid.end_date });
            return res.status(400).json({ error: 'This bid has expired' });
        }

        product.sold = true;
        product.highest_bid_id = bid._id;
        await product.save();

        console.log('Product sold successfully', { productId: product._id, bidId: bid._id });
        res.json(product);
    } catch (error) {
        console.error('Error in sell product endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cancel a bid
router.delete('/products/:productId/bids/:bidId', auth, async (req, res) => {
    try {
        const bid = await Bid.findOne({
            _id: req.params.bidId,
            product_id: req.params.productId,
            user_id: req.user._id
        });

        if (!bid) {
            return res.status(404).json({ error: 'Bid not found' });
        }

        const product = await Product.findById(req.params.productId);
        
        // If this was the highest bid, update the product
        if (product.highest_bid_id && product.highest_bid_id.toString() === bid._id.toString()) {
            const newHighestBid = await Bid.findOne({ product_id: product._id })
                .sort({ bid_amount: -1 });
            
            product.highest_bid_id = newHighestBid ? newHighestBid._id : null;
            await product.save();
        }

        await bid.remove();
        res.json({ message: 'Bid cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 