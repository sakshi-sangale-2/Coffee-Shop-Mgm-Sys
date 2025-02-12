import { orderService } from './js/services/order.service.js';
import { authService } from './js/services/auth.service.js';
import { TOKEN_KEY } from './js/config.js';

$(document).ready(async function() {
    // Check authentication
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        localStorage.setItem('returnUrl', '/trackorder.html');
        window.location.href = 'login.html';
        return;
    }

    // Check if we have an order number in URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('orderNumber');
    if (orderNumber) {
        $('#orderNumber').val(orderNumber);
        await trackOrder(orderNumber);
    }

    // Track button click handler
    $('#trackBtn').on('click', async function() {
        const orderNumber = $('#orderNumber').val().trim();
        if (!orderNumber) {
            showError('Please enter an order number');
            return;
        }
        await trackOrder(orderNumber);
    });

    // Enter key handler
    $('#orderNumber').on('keypress', async function(e) {
        if (e.which === 13) {
            const orderNumber = $(this).val().trim();
            if (!orderNumber) {
                showError('Please enter an order number');
                return;
            }
            await trackOrder(orderNumber);
        }
    });
});

async function trackOrder(orderNumber) {
    try {
        // Clear previous error
        hideError();
        
        console.log('Tracking order:', orderNumber);
        const order = await orderService.getOrderByNumber(orderNumber);
        console.log('Order details:', order);
        
        if (!order) {
            showError('Order not found');
            return;
        }

        displayOrderDetails(order);
    } catch (error) {
        console.error('Failed to track order:', error);  
        showError(error.message || 'Failed to track order. Please check your order number.');
    }
}

function displayOrderDetails(order) {
    // Show order details section
    $('#orderDetails').show();

    // Update basic details
    $('#displayOrderNumber').text(order.orderNumber);
    $('#orderDate').text(orderService.formatDate(order.createdAt));
    $('#orderAmount').text(order.totalAmount);

    // Update status badge
    const statusColor = orderService.getStatusColor(order.status);
    $('#orderStatus')
        .text(order.status.toUpperCase())
        .removeClass()
        .addClass(`badge rounded-pill bg-${statusColor}`);

    // Update items table
    let itemsHtml = '';
    order.items.forEach(item => {
        const menuItem = item.menuItem || {};
        itemsHtml += `
            <tr>
                <td>${menuItem.name || 'Unknown Item'}</td>
                <td>${item.quantity}</td>
                <td>Rs.${item.price}</td>
            </tr>
        `;
    });
    $('#orderItems').html(itemsHtml);

    // Update timeline
    updateTimeline(order.status);
}

function updateTimeline(currentStatus) {
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const currentIndex = statuses.indexOf(currentStatus.toLowerCase());

    statuses.forEach((status, index) => {
        const dot = $(`#status${status.charAt(0).toUpperCase() + status.slice(1)}`);
        if (index <= currentIndex) {
            dot.addClass('active');
        } else {
            dot.removeClass('active');
        }
    });
}

function showError(message) {
    $('#errorMessage')
        .text(message)
        .show();
    $('#orderDetails').hide();
}

function hideError() {
    $('#errorMessage').hide();
}
