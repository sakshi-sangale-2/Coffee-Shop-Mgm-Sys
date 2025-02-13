import { API_BASE_URL, TOKEN_KEY, USER_KEY } from '../config.js';

class AuthService {
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            
            // Check for return URL
            const returnUrl = localStorage.getItem('returnUrl');
            if (returnUrl) {
                localStorage.removeItem('returnUrl');
                window.location.href = returnUrl;
            } else {
                window.location.href = '/menu.html';
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            const data = await response.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/login.html';
    }

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        // Basic token expiration check (if token is JWT)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                this.logout();
                return false;
            }
            return true;
        } catch (e) {
            return !!token; // Fallback to simple token check if not JWT
        }
    }

    redirectToLogin(returnUrl = window.location.pathname) {
        localStorage.setItem('returnUrl', returnUrl);
        window.location.href = '/login.html';
    }
}

export const authService = new AuthService();
