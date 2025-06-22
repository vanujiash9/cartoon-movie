// Frontend Notification System
let notificationCheckInterval = null;
let lastNotificationCount = 0;

// API Configuration
const NOTIFICATION_CONFIG = {
    BASE_URL: 'http://localhost:8080/api/notifications',
    CHECK_INTERVAL: 30000, // Check every 30 seconds
    MAX_DISPLAY: 50, // Max notifications to display
    FADE_DURATION: 5000 // Auto-hide toast notifications after 5 seconds
};

// Initialize notification system
function initNotificationSystem() {
    console.log('🔔 Initializing notification system...');
    
    // Setup notification bell click handler
    setupNotificationBell();
    
    // Show initial state in dropdown
    const listContainer = document.getElementById('notificationList');
    if (listContainer) {
        if (isLoggedIn()) {
            listContainer.innerHTML = `
                <div class="notification-empty">
                    <div class="notification-empty-icon">🔔</div>
                    <div class="notification-empty-text">Chưa có thông báo</div>
                    <div class="notification-empty-subtext">Hover vào chuông để xem thông báo mới</div>
                </div>
            `;
        } else {
            listContainer.innerHTML = `
                <div class="notification-empty">
                    <div class="notification-empty-icon">🔐</div>
                    <div class="notification-empty-text">Vui lòng đăng nhập</div>
                    <div class="notification-empty-subtext">Đăng nhập để xem thông báo của bạn</div>
                </div>
            `;
        }
    }
    
    // Start checking for new notifications if user is logged in
    if (isLoggedIn()) {
        startNotificationPolling();
    }
    
    // Listen for login/logout events
    window.addEventListener('storage', handleStorageChange);
    
    console.log('✅ Notification system initialized');
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') && localStorage.getItem('username');
}

// Setup notification bell interactions
function setupNotificationBell() {
    const notificationBell = document.getElementById('notificationBell');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    if (!notificationBell || !notificationDropdown) {
        console.warn('⚠️ Notification elements not found');
        return;
    }
    
    // Initially hide dropdown
    notificationDropdown.style.display = 'none';
    
    // Toggle dropdown on bell click
    notificationBell.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotificationDropdown();
    });
    
    // Show dropdown on hover
    notificationBell.addEventListener('mouseenter', () => {
        showNotificationDropdown();
    });
    
    // Hide dropdown when mouse leaves the bell area
    notificationBell.addEventListener('mouseleave', (e) => {
        // Add delay to allow user to move to dropdown
        setTimeout(() => {
            if (!notificationDropdown.matches(':hover') && !notificationBell.matches(':hover')) {
                hideNotificationDropdown();
            }
        }, 200);
    });
    
    // Keep dropdown open when hovering over it
    notificationDropdown.addEventListener('mouseenter', () => {
        // Cancel any pending hide
        clearTimeout(notificationDropdown.hideTimeout);
    });
    
    // Hide when leaving dropdown
    notificationDropdown.addEventListener('mouseleave', () => {
        hideNotificationDropdown();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationBell.contains(e.target) && !notificationDropdown.contains(e.target)) {
            hideNotificationDropdown();
        }
    });
    
    console.log('✅ Notification bell setup complete');
}

// Toggle notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    
    if (dropdown.style.display === 'none' || !dropdown.style.display) {
        showNotificationDropdown();
    } else {
        hideNotificationDropdown();
    }
}

// Show notification dropdown
function showNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    
    dropdown.style.display = 'block';
    
    // If no notifications have been loaded yet, show loading
    const listContainer = document.getElementById('notificationList');
    if (listContainer && listContainer.innerHTML.trim() === '') {
        listContainer.innerHTML = `
            <div class="notification-loading">
                <div class="notification-loading-spinner"></div>
                <div>Đang tải thông báo...</div>
            </div>
        `;
    }
    
    loadNotifications();
    console.log('📖 Notification dropdown opened');
}

// Hide notification dropdown
function hideNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    
    // Add small delay for better UX
    dropdown.hideTimeout = setTimeout(() => {
        dropdown.style.display = 'none';
        console.log('📕 Notification dropdown closed');
    }, 150);
}

