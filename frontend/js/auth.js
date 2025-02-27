import { TOKEN_KEY } from './config.js';

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login.html';
}
