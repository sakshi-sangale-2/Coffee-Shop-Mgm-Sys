require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// CORS configuration
const getCorsOrigins = () => {
    if (!process.env.CORS_ENABLED || process.env.CORS_ENABLED === 'false') {
        return '*';
    }
    
    // If CORS_ORIGINS is set, use it
    if (process.env.CORS_ORIGINS) {
        return process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
    }
    
    // Fallback to FRONTEND_URL if set
    if (process.env.FRONTEND_URL) {
        return [process.env.FRONTEND_URL];
    }
    
    // Default to allow all in development
    return process.env.NODE_ENV === 'production' ? [] : '*';
};

const corsOptions = {
    origin: getCorsOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'"]
        }
    }
}));
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        environment: process.env.NODE_ENV,
        apiUrl: process.env.API_URL
    });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

// Serve static files from the frontend build directory
if (process.env.SERVE_FRONTEND === 'true') {
    console.log('Serving frontend static files');
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API URL:', process.env.API_URL);
    console.log('Frontend URL:', process.env.FRONTEND_URL);
    console.log('CORS Origins:', corsOptions.origin);
});
