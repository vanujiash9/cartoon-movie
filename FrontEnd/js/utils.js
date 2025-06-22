/* =======================================================
   UTILS.JS - TIỆN ÍCH VÀ FUNCTIONS CHUNG CHO TOÀN BỘ PROJECT
   ======================================================= */

// Utility functions
const Utils = {
    // Local Storage helpers
    storage: {
        get: (key) => localStorage.getItem(key),
        set: (key, value) => localStorage.setItem(key, value),
        remove: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
    },

    // API helpers
    api: {
        baseUrl: 'http://localhost:8080',
        
        async request(endpoint, options = {}) {
            const token = Utils.storage.get('token');
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            };
            
            const config = { ...defaultOptions, ...options };
            if (config.body && typeof config.body === 'object') {
                config.body = JSON.stringify(config.body);
            }
            
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, config);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return await response.json();
            } catch (error) {
                console.error('API Request failed:', error);
                throw error;
            }
        },

        get: (endpoint) => Utils.api.request(endpoint),
        post: (endpoint, data) => Utils.api.request(endpoint, { method: 'POST', body: data }),
        put: (endpoint, data) => Utils.api.request(endpoint, { method: 'PUT', body: data }),
        delete: (endpoint) => Utils.api.request(endpoint, { method: 'DELETE' })
    },

    // DOM helpers
    dom: {
        get: (selector) => document.querySelector(selector),
        getAll: (selector) => document.querySelectorAll(selector),
        create: (tag, attributes = {}, content = '') => {
            const element = document.createElement(tag);
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
            if (content) element.innerHTML = content;
            return element;
        },
        hide: (element) => element.style.display = 'none',
        show: (element) => element.style.display = '',
        toggle: (element) => element.style.display = element.style.display === 'none' ? '' : 'none'
    },

    // Date and time helpers
    date: {
        format: (date, format = 'dd/mm/yyyy') => {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            
            return format
                .replace('dd', day)
                .replace('mm', month)
                .replace('yyyy', year)
                .replace('HH', hours)
                .replace('MM', minutes);
        },
        
        timeAgo: (date) => {
            const now = new Date();
            const past = new Date(date);
            const diffMs = now - past;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffMins < 1) return 'Vừa xong';
            if (diffMins < 60) return `${diffMins} phút trước`;
            if (diffHours < 24) return `${diffHours} giờ trước`;
            if (diffDays < 7) return `${diffDays} ngày trước`;
            return Utils.date.format(date);
        }
    },

    // Validation helpers
    validate: {
        email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        password: (password) => password.length >= 6,
        url: (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        notEmpty: (value) => value && value.trim().length > 0
    },

    // UI helpers
    ui: {
        showLoading: (container) => {
            const spinner = Utils.dom.create('div', { class: 'loading-spinner' });
            container.innerHTML = '';
            container.appendChild(spinner);
        },
        
        showError: (container, message) => {
            container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
        },
        
        showSuccess: (container, message) => {
            container.innerHTML = `<div class="alert alert-success">${message}</div>`;
        },
        
        createModal: (title, content, actions = []) => {
            const modal = Utils.dom.create('div', { 
                class: 'modal fade', 
                tabindex: '-1' 
            }, `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">${content}</div>
                        <div class="modal-footer">
                            ${actions.map(action => 
                                `<button type="button" class="btn ${action.class}" onclick="${action.onclick}">${action.text}</button>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `);
            document.body.appendChild(modal);
            return modal;
        }
    },

    // Authentication helpers
    auth: {
        isLoggedIn: () => !!(Utils.storage.get('token') && Utils.storage.get('username')),
        
        getUserInfo: () => ({
            token: Utils.storage.get('token'),
            username: Utils.storage.get('username'),
            email: Utils.storage.get('email'),
            fullName: Utils.storage.get('fullName'),
            userId: Utils.storage.get('userId')
        }),
        
        logout: () => {
            Utils.storage.clear();
            window.location.reload();
        },
        
        requireAuth: () => {
            if (!Utils.auth.isLoggedIn()) {
                window.location.href = './login-register/login.html';
                return false;
            }
            return true;
        }
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format helpers
    format: {
        duration: (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m ${secs}s`;
        },
        
        number: (num) => num.toLocaleString('vi-VN'),
        
        fileSize: (bytes) => {
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            if (bytes === 0) return '0 Bytes';
            const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
        }
    }
};

// Export for use in other files
window.Utils = Utils;
