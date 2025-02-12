const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// All routes require authentication
router.use(auth);

// Create new order
router.post('/', async (req, res) => {
    try {
        const order = new Order({
            user: req.user._id,
            items: req.body.items,
            totalAmount: req.body.totalAmount,
            customerDetails: req.body.customerDetails
        });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get user's orders
router.get('/my-orders', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.menuItem')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('items.menuItem');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update order status (admin only)
router.patch('/status/:orderNumber', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // TODO: Add admin check here
        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel order (only if pending)
router.post('/cancel/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({
            orderNumber: req.params.orderNumber,
            user: req.user._id,
            status: 'pending'
        });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found or cannot be cancelled' });
        }
        
        order.status = 'cancelled';
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel order (only if pending)
router.post('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: 'pending'
        });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found or cannot be cancelled' });
        }
        
        order.status = 'cancelled';
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get order by order number - This must be the last route to prevent conflicts
router.get('/track/:orderNumber', async (req, res) => {
    try {
        console.log('Looking for order:', req.params.orderNumber);
        console.log('User ID:', req.user._id);
        
        if (!req.params.orderNumber) {
            return res.status(400).json({ message: 'Order number is required' });
        }

        const order = await Order.findOne({
            orderNumber: req.params.orderNumber
        }).populate('items.menuItem');
        
        if (!order) {
            console.log('Order not found:', req.params.orderNumber);
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order found:', {
            orderId: order._id,
            orderUser: order.user,
            requestUser: req.user._id,
            orderNumber: order.orderNumber
        });

        // Only allow users to view their own orders
        if (!order.user.equals(req.user._id)) {
            console.log('User not authorized to view order');
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
