const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

// Initialize default menu items if they don't exist
async function initializeMenuItems() {
    try {
        const count = await MenuItem.countDocuments();
        console.log('Current menu items count:', count);
        
        if (count === 0) {
            console.log('Initializing default menu items...');
            const defaultItems = [
                {
                    name: 'Hot Coffee',
                    price: 80,
                    category: 'coffee',
                    description: 'Classic hot coffee'
                },
                {
                    name: 'Black Coffee',
                    price: 80,
                    category: 'coffee',
                    description: 'Strong black coffee'
                },
                {
                    name: 'Hazelnut Cold Coffee',
                    price: 125,
                    category: 'coffee',
                    description: 'Cold coffee with hazelnut flavor'
                },
                {
                    name: 'Chocolate Cold Coffee',
                    price: 125,
                    category: 'coffee',
                    description: 'Cold coffee with chocolate flavor'
                },
                {
                    name: 'Caramel Cold Coffee',
                    price: 125,
                    category: 'coffee',
                    description: 'Cold coffee with caramel flavor'
                },
                {
                    name: 'Classic Cold Coffee',
                    price: 100,
                    category: 'coffee',
                    description: 'Traditional cold coffee'
                },
                {
                    name: 'Iced Americano',
                    price: 160,
                    category: 'coffee',
                    description: 'Chilled americano coffee'
                },
                {
                    name: 'Maggie',
                    price: 30,
                    category: 'snacks',
                    description: 'Classic Maggie noodles'
                }
            ];

            const result = await MenuItem.insertMany(defaultItems);
            console.log('Default menu items created:', result.length);
            return result;
        }
        
        return await MenuItem.find();
    } catch (error) {
        console.error('Error initializing menu items:', error);
        throw error;
    }
}

// Get all menu items
router.get('/', async (req, res) => {
    try {
        let menuItems = await MenuItem.find();
        
        // If no menu items exist, initialize them
        if (menuItems.length === 0) {
            console.log('No menu items found, initializing...');
            menuItems = await initializeMenuItems();
        }
        
        console.log('Returning menu items:', menuItems.length);
        res.json(menuItems);
    } catch (error) {
        console.error('Error in GET /menu:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get menu item by id
router.get('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin routes below require authentication
router.use(auth);

// Create new menu item (admin only)
router.post('/', async (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        await menuItem.save();
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update menu item (admin only)
router.patch('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete menu item (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
