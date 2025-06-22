// shared-api.js - Shared API functions for Maxion Frontend

// API Configuration
const API_BASE = 'http://localhost:8080';

// Auth Helper Functions
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Generic API Call Function
async function apiCall(url, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const authToken = getAuthToken();
        if (authToken) {
            options.headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(API_BASE + url, options);
        
        // Handle different response types
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const textData = await response.text();
            try {
                data = JSON.parse(textData);
            } catch (e) {
                data = textData;
            }
        }
        
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// Social Sharing API
async function recordShare(cartoonId, platform) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
        throw new Error('User not logged in');
    }
    
    const result = await apiCall('/api/social/share', 'POST', {
        userId: currentUser.id,
        cartoonId: parseInt(cartoonId),
        platform
    });
    
    if (!result.success) {
        throw new Error(result.data?.message || 'Failed to record share');
    }
    
    return result;
}

// Referral API
async function generateReferral() {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
        throw new Error('User not logged in');
    }
    
    const result = await apiCall('/api/referral/generate', 'POST', {
        userId: currentUser.id
    });
    
    if (!result.success) {
        throw new Error(result.data?.message || 'Failed to generate referral');
    }
    
    return result;
}

// Achievements API
async function getUserAchievements() {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
        throw new Error('User not logged in');
    }
    
    const result = await apiCall(`/api/achievements/progress/${currentUser.id}`);
    
    if (!result.success) {
        throw new Error(result.data?.message || 'Failed to get achievements');
    }
    
    return result;
}

async function triggerAchievementCheck() {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return;
    
    try {
        await apiCall(`/api/achievements/check/${currentUser.id}`, 'POST');
    } catch (error) {
        console.error('Error triggering achievement check:', error);
    }
}

// High-level Social Sharing Functions
async function shareMovie(cartoonId, platform, options = {}) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
        if (options.showAlert !== false) {
            alert('Vui lòng đăng nhập để chia sẻ và nhận thành tựu!');
        }
        return false;
    }
    
    try {
        await recordShare(cartoonId, platform);
        console.log(`✅ Share recorded: Movie ${cartoonId} on ${platform}`);
        
        // Trigger achievement check after successful share
        await triggerAchievementCheck();
        
        return true;
    } catch (error) {
        console.error('❌ Share failed:', error);
        if (options.showAlert !== false) {
            alert(error.message || 'Không thể ghi nhận chia sẻ. Vui lòng thử lại.');
        }
        return false;
    }
}

// Utility Functions
function showNotification(message, type = 'success', duration = 4000) {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// Social Platform Share URLs
function getShareUrl(platform, url, text = '') {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    
    switch (platform.toLowerCase()) {
        case 'facebook':
            return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        case 'twitter':
            return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        case 'telegram':
            return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        default:
            return url;
    }
}

// Copy to clipboard utility
async function copyToClipboard(text, successMessage = 'Đã sao chép!') {
    try {
        await navigator.clipboard.writeText(text);
        showNotification(successMessage, 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        showNotification('Không thể sao chép. Vui lòng thử lại.', 'error');
        return false;
    }
}

// Make functions globally available
window.MaxionAPI = {
    apiCall,
    shareMovie,
    recordShare,
    generateReferral,
    getUserAchievements,
    triggerAchievementCheck,
    showNotification,
    getShareUrl,
    copyToClipboard,
    getCurrentUser,
    getAuthToken
};
