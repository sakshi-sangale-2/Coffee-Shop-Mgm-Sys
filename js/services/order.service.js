import { API_BASE_URL, TOKEN_KEY } from '../config.js';

class OrderService {
    async createOrder(items, totalAmount, customerDetails) {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items,
                    totalAmount,
                    customerDetails
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create order');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in createOrder:', error);
            throw error;
        }
    }

    async getOrderByNumber(orderNumber) {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Fetching order:', orderNumber, 'with token:', token);
            const response = await fetch(`${API_BASE_URL}/orders/track/${orderNumber}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch order');
            }

            return data;
        } catch (error) {
            console.error('Error in getOrderByNumber:', error);
            throw error;
        }
    }

    async getUserOrders() {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/orders/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch orders');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getUserOrders:', error);
            throw error;
        }
    }

    async trackOrder(orderNumber) {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}/track`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to track order');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in trackOrder:', error);
            throw error;
        }
    }

    async cancelOrder(orderId) {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cancel order');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in cancelOrder:', error);
            throw error;
        }
    }

    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'confirmed':
                return 'info';
            case 'preparing':
                return 'primary';
            case 'ready':
                return 'success';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}

export const orderService = new OrderService();
