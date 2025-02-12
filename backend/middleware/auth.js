const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('No Authorization header found');
            return res.status(401).json({ message: 'No auth token provided' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('Invalid Authorization header format');
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Token received:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Changed from decoded._id to decoded.id
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('User not found:', decoded.id);
            return res.status(401).json({ message: 'User not found' });
        }

        console.log('User found:', user._id);
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = auth;
