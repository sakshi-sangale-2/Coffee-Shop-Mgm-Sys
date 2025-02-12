import { API_BASE_URL, TOKEN_KEY } from './js/config.js';
import { authService } from './js/services/auth.service.js';

// Load cart and handle order submission
$(document).ready(async function () {
    // Check authentication
    if (!authService.isAuthenticated()) {
        // Save current page as return URL
        localStorage.setItem('returnUrl', '/checkout.html');
        window.location.href = 'login.html';
        return;
    }

    // Load cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    console.log('Cart from localStorage:', cart);
    displayCart(cart);

    // Handle form submission
    $('form').on('submit', async function(e) {
        e.preventDefault();

        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Get form data
            const orderData = {
                name: $('#inputEmail4').val(),
                phone: $('#inputPassword4').val(),
                email: $('#inputAddress').val(),
                address: $('#inputAddress2').val(),
                city: $('#inputCity').val(),
                state: $('#inputState').val(),
                items: cart
            };

            // Create the order
            await createOrder(orderData, token);
        } catch (error) {
            console.error('Order submission error:', error);
            if (error.message.includes('token') || error.message.includes('401')) {
                // Token might be expired, redirect to login
                localStorage.setItem('returnUrl', '/checkout.html');
                window.location.href = 'login.html';
            } else {
                alert('Failed to place order: ' + error.message);
            }
        }
    });
});

// Display cart items
function displayCart(cart) {
    let cartHtml = '';
    let totalAmount = 0;

    console.log('Displaying cart:', cart);

    if (!cart || Object.keys(cart).length === 0) {
        cartHtml = `
            <div class="alert alert-info">
                Your cart is empty. <a href="menu.html">Go back to menu</a>
            </div>`;
    } else {
        // Add table header
        cartHtml = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>`;

        // Add cart items
        for (const [id, item] of Object.entries(cart)) {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;

            cartHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>Rs.${item.price}</td>
                    <td>Rs.${itemTotal}</td>
                </tr>`;
        }

        // Add total row
        cartHtml += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end fw-bold">Total Amount:</td>
                        <td class="fw-bold">Rs.${totalAmount}</td>
                    </tr>
                </tfoot>
            </table>`;
    }

    // Update the cart display
    $('#items').html(cartHtml);
}

// Create order in backend
async function createOrder(orderData, token) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            items: Object.values(orderData.items).map(item => ({
                menuItem: item.mongoId,
                quantity: item.quantity,
                price: item.price
            })),
            customerDetails: {
                name: orderData.name,
                phone: orderData.phone,
                email: orderData.email,
                address: orderData.address,
                city: orderData.city,
                state: orderData.state
            },
            totalAmount: Object.values(orderData.items).reduce((total, item) => 
                total + (item.price * item.quantity), 0)
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
    }

    const order = await response.json();

    // Clear cart and order data
    localStorage.removeItem('cart');
    localStorage.removeItem('orderData');

    // Show success message and redirect
    alert(`Order placed successfully! Order number: ${order.orderNumber}`);
    window.location.href = 'trackorder.html?orderNumber=' + order.orderNumber;
}
