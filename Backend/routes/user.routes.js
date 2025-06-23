const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const auth = require('../middleware/auth.middleware');

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already taken' });
        }

        // Create new user
        const user = new User(req.body);
        await user.save();

        // Generate tokens
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User created successfully',
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_staff: user.is_staff
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_staff: user.is_staff
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refresh } = req.body;
        
        if (!refresh) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ access: accessToken });
    } catch (error) {
        res.status(401).json({ error: 'Token is invalid or expired' });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['first_name', 'last_name', 'email'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!(await req.user.comparePassword(currentPassword))) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        req.user.password = newPassword;
        await req.user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete account
router.delete('/profile', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 