// Start polling for new notifications
function startNotificationPolling() {
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
    }
    
    // Initial check
    checkUnreadCount();
    
    // Set up interval
    notificationCheckInterval = setInterval(() => {
        if (isLoggedIn()) {
            checkUnreadCount();
        } else {
            stopNotificationPolling();
        }
    }, NOTIFICATION_CONFIG.CHECK_INTERVAL);
    
    console.log('⏰ Notification polling started');
}

// Stop polling for notifications
function stopNotificationPolling() {
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
        notificationCheckInterval = null;
    }
    
    // Reset badge
    updateNotificationBadge(0);
    console.log('⏰ Notification polling stopped');
}

// Check unread notification count
async function checkUnreadCount() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${NOTIFICATION_CONFIG.BASE_URL}/unread-count`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const count = await response.json();
            updateNotificationBadge(count);
            
            // Show toast for new notifications
            if (count > lastNotificationCount && lastNotificationCount > 0) {
                showNewNotificationToast(count - lastNotificationCount);
            }
            lastNotificationCount = count;
        } else {
            console.error('❌ Failed to check unread count:', response.status);
        }
    } catch (error) {
        console.error('❌ Error checking unread count:', error);
    }
}

// Update notification badge
function updateNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    const bell = document.getElementById('notificationBell');
    
    if (!badge) return;
    
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count.toString();
        badge.style.display = 'block';
        
        // Add bell animation for new notifications
        if (count > lastNotificationCount && bell) {
            bell.classList.add('has-new');
            setTimeout(() => bell.classList.remove('has-new'), 500);
        }
    } else {
        badge.style.display = 'none';
    }
    
    console.log(`🔢 Badge updated: ${count}`);
}

// Load and display notifications
async function loadNotifications() {
    const listContainer = document.getElementById('notificationList');
    
    // Don't reload if we're not logged in
    if (!isLoggedIn()) {
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="notification-empty">
                    <div class="notification-empty-icon">🔐</div>
                    <div class="notification-empty-text">Vui lòng đăng nhập</div>
                    <div class="notification-empty-subtext">Đăng nhập để xem thông báo của bạn</div>
                </div>
            `;
        }
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Show loading if container is empty
        if (listContainer && listContainer.innerHTML.includes('Đang tải thông báo')) {
            // Keep the loading state
        }
        
        const response = await fetch(`${NOTIFICATION_CONFIG.BASE_URL}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const notifications = await response.json();
            displayNotifications(notifications);
        } else {
            console.error('❌ Failed to load notifications:', response.status);
            displayNotificationError('Không thể tải thông báo');
        }
    } catch (error) {
        console.error('❌ Error loading notifications:', error);
        displayNotificationError('Lỗi kết nối');
    }
}

// Display notifications in dropdown
function displayNotifications(notifications) {
    const listContainer = document.getElementById('notificationList');
    if (!listContainer) return;
    
    // Clear existing content
    listContainer.innerHTML = '';
    
    if (!notifications || notifications.length === 0) {
        listContainer.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">�</div>
                <div class="notification-empty-text">Chưa có thông báo</div>
                <div class="notification-empty-subtext">Thông báo sẽ xuất hiện ở đây khi có hoạt động mới</div>
            </div>
        `;
        return;
    }
    
    // Limit display count
    const displayNotifications = notifications.slice(0, NOTIFICATION_CONFIG.MAX_DISPLAY);
    
    displayNotifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification);
        listContainer.appendChild(notificationElement);
    });
    
    console.log(`📋 Displayed ${displayNotifications.length} notifications`);
}

