// Frontend Notification System
let notificationCheckInterval = null;
let lastNotificationCount = 0;
let isNotificationSystemInitialized = false; // Prevent multiple initialization

// API Configuration
const NOTIFICATION_CONFIG = {
    BASE_URL: 'http://localhost:8080/api/notifications',
    CHECK_INTERVAL: 30000, // Check every 30 seconds
    MAX_DISPLAY: 50, // Max notifications to display
    FADE_DURATION: 5000 // Auto-hide toast notifications after 5 seconds
};

// Initialize notification system
function initNotificationSystem() {
    // Prevent multiple initialization
    if (isNotificationSystemInitialized) {
        console.log('🔔 Notification system already initialized, skipping...');
        return;
    }
    
    console.log('🔔 Initializing notification system...');
    isNotificationSystemInitialized = true;
    
    // Setup notification bell click handler
    setupNotificationBell();
      // Show initial state in dropdown
    const listContainer = document.getElementById('notificationList');
    if (listContainer) {
        if (isUserLoggedIn()) {
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
    if (isUserLoggedIn()) {
        startNotificationPolling();
    }
    
    // Listen for login/logout events
    window.addEventListener('storage', handleStorageChange);
    
    console.log('✅ Notification system initialized');
}

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('token') && localStorage.getItem('username');
}

// Setup notification bell interactions
function setupNotificationBell() {
    const notificationBell = document.getElementById('notificationBellDisplay');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    console.log('🔔 Setting up notification bell...', { bell: !!notificationBell, dropdown: !!notificationDropdown });
    
    if (!notificationBell || !notificationDropdown) {
        console.warn('⚠️ Notification elements not found - bell:', !!notificationBell, 'dropdown:', !!notificationDropdown);
        return;    }
    
    // Initially hide dropdown
    notificationDropdown.classList.add('notification-dropdown-hidden');
    
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
    
    if (dropdown.classList.contains('notification-dropdown-hidden')) {
        showNotificationDropdown();
    } else {
        hideNotificationDropdown();
    }
}

// Show notification dropdown
function showNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;
    
    // Close user dropdown if open to avoid conflicts
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown && userDropdown.classList.contains('active')) {
        userDropdown.classList.remove('active');
    }
    
    dropdown.classList.remove('notification-dropdown-hidden');
    
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
        dropdown.classList.add('notification-dropdown-hidden');
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
        if (isUserLoggedIn()) {
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
        
        console.log('🔄 Checking unread count...');
        
        const response = await fetch(`${NOTIFICATION_CONFIG.BASE_URL}/unread-count`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const count = await response.json();
            console.log('📊 Unread count received:', count);
            updateNotificationBadge(count);
            
            // Show toast for new notifications
            if (count > lastNotificationCount && lastNotificationCount > 0) {
                showNewNotificationToast(count - lastNotificationCount);
            }
            lastNotificationCount = count;
        } else {
            console.error('❌ Failed to check unread count:', response.status);
            // Keep the current badge state instead of resetting
        }
    } catch (error) {
        console.error('❌ Error checking unread count:', error);
        // For demo purposes, show a demo count when API fails
        if (lastNotificationCount === 0) {
            console.log('🔄 API failed, showing demo badge count...');
            updateNotificationBadge(3); // Demo count
            lastNotificationCount = 3;
        }
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
    if (!isUserLoggedIn()) {
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
        
        console.log('🔄 Attempting to fetch notifications...');
        
        const response = await fetch(`${NOTIFICATION_CONFIG.BASE_URL}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Notifications API response:', response.status, response.ok);
        
        if (response.ok) {
            const notifications = await response.json();
            console.log('✅ Notifications loaded successfully:', notifications);
            displayNotifications(notifications);
        } else {
            console.error('❌ Failed to load notifications:', response.status);
            displayNotificationError('Không thể tải thông báo');
        }
    } catch (error) {
        console.error('❌ Error loading notifications:', error);
        
        // Show mock notifications for demo purposes when API fails
        console.log('🔄 API failed, showing demo notifications...');
        displayDemoNotifications();
    }
}

// Display demo notifications when API fails
function displayDemoNotifications() {
    const listContainer = document.getElementById('notificationList');
    if (!listContainer) return;
    
    // Create demo notifications for testing
    const demoNotifications = [
        {
            id: 'demo-1',
            type: 'ACHIEVEMENT',
            title: 'Thành tựu mới!',
            content: 'Bạn đã mở khóa thành tựu "Người xem tích cực"',
            createdAt: new Date().toISOString(),
            isRead: false
        },
        {
            id: 'demo-2',
            type: 'LIKE',
            title: 'Ai đó đã thích',
            content: 'Có người đã thích bình luận của bạn về phim "Dragon Ball Z"',
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            isRead: true
        },
        {
            id: 'demo-3',
            type: 'SYSTEM',
            title: 'Chào mừng!',
            content: 'Chào mừng bạn đến với hệ thống xem phim Maxion',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            isRead: false
        }
    ];
    
    console.log('📋 Displaying demo notifications:', demoNotifications);
    displayNotifications(demoNotifications);
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
function handleStorageChange(e) {    if (e.key === 'token' || e.key === 'username') {
        if (isUserLoggedIn()) {
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
    console.log('🧪 Creating test notification:', { type, title, content });
    
    if (!isUserLoggedIn()) {
        alert('Vui lòng đăng nhập để tạo thông báo test!');
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        // Get user ID
        let userId = localStorage.getItem('userId');
        if (!userId) {
            const userResponse = await fetch('http://localhost:8080/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                userId = userData.id;
                localStorage.setItem('userId', userId);
            } else {
                throw new Error('Không thể lấy thông tin user');
            }
        }
        
        // Create test notification
        const response = await fetch('http://localhost:8080/api/notifications', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                type: type,
                title: title,
                message: content,
                isRead: false
            })
        });
        
        if (response.ok) {
            console.log('✅ Test notification created successfully');
            
            // Update notification count immediately
            checkUnreadCount();
            
            // Show success message
            showNotificationToast(`Test notification "${title}" đã được tạo!`, 'success');
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to create test notification:', errorText);
            showNotificationToast('Không thể tạo test notification: ' + errorText, 'error');
        }
        
    } catch (error) {
        console.error('❌ Error creating test notification:', error);
        showNotificationToast('Lỗi tạo test notification: ' + error.message, 'error');
    }
}

// Toast notification function
function showNotificationToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        max-width: 350px;
        word-wrap: break-word;
        animation: slideInRight 0.3s ease-out;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Debug function for notification system
function debugNotificationSystem() {
    console.log('=== NOTIFICATION SYSTEM DEBUG ===');
    
    // Check elements
    const bell = document.getElementById('notificationBellDisplay');
    const dropdown = document.getElementById('notificationDropdown');
    const list = document.getElementById('notificationList');
    const badge = document.getElementById('notificationBadge');
    
    console.log('📍 Elements check:', {
        bell: !!bell,
        dropdown: !!dropdown,
        list: !!list,
        badge: !!badge
    });
    
    // Check login status
    console.log('🔐 Login status:', {
        logged_in: isUserLoggedIn(),
        token: !!localStorage.getItem('token'),
        username: localStorage.getItem('username'),
        userId: localStorage.getItem('userId')
    });
    
    // Check dropdown state
    if (dropdown) {
        console.log('📋 Dropdown state:', {
            display: dropdown.style.display,
            has_hidden_class: dropdown.classList.contains('notification-dropdown-hidden'),
            computed_display: window.getComputedStyle(dropdown).display
        });
    }
    
    console.log('⚙️ Notification config:', NOTIFICATION_CONFIG);
    console.log('🔄 Polling active:', !!notificationCheckInterval);
    
    alert('Debug info đã được ghi vào console. Mở Developer Tools (F12) để xem chi tiết.');
}

// Test function to manually toggle dropdown
function testToggleDropdown() {
    console.log('🧪 Testing dropdown toggle...');
    
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) {
        console.error('❌ Dropdown not found!');
        return;
    }
    
    console.log('📋 Current dropdown state:', {
        hasHiddenClass: dropdown.classList.contains('notification-dropdown-hidden'),
        display: dropdown.style.display,
        computedDisplay: window.getComputedStyle(dropdown).display,
        opacity: window.getComputedStyle(dropdown).opacity,
        visibility: window.getComputedStyle(dropdown).visibility
    });
    
    // Force toggle
    if (dropdown.classList.contains('notification-dropdown-hidden')) {
        dropdown.classList.remove('notification-dropdown-hidden');
        console.log('✅ Removed hidden class');
    } else {
        dropdown.classList.add('notification-dropdown-hidden');
        console.log('✅ Added hidden class');
    }
    
    // Check state after toggle
    console.log('📋 After toggle state:', {
        hasHiddenClass: dropdown.classList.contains('notification-dropdown-hidden'),
        display: dropdown.style.display,
        computedDisplay: window.getComputedStyle(dropdown).display,
        opacity: window.getComputedStyle(dropdown).opacity,
        visibility: window.getComputedStyle(dropdown).visibility
    });
}

// Force show dropdown for testing
function forceShowNotificationDropdown() {
    console.log('🔧 Force showing notification dropdown...');
    
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) {
        console.error('❌ Dropdown not found!');
        return;
    }
    
    // Remove hidden class and force show
    dropdown.classList.remove('notification-dropdown-hidden');
    dropdown.style.display = 'block';
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    
    // Load demo notifications
    displayDemoNotifications();
    
    console.log('✅ Dropdown force shown with demo data');
}

// Make function globally available
window.forceShowNotificationDropdown = forceShowNotificationDropdown;

// Make functions globally available
window.createTestNotification = createTestNotification;
window.showNotificationToast = showNotificationToast;
window.debugNotificationSystem = debugNotificationSystem;
window.testToggleDropdown = testToggleDropdown;

// Global functions
window.markAllNotificationsRead = markAllNotificationsRead;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
} else {
    initNotificationSystem();
}

console.log('📦 Notification system module loaded');
