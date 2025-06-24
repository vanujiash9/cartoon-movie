// Tracking system for user achievements
class UserActionTracker {
    constructor() {
        this.userId = localStorage.getItem('userId');
        this.username = localStorage.getItem('username');
        this.sessionActions = new Set(); // Theo dõi hành động trong session hiện tại
        this.init();
    }

    init() {
        if (this.userId || this.username) {
            console.log('🎯 UserActionTracker initialized for user:', this.username || this.userId);
            this.setupEventListeners();
        } else {
            console.log('❌ UserActionTracker: No user logged in');
        }
    }

    // Thiết lập các event listener cho các hành động người dùng
    setupEventListeners() {
        // Theo dõi xem video (movie watching)
        this.trackVideoWatching();
        
        // Theo dõi viết bình luận/đánh giá
        this.trackCommentActions();
        
        // Theo dõi chia sẻ
        this.trackSharingActions();
        
        // Theo dõi like/dislike
        this.trackLikeActions();
    }

    // Theo dõi hành động xem video
    trackVideoWatching() {
        const video = document.getElementById('videoElement');
        if (!video) return;

        let watchStartTime = Date.now();
        let hasTrackedFirstWatch = false;
        let hasTrackedHalfway = false;
        let movieId = this.getCurrentMovieId();

        video.addEventListener('play', () => {
            watchStartTime = Date.now();
            console.log('🎬 Video started playing, movieId:', movieId);
        });

        video.addEventListener('timeupdate', () => {
            if (!movieId) movieId = this.getCurrentMovieId();
            
            const currentTime = video.currentTime;
            const duration = video.duration;
            const progress = (currentTime / duration) * 100;

            // Theo dõi lần xem đầu tiên (First Watch)
            if (!hasTrackedFirstWatch && currentTime > 30) { // Xem ít nhất 30 giây
                this.trackAction('WATCH_MOVIE', movieId);
                hasTrackedFirstWatch = true;
            }

            // Theo dõi xem 50% phim (Movie Buff - đếm phim khác nhau)
            if (!hasTrackedHalfway && progress >= 50) {
                this.trackAction('WATCH_DIFFERENT_MOVIES', movieId);
                hasTrackedHalfway = true;
            }
        });

        video.addEventListener('ended', () => {
            const watchDuration = Date.now() - watchStartTime;
            console.log('🎬 Video ended, watch duration:', watchDuration / 1000, 'seconds');
            
            // Theo dõi hoàn thành phim
            if (watchDuration > 60000) { // Xem ít nhất 1 phút
                this.trackAction('COMPLETE_MOVIE', movieId);
            }
        });
    }

    // Theo dõi hành động bình luận/đánh giá
    trackCommentActions() {
        // Override form submit cho comment form
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.classList.contains('comment-form') || form.id === 'commentForm') {
                console.log('📝 Comment submitted');
                // Đợi một chút để form được submit thành công trước khi track
                setTimeout(() => {
                    this.trackAction('REVIEW', this.getCurrentMovieId());
                }, 500);
            }
        });

        // Theo dõi click vào button submit comment
        document.addEventListener('click', (event) => {
            const button = event.target;
            if (button.type === 'submit' && (button.textContent.includes('Gửi') || button.textContent.includes('Submit'))) {
                const form = button.closest('form');
                if (form && form.querySelector('textarea')) {
                    console.log('📝 Comment button clicked');
                    setTimeout(() => {
                        this.trackAction('REVIEW', this.getCurrentMovieId());
                    }, 500);
                }
            }
        });
    }

    // Theo dõi hành động chia sẻ
    trackSharingActions() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            
            // Theo dõi các nút chia sẻ
            if (element.classList.contains('share-btn') || 
                element.closest('.share-btn') ||
                element.textContent.includes('Chia sẻ') ||
                element.textContent.includes('Share')) {
                
                console.log('📱 Share action detected');
                this.trackAction('SHARE', this.getCurrentMovieId());
            }
        });
    }

    // Theo dõi hành động like/dislike
    trackLikeActions() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            
            // Theo dõi like button
            if (element.classList.contains('like-btn') || 
                element.closest('.like-btn') ||
                element.classList.contains('thumb-up')) {
                
                console.log('👍 Like action detected');
                this.trackAction('LIKE', null);
            }
        });
    }

    // Lấy ID phim hiện tại
    getCurrentMovieId() {
        // Thử lấy từ URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        let movieId = urlParams.get('id') || urlParams.get('movieId') || urlParams.get('cartoon_id');
        
        // Thử lấy từ global variables
        if (!movieId && typeof window.movieId !== 'undefined') {
            movieId = window.movieId;
        }
        
        // Thử lấy từ data attributes
        if (!movieId) {
            const movieElement = document.querySelector('[data-movie-id]');
            if (movieElement) {
                movieId = movieElement.getAttribute('data-movie-id');
            }
        }
        
        return movieId;
    }

    // Hàm chính để track action
    trackAction(actionType, movieId = null) {
        const actionKey = `${actionType}_${movieId || 'general'}`;
        
        // Tránh gửi cùng một action nhiều lần trong session
        if (this.sessionActions.has(actionKey)) {
            console.log(`⚠️ Action ${actionType} already tracked in this session`);
            return;
        }

        console.log(`🚀 Tracking action: ${actionType}`, { movieId, userId: this.userId });
        
        if (window.MaxionAPI && window.MaxionAPI.sendAchievementUpdate) {
            window.MaxionAPI.sendAchievementUpdate(this.userId, actionType, movieId)
                .then(response => {
                    if (response.success) {
                        console.log(`✅ Achievement progress updated for ${actionType}`);
                        this.sessionActions.add(actionKey);
                        
                        // Dispatch event để thông báo achievement được cập nhật
                        const event = new CustomEvent('achievement-progress-updated', {
                            detail: { actionType, movieId }
                        });
                        document.dispatchEvent(event);
                    } else {
                        console.error(`❌ Failed to update achievement: ${actionType}`, response);
                    }
                })
                .catch(error => {
                    console.error(`🔥 Error tracking action ${actionType}:`, error);
                });
        } else {
            console.error('❌ MaxionAPI.sendAchievementUpdate not available');
        }
    }

    // Public method để track action từ bên ngoài
    track(actionType, movieId = null) {
        this.trackAction(actionType, movieId);
    }
}

// Function to track user actions and update achievements (backward compatibility)
function trackUserAction(actionType, cartoonId = null) {
    if (window.userActionTracker) {
        window.userActionTracker.track(actionType, cartoonId);
    } else {
        console.warn('UserActionTracker not initialized');
    }
}

// Initialize tracker when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.userActionTracker = new UserActionTracker();
    console.log('🎯 UserActionTracker initialized');
});

// Make the function and tracker globally accessible
window.trackUserAction = trackUserAction;
window.UserActionTracker = UserActionTracker;
