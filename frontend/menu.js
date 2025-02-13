import { menuService } from './js/services/menu.service.js';
import { orderService } from './js/services/order.service.js';
import { authService } from './js/services/auth.service.js';

let cart = {};

$(document).ready(async function () {
    try {
        // Initialize menu items
        await menuService.getMenuItems();
        
        // Initialize cart from localStorage
        cart = JSON.parse(localStorage.getItem("cart") || "{}");
        
        // Initialize static menu items
        $('.table tbody tr').each(function() {
            const itemId = $(this).find('td:first').attr('id').replace('item', '');
            if (cart[itemId]) {
                updateItemButtons(itemId, cart[itemId].quantity);
            }
        });
        
        updatecart(cart);
    } catch (error) {
        console.error('Failed to initialize menu:', error);
        alert('Failed to load menu items. Please refresh the page.');
    }

    // Add to cart handler
    $(document).on("click", "button.cart", async function() {
        if (!authService.isAuthenticated()) {
            authService.redirectToLogin();
            return;
        }

        const displayId = $(this).attr("id");
        console.log('Adding item with display ID:', displayId);

        // Ensure menu items are loaded
        if (!menuService.menuItems) {
            try {
                await menuService.getMenuItems();
            } catch (error) {
                console.error('Failed to load menu items:', error);
                alert('Failed to add item. Please refresh the page and try again.');
                return;
            }
        }

        const mongoId = menuService.getMenuItemIdByDisplayId(displayId);
        console.log('Found MongoDB ID:', mongoId);
        
        if (!mongoId) {
            console.error('Menu item not found:', displayId);
            alert('Failed to add item to cart. Please try again.');
            return;
        }

        if (cart[displayId]) {
            cart[displayId].quantity += 1;
        } else {
            const row = $(this).closest('tr');
            const itemName = row.find('td:first').text().trim();
            const price = parseInt(row.find('td:nth-child(2)').text().replace('Rs.', ''));
            
            cart[displayId] = { 
                name: itemName, 
                price: price, 
                quantity: 1,
                mongoId: mongoId
            };
        }
        
        updateItemButtons(displayId, cart[displayId].quantity);
        updatecart(cart);
    });

    // Quantity adjustment handlers
    $(document).on("click", "button.minus", function() {
        const itemId = $(this).closest('.btn-group').find('.quantity').data('item-id');
        if (cart[itemId]) {
            cart[itemId].quantity = Math.max(0, cart[itemId].quantity - 1);
            if (cart[itemId].quantity === 0) {
                delete cart[itemId];
                resetItemButton(itemId);
            } else {
                updateItemButtons(itemId, cart[itemId].quantity);
            }
            updatecart(cart);
        }
    });

    $(document).on("click", "button.plus", function() {
        const itemId = $(this).closest('.btn-group').find('.quantity').data('item-id');
        if (cart[itemId]) {
            cart[itemId].quantity += 1;
            updateItemButtons(itemId, cart[itemId].quantity);
            updatecart(cart);
        }
    });

    // Remove item handler
    $(document).on("click", "button.remove", function() {
        const itemId = $(this).data("item-id");
        if (cart[itemId]) {
            delete cart[itemId];
            resetItemButton(itemId);
            updatecart(cart);
        }
    });

    // Clear cart handler
    $("#clear").click(function() {
        Object.keys(cart).forEach(itemId => {
            resetItemButton(itemId);
        });
        cart = {};
        localStorage.removeItem("cart");
        updatecart(cart);
    });

    // Checkout button handler
    $("#checkoutBtn").click(function() {
        if (!authService.isAuthenticated()) {
            authService.redirectToLogin('/menu.html');
            return;
        }
        
        // Save cart to localStorage and redirect to checkout page
        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = 'checkout.html';
    });

    function updateItemButtons(itemId, quantity) {
        const cell = $(`#row${itemId}`);
        cell.html(`
            <div class="btn-group">
                <button class="minus btn">-</button>
                <span class="quantity" data-item-id="${itemId}">${quantity}</span>
                <button class="plus btn">+</button>
            </div>
        `);
    }

    function resetItemButton(itemId) {
        const cell = $(`#row${itemId}`);
        cell.html(`<button id="${itemId}" class="btn cart" type="button">Add</button>`);
    }

    function updatecart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
        
        let cartContainer = $("#cartcontainer");
        cartContainer.empty();
        
        let totalPrice = 0;
        
        if (Object.keys(cart).length === 0) {
            cartContainer.html('<p class="text-center text-muted">Your cart is empty</p>');
            $("#cart-total").text("Rs.0");
            return;
        }
        
        Object.entries(cart).forEach(([id, item]) => {
            if (item.quantity > 0) {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                cartContainer.append(`
                    <div class="card item-card" key="${id}">
                        <div class="card-body">
                            <h6 class="card-title">${item.name}</h6>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <p class="mb-0">Quantity: ${item.quantity}</p>
                                    <p class="mb-0">Price: Rs.${item.price}</p>
                                    <p class="mb-0">Total: Rs.${itemTotal}</p>
                                </div>
                                <button class="remove btn btn-danger btn-sm" data-item-id="${id}">Remove</button>
                            </div>
                        </div>
                    </div>
                `);
            }
        });
        
        $("#cart-total").text(`Rs.${totalPrice}`);
    }
})