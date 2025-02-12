import { API_BASE_URL } from '../config.js';

class MenuService {
    constructor() {
        this.menuItems = null;
    }

    async getMenuItems() {
        if (this.menuItems) {
            return this.menuItems;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/menu`);
            if (!response.ok) {
                throw new Error('Failed to fetch menu items');
            }
            this.menuItems = await response.json();
            console.log('Fetched menu items:', this.menuItems);
            return this.menuItems;
        } catch (error) {
            console.error('Error fetching menu items:', error);
            throw error;
        }
    }

    async getMenuItemById(id) {
        if (!this.menuItems) {
            await this.getMenuItems();
        }
        return this.menuItems.find(item => item._id === id);
    }

    getMenuItemIdByDisplayId(displayId) {
        if (!this.menuItems) {
            console.error('Menu items not initialized');
            return null;
        }

        const targetName = this.getDisplayNameById(displayId);
        console.log('Looking for menu item:', targetName);
        
        const menuItem = this.menuItems.find(item => 
            item.name.toLowerCase() === targetName.toLowerCase()
        );
        
        console.log('Found menu item:', menuItem);
        return menuItem ? menuItem._id : null;
    }

    getDisplayNameById(displayId) {
        const menuItemMap = {
            '1': 'Hot Coffee',
            '2': 'Black Coffee',
            '3': 'Hazelnut Cold Coffee',
            '4': 'Chocolate Cold Coffee',
            '5': 'Caramel Cold Coffee',
            '6': 'Classic Cold Coffee',
            '7': 'Iced Americano',
            '8': 'Maggie'
        };
        return menuItemMap[displayId] || '';
    }
}

export const menuService = new MenuService();
