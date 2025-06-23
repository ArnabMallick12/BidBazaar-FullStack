const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const auth = require('../middleware/auth.middleware');
const Bid = require('../models/bid.model');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bidbazaar/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const upload = multer({ storage });

// List all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('user_id', 'username')
            .populate('highest_bid_id');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get product details
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('user_id', 'username')
            .populate('highest_bid_id');
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create product
router.post('/products', auth, async (req, res) => {
    try {
        // Convert image_urls to the required format
        const images = req.body.image_urls ? req.body.image_urls.map(url => ({
            id: new mongoose.Types.ObjectId(),
            image: url
        })) : [];

        // Create product with the formatted data
        const product = new Product({
            title: req.body.title,
            description: req.body.description,
            starting_price: Number(req.body.starting_price),
            category_new_used: req.body.category_new_used,
            start_date: new Date(req.body.start_date),
            end_date: new Date(req.body.end_date),
            user_id: req.user._id,
            images: images,
            is_listed: true,
            sold: false
        });
        
        await product.save();

        // Return the created product with populated fields
        const populatedProduct = await Product.findById(product._id)
            .populate('user_id', 'username')
            .populate('highest_bid_id');
        
        res.status(201).json(populatedProduct);
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Upload product images
router.post('/products/:id/upload-images', auth, upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        if (product.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You do not have permission to upload images for this product' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images provided' });
        }
        
        // Map the uploaded files to the correct format
        const images = req.files.map(file => ({
            id: new mongoose.Types.ObjectId(),
            image: file.path // This is the Cloudinary URL
        }));
        
        // Add new images to existing ones
        product.images = [...product.images, ...images];
        await product.save();
        
        // Return the updated product with all images
        const updatedProduct = await Product.findById(product._id)
            .populate('user_id', 'username')
            .populate('highest_bid_id');
        
        res.status(201).json(updatedProduct);
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete product image
router.delete('/products/:id/images/:imageId', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        if (product.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You do not have permission to delete images for this product' });
        }
        
        const image = product.images.find(img => img.id.toString() === req.params.imageId);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        // Extract public_id from Cloudinary URL
        const publicId = image.image.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
        
        // Remove from product
        product.images = product.images.filter(img => img.id.toString() !== req.params.imageId);
        await product.save();
        
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products by category
router.get('/products/category/:category', async (req, res) => {
    try {
        const products = await Product.find({ category_new_used: req.params.category })
            .populate('user_id', 'username')
            .populate('highest_bid_id');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products by price range
router.get('/products/price-range', async (req, res) => {
    try {
        const { min_price, max_price } = req.query;
        const products = await Product.find({
            starting_price: { $gte: min_price, $lte: max_price }
        })
        .populate('user_id', 'username')
        .populate('highest_bid_id');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get active auctions by end time
router.get('/products/active/by-end-time', async (req, res) => {
    try {
        const now = new Date();
        const products = await Product.find({
            is_listed: true,
            sold: false,
            end_date: { $gt: now }
        })
        .sort({ end_date: 1 })
        .populate('user_id', 'username')
        .populate('highest_bid_id');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get my listings
router.get('/my-listings', auth, async (req, res) => {
    try {
        const products = await Product.find({ user_id: req.user._id })
            .populate('user_id', 'username')
            .populate('highest_bid_id');
        
        // For each product, add bids_count, end_time, and correct highest_bid_amount
        const productsWithBids = await Promise.all(products.map(async (product) => {
            const bidsCount = await Bid.countDocuments({ product_id: product._id });
            let highestBidAmount = product.starting_price;
            if (product.highest_bid_id && product.highest_bid_id.bid_amount) {
                highestBidAmount = product.highest_bid_id.bid_amount;
            }
            return {
                ...product.toObject(),
                bids_count: bidsCount,
                end_time: product.end_date,
                highest_bid_amount: highestBidAmount
            };
        }));

        res.json(productsWithBids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products sold by seller
router.get('/products/seller/:sellerId/sold', async (req, res) => {
    try {
        const products = await Product.find({
            user_id: req.params.sellerId,
            sold: true
        })
        .populate('highest_bid_id')
        .populate('user_id', 'username');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get new products
router.get('/products/new', async (req, res) => {
    try {
        const products = await Product.find({ category_new_used: 'new' })
            .populate('user_id', 'username')
            .populate('highest_bid_id');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get used products
router.get('/products/used', async (req, res) => {
    try {
        const products = await Product.find({ category_new_used: 'used' })
            .populate('user_id', 'username')
            .populate('highest_bid_id');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 