// Create notification element
function createNotificationElement(notification) {
    const element = document.createElement('div');
    element.className = `notification-item ${notification.isRead ? 'read' : 'unread'}`;
    element.setAttribute('data-type', notification.type);
    
    // Format time
    const timeAgo = formatTimeAgo(new Date(notification.createdAt));
    
    // Get notification icon and color from type
    const typeInfo = getNotificationTypeInfo(notification.type);
    
    element.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${typeInfo.icon}</div>
            <div class="notification-text">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.content}</div>
                <div class="notification-time">${timeAgo}</div>
            </div>
            ${!notification.isRead ? '<div class="notification-unread-dot"></div>' : ''}
        </div>
    `;
    
    // Add click handler to mark as read
    element.addEventListener('click', () => {
        markNotificationAsRead(notification.id);
    });
    
    return element;
}

// Get notification type info
function getNotificationTypeInfo(type) {
    const typeMap = {
        'ACHIEVEMENT': { icon: '🏆', color: '#FFD700' },
        'LIKE': { icon: '❤️', color: '#FF6B6B' },
        'COMMENT': { icon: '💬', color: '#4ECDC4' },
        'REPLY': { icon: '↩️', color: '#45B7D1' },
        'PROFILE_UPDATE': { icon: '👤', color: '#96CEB4' },
        'SYSTEM': { icon: '⚙️', color: '#6C5CE7' },
        'WARNING': { icon: '⚠️', color: '#FDCB6E' },
        'SUCCESS': { icon: '✅', color: '#00B894' }
    };
    
    return typeMap[type] || { icon: '🔔', color: '#6C757D' };
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${NOTIFICATION_CONFIG.BASE_URL}/read/${notificationId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log(`✅ Marked notification ${notificationId} as read`);
            // Refresh notifications and count
            loadNotifications();
            checkUnreadCount();
        } else {
            console.error('❌ Failed to mark notification as read:', response.status);
        }
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
    }
}

// Mark all notifications as read
async function markAllNotificationsRead() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${NOTIFICATION_CONFIG.BASE_URL}/mark-all-read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Marked all notifications as read');
            // Refresh notifications and count
            loadNotifications();
            checkUnreadCount();
            showToastMessage('Đã đánh dấu tất cả thông báo đã đọc', 'success');
        } else {
            console.error('❌ Failed to mark all notifications as read:', response.status);
            showToastMessage('Không thể đánh dấu thông báo', 'error');
        }
    } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        showToastMessage('Lỗi kết nối', 'error');
    }
}

// Display notification error
function displayNotificationError(message) {
    const listContainer = document.getElementById('notificationList');
    if (!listContainer) return;
    
    listContainer.innerHTML = `
        <div class="notification-error">
            <div class="notification-error-icon">⚠️</div>
            <div>${message}</div>
        </div>
    `;
}

// Show new notification toast
function showNewNotificationToast(count) {
    const message = count === 1 ? 'Bạn có 1 thông báo mới' : `Bạn có ${count} thông báo mới`;
    showToastMessage(message, 'info');
}

// Show toast message
function showToastMessage(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.notification-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto remove after delay
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, NOTIFICATION_CONFIG.FADE_DURATION);
}

// Handle storage changes (login/logout)
function handleStorageChange(e) {
    if (e.key === 'token' || e.key === 'username') {
        if (isLoggedIn()) {
            console.log('🔐 User logged in, starting notifications');
            startNotificationPolling();
            loadNotifications();
        } else {
            console.log('🔐 User logged out, stopping notifications');
            stopNotificationPolling();
        }
    }
}

// Test function to create a test notification
async function createTestNotification(type = 'SYSTEM', title = 'Test Notification', content = 'This is a test notification') {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để test thông báo');
            return;
        }
        
        const response = await fetch(`${NOTIFICATION_CONFIG.BASE_URL}/test`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, title, content })
        });
        
        if (response.ok) {
            console.log('✅ Test notification created');
            showToastMessage('Đã tạo thông báo test', 'success');
            // Refresh notifications
            setTimeout(() => {
                checkUnreadCount();
                loadNotifications();
            }, 1000);
        } else {
            console.error('❌ Failed to create test notification:', response.status);
            showToastMessage('Không thể tạo thông báo test', 'error');
        }
    } catch (error) {
        console.error('❌ Error creating test notification:', error);
        showToastMessage('Lỗi kết nối', 'error');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-item:hover {
        background-color: #f5f5f5 !important;
    }
`;
document.head.appendChild(style);

// Global functions
window.markAllNotificationsRead = markAllNotificationsRead;
window.createTestNotification = createTestNotification;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
} else {
    initNotificationSystem();
}

console.log('📦 Notification system module loaded');
