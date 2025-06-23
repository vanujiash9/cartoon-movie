import { trackUserAction } from './js/user-actions.js';

// Like/Dislike Functionality
class LikeDislikeManager {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api/comments';
        this.isLoggedIn = this.checkLoginStatus();
        this.init();
    }

    checkLoginStatus() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        return !!(token && username);
    }

    init() {
        // Initialize like/dislike buttons on page load
        this.initializeButtons();
        
        // Listen for login status changes
        window.addEventListener('storage', () => {
            this.isLoggedIn = this.checkLoginStatus();
        });
    }

    initializeButtons() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadAllLikeData();
        });
    }

    async loadAllLikeData() {
        const commentElements = document.querySelectorAll('[data-comment-id]');
        
        for (const element of commentElements) {
            const commentId = element.getAttribute('data-comment-id');
            if (commentId) {
                await this.loadLikeData(commentId);
            }
        }
    }

    async loadLikeData(commentId) {
        try {
            const response = await fetch(`${this.baseUrl}/${commentId}/likes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.isLoggedIn && {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    })
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateUI(commentId, data);
            } else {
                console.error('Failed to load like data for comment:', commentId);
            }
        } catch (error) {
            console.error('Error loading like data:', error);
        }
    }

    updateUI(commentId, data) {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentElement) return;

        // Update like count
        const likeCountElement = commentElement.querySelector('.like-count');
        if (likeCountElement) {
            likeCountElement.textContent = data.likeCount || 0;
        }

        // Update dislike count
        const dislikeCountElement = commentElement.querySelector('.dislike-count');
        if (dislikeCountElement) {
            dislikeCountElement.textContent = data.dislikeCount || 0;
        }

        // Update button states
        const likeBtn = commentElement.querySelector('.like-btn');
        const dislikeBtn = commentElement.querySelector('.dislike-btn');

        if (likeBtn && dislikeBtn) {
            // Reset active states
            likeBtn.classList.remove('active');
            dislikeBtn.classList.remove('active');

            // Set active state based on user action
            if (data.userAction === 'liked') {
                likeBtn.classList.add('active');
            } else if (data.userAction === 'disliked') {
                dislikeBtn.classList.add('active');
            }
        }
    }

    async toggleLike(commentId, isLike = true) {
        if (!this.isLoggedIn) {
            this.showFeedback('Bạn cần đăng nhập để thực hiện hành động này', 'error');
            return;
        }

        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        const button = commentElement.querySelector(isLike ? '.like-btn' : '.dislike-btn');
        
        // Set loading state
        button.classList.add('loading');

        try {
            const response = await fetch(`${this.baseUrl}/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ isLike })
            });

            if (response.ok) {
                const data = await response.json();
                this.updateUI(commentId, data);

                // Track achievement progress for 'like' action
                if (isLike) {
                    trackUserAction('LIKE_COMMENT');
                }
            } else {
                this.showFeedback(data.message || 'Có lỗi xảy ra', 'error');
            }

        } catch (error) {
            console.error('Error toggling like:', error);
            this.showFeedback('Không thể kết nối đến server', 'error');
        } finally {
            // Remove loading state
            button.classList.remove('loading');
        }
    }

    showFeedback(message, type = 'success') {
        // Remove existing feedback
        const existing = document.querySelector('.action-feedback');
        if (existing) {
            existing.remove();
        }

        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `action-feedback ${type}`;
        feedback.textContent = message;
        
        document.body.appendChild(feedback);

        // Auto remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 2000);
    }

    // Create like/dislike buttons HTML
    createButtons(commentId, likeCount = 0, dislikeCount = 0, userAction = 'none') {
        return `
            <div class="comment-actions" data-comment-id="${commentId}">
                <div class="like-dislike-group">
                    <button class="like-btn ${userAction === 'liked' ? 'active' : ''}" 
                            onclick="likeManager.toggleLike(${commentId}, true)">
                        <span class="like-icon">👍</span>
                        <span class="like-count">${likeCount}</span>
                    </button>
                    <button class="dislike-btn ${userAction === 'disliked' ? 'active' : ''}" 
                            onclick="likeManager.toggleLike(${commentId}, false)">
                        <span class="dislike-icon">👎</span>
                        <span class="dislike-count">${dislikeCount}</span>
                    </button>
                </div>
                <button class="reply-btn" onclick="replyToComment(${commentId})">
                    <span class="reply-icon">💬</span>
                    <span>Trả lời</span>
                </button>
                <div class="comment-stats">
                    <div class="stat-item">
                        <span class="stat-icon">👁️</span>
                        <span>Đã xem</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the like/dislike manager
const likeManager = new LikeDislikeManager();

// Helper function for reply (can be implemented later)
function replyToComment(commentId) {
    console.log('Reply to comment:', commentId);
    likeManager.showFeedback('Tính năng trả lời đang được phát triển', 'info');
}

// Export for use in other scripts
window.LikeDislikeManager = LikeDislikeManager;
window.likeManager = likeManager;
