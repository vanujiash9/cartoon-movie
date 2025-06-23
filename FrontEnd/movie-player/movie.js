// moive.js - Tách từ moive.html để code gọn gàng hơn
'use strict';

// DOM Elements
const video = document.getElementById('videoElement');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const progressContainer = document.getElementById('progressContainer');
const progressFilled = document.getElementById('progressFilled');
const progressThumb = document.getElementById('progressThumb');
const timeDisplay = document.getElementById('timeDisplay');
const volumeSlider = document.getElementById('volumeSlider');
const volumeFilled = document.getElementById('volumeFilled');
const volumeIcon = document.getElementById('volumeIcon');
const muteBtn = document.getElementById('muteBtn');
const fullscreenIcon = document.getElementById('fullscreenIcon');
const speedIcon = document.getElementById('speedIcon');
const videoControls = document.getElementById('videoControls');
const videoPlayer = document.getElementById('videoPlayer');
const videoContainer = document.getElementById('videoContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const qualitySelector = document.getElementById('qualitySelector');
const header = document.getElementById('header');
const theaterIcon = document.getElementById('theaterIcon');
const contentSection = document.getElementById('contentSection');
const pipContainer = document.getElementById('pipContainer');
const pipVideo = document.getElementById('pipVideo');
const notification = document.getElementById('notification');

// Video State
let isPlaying = false;
let isMuted = false;
let currentVolume = 0.7;
let currentSpeed = 1;
let isTheaterMode = false;
let isPiPActive = false;
let controlsTimeout;
let isFullscreen = false;
let subtitlesEnabled = false;
let hasTrackedHalfway = false; // Biến để theo dõi đã gửi sự kiện xem nửa phim chưa

// Playback speeds
const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
let currentSpeedIndex = 3; // 1x

// Movie data
let movieId = null; // Khởi tạo null, sẽ được gán lại trong DOMContentLoaded
let currentEpisodes = [];
let currentComments = [];
let currentUser = null; // Store current user info
let isAuthenticated = false; // Track authentication status

// Authentication and user management
async function checkAuthentication() {
    console.log('🔍 Checking authentication...');

    try {
        // First, check if user info is stored in localStorage
        const storedUser = localStorage.getItem('currentUser');
        console.log('📋 Stored user in localStorage:', storedUser);

        if (storedUser) {
            try {
                currentUser = JSON.parse(storedUser);

                // Validate user data has required fields
                if (currentUser && currentUser.username && currentUser.id) {
                    isAuthenticated = true;
                    console.log('✅ User found in localStorage:', currentUser);
                    return true;
                } else {
                    console.log('❌ Invalid user data structure:', currentUser);
                    localStorage.removeItem('currentUser');
                }
            } catch (e) {
                console.log('❌ Error parsing user data:', e);
                localStorage.removeItem('currentUser');
            }
        }

        // Also check simple username/token fields as backup
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');

        if (username) {
            // Create user object from individual fields
            currentUser = {
                id: localStorage.getItem('userId') || 1,
                username: username,
                fullName: localStorage.getItem('fullName') || username,
                email: localStorage.getItem('email') || ''
            };
            isAuthenticated = true;
            return true;
        }
        // If no stored user, try to check with server
        const response = await fetch('http://localhost:8080/api/auth/me', {
            method: 'GET',
            credentials: 'include', // Include cookies for session-based auth
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            isAuthenticated = true;
            // Store user info in localStorage for next time
            localStorage.setItem('currentUser', JSON.stringify(userData));
            console.log('✅ User authenticated from server:', currentUser);
            return true;
        } else {
            console.log('❌ Server authentication failed:', response.status);
            isAuthenticated = false;
            currentUser = null;
            localStorage.removeItem('currentUser');
            return false;
        }
    } catch (error) {
        console.error('💥 Authentication check failed:', error);
        isAuthenticated = false;
        currentUser = null;
        localStorage.removeItem('currentUser');
        return false;
    }
}

// Show login modal or redirect to login
function showLoginPrompt() {
    const loginChoice = confirm('Bạn cần đăng nhập để sử dụng tính năng này. Chuyển đến trang đăng nhập?');
    if (loginChoice) {
        window.location.href = '../login_register/login.html';
    }
}

// Like/Dislike state
let isLiked = false;
let isDisliked = false;
let likeCount = 0;
let dislikeCount = 0;

// Favorite state
let isFavorite = false;

// Comments state
let commentsVisible = false;

// ===== UTILITY FUNCTIONS =====

// Lấy id phim từ URL
function getMovieIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Format time
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Format time ago for comments
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return diffMins + ' phút trước';
    if (diffHours < 24) return diffHours + ' giờ trước';
    if (diffDays < 7) return diffDays + ' ngày trước';

    return date.toLocaleDateString('vi-VN');
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===== INITIALIZATION =====

// Debug function to check localStorage
function debugLocalStorage() {
    console.log('🔍 DEBUG: Checking localStorage...');
    console.log('currentUser:', localStorage.getItem('currentUser'));
    console.log('username:', localStorage.getItem('username'));
    console.log('token:', localStorage.getItem('token'));
    console.log('fullName:', localStorage.getItem('fullName'));
    console.log('email:', localStorage.getItem('email'));
    console.log('All localStorage:', localStorage);

    // Try to parse currentUser
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
        try {
            const parsed = JSON.parse(currentUserStr);
            console.log('✅ Parsed currentUser:', parsed);
        } catch (e) {
            console.log('❌ Error parsing currentUser:', e);
        }
    }
}

// Kiểm tra kết nối đến backend
async function checkBackendConnection() {
    try {
        // Sử dụng endpoint an toàn hơn (có thể là trang chủ hoặc endpoint kiểm tra kết nối)
        // Nếu /api/health không tồn tại, có thể gây lỗi không cần thiết
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 giây timeout
        
        const response = await fetch('http://localhost:8080/api/cartoons', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId); // Hủy timeout nếu request thành công
        
        if (response.ok) {
            console.log('✅ Kết nối đến backend thành công!');
            return true;
        }
        
        console.error('❌ Backend trả về lỗi:', response.status);
        return false;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ Kết nối đến backend timeout (quá 5 giây)');
        } else {
            console.error('❌ Lỗi kết nối đến backend:', error);
        }
        return false;
    }
}

// Initialize video player
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🎬 ========== BẮT ĐẦU KHỞI TẠO APP ==========');
    
    // Step 1: Get movieId from URL first
    movieId = getMovieIdFromUrl();
    console.log('🎬 MovieId từ URL:', movieId);
    
    if (!movieId) {
        console.error('❌ KHÔNG TÌM THẤY MOVIE ID TRONG URL!');
        showNotification('Lỗi: Không tìm thấy ID phim trong URL! Vui lòng truy cập từ trang chủ.', 'error');
        hideLoading();
        return;
    }
    
    // Step 2: Debug localStorage
    debugLocalStorage();
    
    // Step 3: Check authentication
    const authStatus = await checkAuthentication();
    console.log('🔍 Trạng thái xác thực:', authStatus, 'isAuthenticated:', isAuthenticated);
    updateAuthUI(authStatus);
    
    // Step 4: Initialize player and setup events
    console.log('🎬 Khởi tạo player và thiết lập sự kiện...');
    showLoading();
    
    initializePlayer();
    setupEventListeners();
    
    // Step 5: Debug check elements
    debugApp();
    
    // Step 6: Load movie data
    console.log('🎬 ========== BẮT ĐẦU TẢI DỮ LIỆU PHIM ==========');
    
    try {
        // Check backend connection first
        console.log('🔗 Kiểm tra kết nối backend...');
        const isBackendConnected = await checkBackendConnection();
        
        if (!isBackendConnected) {
            console.warn('⚠️ Kết nối backend không ổn định');
            showNotification('Kết nối không ổn định. Đang thử tải dữ liệu...', 'warning');
        }
        
        // Load movie data and episodes
        console.log('🎬 Đang tải thông tin phim...');
        await loadMovieDataAsync();
        
        // Hide loading after successful load
        hideLoading();
        
    } catch (error) {
        console.error('❌ LỖI NGHIÊM TRỌNG KHI KHỞI TẠO:', error);
        showNotification('Lỗi: ' + error.message, 'error');
        hideLoading();
        
        // Show error UI
        const movieDetails = document.querySelector('.movie-details');
        if (movieDetails) {
            movieDetails.innerHTML = `
                <div class="error-container">
                    <h2>Không thể tải ứng dụng</h2>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()">Thử lại</button>
                    <button onclick="forceLoadMovie()">Thử lại tải phim</button>
                </div>
            `;
        }
    }
    
    // Step 7: Load comments after delay
    setTimeout(() => {
        console.log('🎬 Tải bình luận...');
        loadComments();
    }, 2000);
    
    // Step 8: Load like/dislike state if authenticated
    if (isAuthenticated && currentUser) {
        setTimeout(async () => {
            try {
                console.log('🎬 Tải trạng thái like/dislike...');
                await loadLikeDislikeState();
            } catch (error) {
                console.error('❌ Lỗi khi load trạng thái like/dislike:', error);
            }
        }, 1500);
    }
    
    console.log('🎬 ========== HOÀN THÀNH KHỞI TẠO ==========');
});

// Update UI based on authentication status
function updateAuthUI(isAuth) {
    const authPrompt = document.getElementById('auth-prompt');
    const commentFormContainer = document.getElementById('comment-form-container');
    const userInfo = document.getElementById('user-info');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    if (isAuth && currentUser) {
        // User is authenticated, show comment form and user info
        if (authPrompt) authPrompt.style.display = 'none';
        if (commentFormContainer) commentFormContainer.style.display = 'block';

        // Show user info in header
        if (userInfo) userInfo.style.display = 'flex';
        if (userAvatar) userAvatar.textContent = currentUser.avatar || currentUser.fullName.substring(0, 1).toUpperCase();
        if (userName) userName.textContent = currentUser.fullName || currentUser.username;

    } else {
        // User is not authenticated, show login prompt
        if (authPrompt) authPrompt.style.display = 'block';
        if (commentFormContainer) commentFormContainer.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }
}

function initializePlayer() {
    console.log('🎬 Khởi tạo video player...');
    
    // Kiểm tra video element có tồn tại không
    if (!video) {
        console.error('❌ Không tìm thấy video element! Kiểm tra lại HTML.');
        showNotification('Lỗi: Không tìm thấy video player!', 'error');
        return;
    }
    
    console.log('✅ Video element đã được tìm thấy:', video);
    
    // Khởi tạo các giá trị mặc định
    if (video) {
        video.volume = currentVolume;
        video.currentTime = 0;
        console.log('✅ Đã thiết lập volume và thời gian cho video');
    }
    
    updateVolumeDisplay();
    updateSpeedDisplay();
    updateProgress();
    
    console.log('✅ Player được khởi tạo thành công');
}

function setupEventListeners() {
    console.log('🎬 Thiết lập event listeners...');
    
    if (!video) {
        console.error('❌ Không thể thiết lập event listeners: video element không tồn tại!');
        return;
    }
    
    console.log('✅ Đang thiết lập các sự kiện cho video element...');

    // Video events
    video.addEventListener('loadstart', showLoading);
    video.addEventListener('canplay', hideLoading);
    video.addEventListener('waiting', showLoading);
    video.addEventListener('playing', hideLoading);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', onVideoEnded);
    video.addEventListener('play', () => {
        isPlaying = true;
        if (playIcon) playIcon.textContent = '⏸';
    });
    video.addEventListener('pause', () => {
        isPlaying = false;
        if (playIcon) playIcon.textContent = '▶';
    });

    // Progress bar
    if (progressContainer) {
        progressContainer.addEventListener('click', seek);
        progressContainer.addEventListener('mousemove', showProgressPreview);
    }

    // Volume control
    if (volumeSlider) {
        volumeSlider.addEventListener('click', setVolume);
    }

    // Controls visibility
    if (videoPlayer) {
        videoPlayer.addEventListener('mouseenter', showControls);
        videoPlayer.addEventListener('mouseleave', hideControlsDelayed);
        videoPlayer.addEventListener('mousemove', showControls);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Click to play/pause
    video.addEventListener('click', togglePlayPause);

    // Auto-hide header when playing
    video.addEventListener('play', () => {
        if (isPlaying) {
            setTimeout(() => {
                if (isPlaying && !videoPlayer.matches(':hover') && header) {
                    header.classList.add('hidden');
                }
            }, 3000);
        }
    }); video.addEventListener('pause', () => {
        if (header) {
            header.classList.remove('hidden');
        }
    });

    // Fullscreen change
    document.addEventListener('fullscreenchange', updateFullscreenIcon);

    // Auto-hide header on scroll
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY; if (currentScrollY > lastScrollY && currentScrollY > 100) {
            if (header) header.classList.add('hidden');
        } else {
            if (header) header.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    });    // Click outside to close quality selector
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.quality-selector') && !e.target.closest('[onclick*="toggleQuality"]')) {
            if (qualitySelector) {
                qualitySelector.classList.remove('active');
            }
        }
    });    // Initialize focus for keyboard controls
    if (videoPlayer) {
        videoPlayer.setAttribute('tabindex', '0');
        videoPlayer.focus();
    }
    
    console.log('✅ Event listeners đã được thiết lập thành công');
}

// Debug function to test elements and API
function debugApp() {
    console.log('🔍 ========== DEBUGGING APP STATE ==========');
    console.log('📊 Thông tin cơ bản:');
    console.log('  - Movie ID:', movieId);
    console.log('  - URL search params:', window.location.search);
    console.log('  - Current episodes count:', currentEpisodes?.length || 0);
    console.log('  - Is authenticated:', isAuthenticated);
    console.log('  - Current user:', currentUser);
    
    console.log('📋 Các element quan trọng:');
    console.log('  - Video element:', !!document.getElementById('videoElement'));
    console.log('  - Episodes container:', !!document.getElementById('episodes-container'));
    console.log('  - Movie title element:', !!document.querySelector('.movie-details h1'));
    console.log('  - Loading overlay:', !!document.getElementById('loadingOverlay'));
    console.log('  - Notification element:', !!document.getElementById('notification'));
    console.log('  - Movie meta elements:');
    console.log('    - Rating:', !!document.getElementById('movieRating'));
    console.log('    - Year:', !!document.getElementById('movieYear'));
    console.log('    - Duration:', !!document.getElementById('movieDuration'));
    console.log('    - Genre:', !!document.getElementById('movieGenre'));
    
    // Test API endpoints
    console.log('🌐 Testing API endpoints...');
    
    if (movieId) {
        fetch(`http://localhost:8080/api/cartoons/${movieId}`)
            .then(res => {
                console.log('  - Movie API status:', res.status, res.ok ? '✅' : '❌');
                return res.ok ? res.json() : Promise.reject('Failed');
            })
            .then(data => console.log('  - Movie data:', data))
            .catch(err => console.log('  - Movie API error:', err));
            
        fetch(`http://localhost:8080/api/cartoons/${movieId}/episodes`)
            .then(res => {
                console.log('  - Episodes API status:', res.status, res.ok ? '✅' : '❌');
                return res.ok ? res.json() : Promise.reject('Failed');
            })
            .then(data => console.log('  - Episodes data:', data))
            .catch(err => console.log('  - Episodes API error:', err));
    }
    
    console.log('🔍 ========== END DEBUG ==========');
}

// Force reload functions for debugging
window.forceLoadMovie = async function() {
    console.log('🔧 ========== FORCE LOADING MOVIE ==========');
    try {
        if (!movieId) {
            movieId = getMovieIdFromUrl();
            console.log('Updated movieId:', movieId);
        }
        
        if (!movieId) {
            throw new Error('No movieId found!');
        }
        
        await loadMovieDataAsync();
        console.log('✅ Force load movie completed');
    } catch (error) {
        console.error('❌ Force load movie failed:', error);
        showNotification('Force load failed: ' + error.message, 'error');
    }
};

window.forceLoadEpisodes = async function() {
    console.log('🔧 ========== FORCE LOADING EPISODES ==========');
    try {
        if (!movieId) {
            throw new Error('No movieId for episodes!');
        }
        
        await loadEpisodesAsync();
        console.log('✅ Force load episodes completed');
    } catch (error) {
        console.error('❌ Force load episodes failed:', error);
        showNotification('Force load episodes failed: ' + error.message, 'error');
    }
};

window.debugApp = debugApp;

// ===== MOVIE DATA LOADING =====

// Async version of loadMovieData for better error handling
async function loadMovieDataAsync() {
    if (!movieId) {
        throw new Error('Không có movieId để tải thông tin phim!');
    }

    console.log('🎬 Đang gọi API tải thông tin phim cho ID:', movieId);
    
    try {
        const response = await fetch(`http://localhost:8080/api/cartoons/${movieId}`);
        
        console.log('🌐 Response status:', response.status);
        console.log('🌐 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Không thể tải thông tin phim`);
        }
        
        const data = await response.json();
        console.log('🎬 Dữ liệu phim từ API:', data);
        
        // Check data structure
        const movie = data.cartoon || data || {};
        console.log('🎬 Thông tin phim được xử lý:', movie);
        
        if (!movie.title) {
            throw new Error('Dữ liệu phim không hợp lệ: thiếu tiêu đề');
        }
        
        // Save movie data globally
        window._lastMovieData = movie;
        
        // Update UI
        await updateMovieUI(movie);
        
        // Load episodes after movie data is loaded
        console.log('🎬 Bắt đầu tải danh sách tập phim...');
        await loadEpisodesAsync();
        
        console.log('✅ Hoàn thành tải dữ liệu phim và tập phim');
        
    } catch (error) {
        console.error('❌ Lỗi khi tải thông tin phim:', error);
        throw error; // Re-throw để caller có thể xử lý
    }
}

// Update movie UI elements
async function updateMovieUI(movie) {
    console.log('🎨 Cập nhật giao diện với dữ liệu phim:', movie);
    
    // Update page title
    document.title = (movie.title || 'Phim') + ' | Maxion';
    
    // Update movie title
    const h1 = document.querySelector('.movie-details h1');
    if (h1) {
        h1.textContent = movie.title || 'Đang tải...';
        console.log('✅ Đã cập nhật tiêu đề phim');
    }
    
    // Update description
    const description = document.querySelector('.movie-details .description');
    if (description && movie.description) {
        description.textContent = movie.description;
        console.log('✅ Đã cập nhật mô tả phim');
    }
    
    // Update movie info (rating, year, etc.)
    updateMovieInfo(movie);
    
    console.log('✅ Hoàn thành cập nhật giao diện phim');
}

// Update movie info (rating, year, etc.)
function updateMovieInfo(movie) {
    console.log('🎨 Cập nhật thông tin meta phim:', movie);
    
    try {
        // Update rating
        const ratingElement = document.getElementById('movieRating');
        if (ratingElement) {
            const rating = movie.rating || movie.averageRating || '0.0';
            ratingElement.textContent = `${rating}/10`;
        }
        
        // Update year
        const yearElement = document.getElementById('movieYear');
        if (yearElement) {
            yearElement.textContent = movie.releaseYear || movie.year || 'N/A';
        }
        
        // Update genre
        const genreElement = document.getElementById('movieGenre');
        if (genreElement) {
            genreElement.textContent = movie.genre || 'Không rõ thể loại';
        }
        
        // Update duration (from first episode or movie data)
        const durationElement = document.getElementById('movieDuration');
        if (durationElement) {
            let duration = 'Đang tải...';
            
            // Try to get duration from movie data
            if (movie.duration) {
                duration = `${movie.duration} phút`;
            } 
            // Try to get from first episode
            else if (currentEpisodes && currentEpisodes.length > 0) {
                const firstEpisode = currentEpisodes[0];
                if (firstEpisode.duration) {
                    duration = `${firstEpisode.duration} phút/tập`;
                } else {
                    duration = `${currentEpisodes.length} tập`;
                }
            }
            // Default episode count if available
            else if (movie.totalEpisodes || movie.episodeCount) {
                duration = `${movie.totalEpisodes || movie.episodeCount} tập`;
            }
            
            durationElement.textContent = duration;
        }
        
        // Update review count if available
        const reviewCountElement = document.getElementById('reviewCount');
        if (reviewCountElement && movie.reviewCount) {
            reviewCountElement.textContent = `(${movie.reviewCount} đánh giá)`;
        }
        
        console.log('✅ Đã cập nhật thông tin meta phim');
        
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật thông tin phim:', error);
    }
}

// Async version of loadEpisodes
async function loadEpisodesAsync() {
    if (!movieId) {
        throw new Error('Không có movieId để tải danh sách tập phim!');
    }

    console.log('🎬 Đang gọi API tải danh sách tập phim cho ID:', movieId);
    
    try {
        const response = await fetch(`http://localhost:8080/api/cartoons/${movieId}/episodes`);
        
        console.log('🌐 Episodes response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Không thể tải danh sách tập phim`);
        }
        
        const episodes = await response.json();
        console.log('🎬 Danh sách tập phim từ API:', episodes);
        
        const container = document.getElementById('episodes-container');
        if (!container) {
            console.error('❌ Không tìm thấy container cho danh sách tập phim');
            return;
        }
        
        if (!episodes || episodes.length === 0) {
            container.innerHTML = '<p class="no-episodes">Phim này chưa có tập nào để xem.</p>';
            console.log('ℹ️ Phim không có tập nào');
            return;
        }
        
        // Sort episodes by number
        episodes.sort((a, b) => {
            const numA = a.episodeNumber || a.episode_number || 0;
            const numB = b.episodeNumber || b.episode_number || 0;
            return numA - numB;
        });
        
        currentEpisodes = episodes;
        console.log('✅ Đã lưu danh sách tập phim:', currentEpisodes.length, 'tập');
        
        // Update movie info with episode data
        if (window._lastMovieData) {
            updateMovieInfo(window._lastMovieData);
        }
        
        // Render episodes UI
        await renderEpisodesUI(episodes, container);
        
        // Load first episode
        await loadFirstEpisode(episodes);
        
        console.log('✅ Hoàn thành xử lý danh sách tập phim');
        
    } catch (error) {
        console.error('❌ Lỗi khi tải danh sách tập phim:', error);
        
        const container = document.getElementById('episodes-container');
        if (container) {
            container.innerHTML = `<p class="error-message">Lỗi khi tải danh sách tập: ${error.message}</p>`;
        }
        
        throw error;
    }
}

// Render episodes UI
async function renderEpisodesUI(episodes, container) {
    console.log('🎨 Tạo giao diện danh sách tập phim...');
    
    const episodesHtml = episodes.map((ep, index) => {
        const epNumber = ep.episodeNumber || ep.episode_number || (index + 1);
        const title = ep.title || `Tập ${epNumber}`;
        
        return `
            <div class="episode-number-btn" 
                 onclick="loadEpisodeByIndex(${index})"
                 data-episode-id="${ep.id}"
                 data-episode-number="${epNumber}"
                 title="${title}">
                ${epNumber}
            </div>
        `;
    }).join('');
    
    container.innerHTML = episodesHtml;
    console.log('✅ Đã tạo UI cho', episodes.length, 'tập phim');
}

// Load first episode
async function loadFirstEpisode(episodes) {
    console.log('🎬 Đang tải tập phim đầu tiên...');
    
    // Get saved episode index or default to 0
    let savedIndex = 0;
    const saved = localStorage.getItem(`currentEpisodeIndex_${movieId}`);
    if (saved !== null && !isNaN(Number(saved))) {
        savedIndex = Math.max(0, Math.min(Number(saved), episodes.length - 1));
        console.log('📚 Sử dụng tập đã lưu, index:', savedIndex);
    }
    
    const episodeToPlay = episodes[savedIndex] || episodes[0];
    if (!episodeToPlay) {
        console.error('❌ Không tìm thấy tập phim để phát');
        return;
    }
    
    console.log('🎬 Tập phim sẽ phát:', episodeToPlay);
    
    // Check if episode has video URL
    const videoUrl = episodeToPlay.videoUrl || episodeToPlay.video_url;
    if (!videoUrl) {
        console.error('❌ Tập phim không có URL video:', episodeToPlay);
        showNotification('Tập phim này không có video để phát!', 'error');
        return;
    }
    
    // Mark active episode in UI
    markActiveEpisode(episodeToPlay.id);
    
    // Load the episode
    await loadEpisodeAsync(episodeToPlay);
    
    console.log('✅ Đã tải tập phim đầu tiên thành công');
}

// Mark active episode in UI
function markActiveEpisode(episodeId) {
    // Remove all active classes
    document.querySelectorAll('.episode-number-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to current episode
    const activeBtn = document.querySelector(`[data-episode-id="${episodeId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        console.log('✅ Đã đánh dấu tập phim active:', episodeId);
    }
}

// Async version of loadEpisode
async function loadEpisodeAsync(episode) {
    if (!episode) {
        throw new Error('Không có dữ liệu tập phim để tải!');
    }

    console.log('🎬 Đang tải tập phim:', episode);
    
    const videoUrl = episode.videoUrl || episode.video_url;
    if (!videoUrl) {
        throw new Error('Tập phim không có URL video!');
    }
    
    console.log('🔗 URL video:', videoUrl);
    
    // Show loading
    showLoading();
    
    try {
        // Get video element
        let videoElement = document.getElementById('videoElement');
        
        // Handle YouTube URLs
        if (videoUrl.includes('youtu.be/') || videoUrl.includes('youtube.com/watch')) {
            await loadYouTubeVideo(videoUrl);
        } else {
            // Handle regular video URLs
            await loadRegularVideo(videoUrl, videoElement);
        }
        
        // Update episode title
        updateEpisodeTitle(episode);
        
        // Save current episode index
        if (currentEpisodes && episode) {
            const idx = currentEpisodes.findIndex(ep => ep.id === episode.id);
            if (idx !== -1) {
                localStorage.setItem(`currentEpisodeIndex_${movieId}`, idx);
                console.log('💾 Đã lưu index tập phim:', idx);
            }
        }
        
        console.log('✅ Đã tải tập phim thành công');
        hideLoading();
        
    } catch (error) {
        console.error('❌ Lỗi khi tải tập phim:', error);
        hideLoading();
        showNotification('Lỗi khi tải video: ' + error.message, 'error');
        throw error;
    }
}

// Load YouTube video
async function loadYouTubeVideo(videoUrl) {
    console.log('📺 Đang tải video YouTube:', videoUrl);
    
    // Extract video ID
    let videoId = '';
    if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else if (videoUrl.includes('youtube.com/watch?v=')) {
        videoId = videoUrl.split('v=')[1].split('&')[0];
    }
    
    if (!videoId) {
        throw new Error('Không thể trích xuất ID video YouTube');
    }
    
    // Replace video player with iframe
    const videoContainer = document.querySelector('.video-player');
    if (!videoContainer) {
        throw new Error('Không tìm thấy container video');
    }
    
    videoContainer.innerHTML = `
        <iframe width="100%" height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
    `;
    
    console.log('✅ Đã tải YouTube video thành công');
}

// Load regular video
async function loadRegularVideo(videoUrl, videoElement) {
    console.log('🎥 Đang tải video thường:', videoUrl);
    
    // Restore video element if needed
    if (!videoElement) {
        const videoContainer = document.querySelector('.video-player');
        if (!videoContainer) {
            throw new Error('Không tìm thấy container video');
        }
        
        videoContainer.innerHTML = `
            <video class="video-element" id="videoElement" preload="metadata" controls>
                <source src="" type="video/mp4">
                <track kind="captions" src="" srclang="vi" label="Tiếng Việt">
                Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
            <!-- Loading Overlay -->
            <div class="loading-overlay" id="loadingOverlay">
                <div class="loading-spinner"></div>
            </div>
            <!-- Video Controls -->
            <div class="video-controls" id="videoControls">
                <div class="progress-container" id="progressContainer">
                    <div class="progress-bar">
                        <div class="progress-filled" id="progressFilled"></div>
                        <div class="progress-thumb" id="progressThumb"></div>
                    </div>
                </div>
            </div>
        `;
        
        videoElement = document.getElementById('videoElement');
        
        // Re-setup event listeners for new video element
        if (videoElement) {
            setupVideoEventListeners(videoElement);
        }
    }
    
    if (!videoElement) {
        throw new Error('Không thể tạo video element');
    }
    
    // Set video source
    videoElement.src = videoUrl;
    videoElement.load();
    
    // Try to autoplay
    try {
        await videoElement.play();
        console.log('✅ Video đã bắt đầu phát tự động');
    } catch (err) {
        console.log('ℹ️ Autoplay bị chặn:', err.message);
        showNotification('Video đã sẵn sàng. Nhấn để phát!', 'info');
    }
    
    console.log('✅ Đã thiết lập video thường thành công');
}

// Setup event listeners for video element
function setupVideoEventListeners(videoEl) {
    console.log('🎧 Thiết lập event listeners cho video element mới...');
    
    videoEl.addEventListener('loadstart', showLoading);
    videoEl.addEventListener('canplay', hideLoading);
    videoEl.addEventListener('waiting', showLoading);
    videoEl.addEventListener('playing', hideLoading);
    videoEl.addEventListener('timeupdate', updateProgress);
    videoEl.addEventListener('ended', onVideoEnded);
    videoEl.addEventListener('play', () => {
        isPlaying = true;
        if (playIcon) playIcon.textContent = '⏸';
    });
    videoEl.addEventListener('pause', () => {
        isPlaying = false;
        if (playIcon) playIcon.textContent = '▶';
    });
    
    console.log('✅ Đã thiết lập event listeners cho video element');
}

// Legacy function for compatibility (non-async version)
function loadMovieData() {
    loadMovieDataAsync().catch(error => {
        console.error('❌ Lỗi trong loadMovieData legacy:', error);
        hideLoading();
        showNotification('Lỗi khi tải thông tin phim: ' + error.message, 'error');
    });
}

function loadEpisodes() {
    if (!movieId) {
        const container = document.getElementById('episodes-container');
        if (container) container.innerHTML = "<p class='error-message'>Không tìm thấy id phim!</p>";
        return;
    }

    console.log('🎬 Đang tải danh sách tập phim cho movie ID:', movieId);
    showLoading();

    fetch(`http://localhost:8080/api/cartoons/${movieId}/episodes`)
        .then(res => {
            if (!res.ok) throw new Error("Không tìm thấy tập phim!");
            return res.json();
        })
        .then(episodes => {
            hideLoading();
            console.log('🎬 Đã tải được tập phim:', episodes);
            
            const container = document.getElementById('episodes-container');
            if (!episodes || episodes.length === 0) {
                if (container) container.innerHTML = '<p class="no-episodes">Phim này chưa có tập nào để xem.</p>';
                return;
            }
            
            // Sort episodes by number
            episodes.sort((a, b) => (a.episodeNumber || a.episode_number || 0) - (b.episodeNumber || b.episode_number || 0));
            currentEpisodes = episodes;
            
            // Gọi lại updateMovieInfo để cập nhật thời lượng từ tập đầu tiên
            if (window._lastMovieData) {
                console.log('🎬 Cập nhật thông tin phim sau khi tải tập phim');
                updateMovieInfo(window._lastMovieData);
            }
            
            // Get saved episode index or default to 0
            let savedIndex = 0;
            const saved = localStorage.getItem(`currentEpisodeIndex_${movieId}`);
            if (saved !== null && !isNaN(Number(saved))) {
                savedIndex = Math.max(0, Math.min(Number(saved), episodes.length - 1));
            }
            
            // Select episode to play
            const episodeToPlay = episodes[savedIndex] || episodes[0];
            if (episodeToPlay) {
                console.log('🎬 Tập phim sẽ phát:', episodeToPlay);
                
                // Get video URL
                const videoUrl = episodeToPlay.videoUrl || episodeToPlay.video_url;
                if (videoUrl) {
                    loadEpisode(episodeToPlay);
                } else {
                    console.error('❌ Không tìm thấy URL video cho tập phim:', episodeToPlay);
                    showNotification('Không tìm thấy URL video cho tập phim này!', 'error');
                }
            }
            
            // Render episode buttons
            if (container) {
                const episodesHtml = episodes.map((ep, index) => {
                    const epNumber = ep.episodeNumber || ep.episode_number || (index + 1);
                    return `
                        <div class="episode-number-btn ${ep.id === (episodeToPlay ? episodeToPlay.id : null) ? 'active' : ''}"
                             onclick="loadEpisodeByIndex(${index})"
                             data-episode-id="${ep.id}"
                             data-episode-number="${epNumber}"
                             title="${ep.title || 'Tập ' + epNumber}">
                            ${epNumber}
                        </div>
                    `;
                }).join('');
                
                container.innerHTML = episodesHtml || '<p>Không thể hiển thị tập phim</p>';
            }
        })
        .catch(error => {
            hideLoading();
            console.error("❌ Lỗi khi tải tập phim:", error);
            const container = document.getElementById('episodes-container');
            if (container) {
                container.innerHTML = `<p class="error-message">Lỗi khi tải tập phim: ${error.message}</p>`;
            }
            showNotification('Lỗi khi tải tập phim!', 'error');
        });
}

// ===== EPISODE MANAGEMENT =====

// Hàm load episode bằng index từ currentEpisodes array
async function loadEpisodeByIndex(index) {
    console.log('🎬 Đang tải tập phim theo index:', index);
    
    if (!currentEpisodes || !currentEpisodes.length) {
        console.error('❌ Danh sách tập phim chưa được tải!');
        showNotification('Danh sách tập phim chưa được tải!', 'error');
        return;
    }
    
    if (!currentEpisodes[index]) {
        console.error('❌ Không tìm thấy tập phim với index:', index);
        showNotification('Không tìm thấy tập phim!', 'error');
        return;
    }
    
    const episode = currentEpisodes[index];
    console.log('🎬 Đã tìm thấy tập phim:', episode);
    
    const videoUrl = episode.videoUrl || episode.video_url;
    if (!videoUrl) {
        console.error('❌ Không tìm thấy URL video cho tập phim này!');
        showNotification('Không tìm thấy URL video cho tập phim này!', 'error');
        return;
    }
    
    try {
        // Mark active episode
        markActiveEpisode(episode.id);
        
        // Load episode
        await loadEpisodeAsync(episode);
        
        // Save index
        localStorage.setItem(`currentEpisodeIndex_${movieId}`, index);
        
        console.log('✅ Đã tải tập phim thành công');
        
    } catch (error) {
        console.error('❌ Lỗi khi tải tập phim:', error);
        showNotification('Lỗi khi tải tập phim: ' + error.message, 'error');
    }
}

// Hàm load và phát một tập phim
function loadEpisode(episode) {
    if (!episode) {
        console.error('❌ Không có dữ liệu tập phim để tải!');
        showNotification('Không có dữ liệu tập phim để tải!', 'error');
        return;
    }

    console.log('🎬 Đang tải tập phim:', episode);
    console.log('🔢 Số tập:', episode.episodeNumber || episode.episode_number);
    
    // Lấy URL video từ episode
    let videoUrl = episode.videoUrl || episode.video_url;
    console.log('🔗 URL video:', videoUrl);
    
    if (!videoUrl) {
        console.error('❌ Không tìm thấy URL video!');
        showNotification('Không tìm thấy URL video cho tập phim này!', 'error');
        return;
    }    // Hiển thị loading
    showLoading();

    // Cập nhật UI trước (active episode button)
    updateActiveEpisode(episode.episodeNumber || episode.episode_number);    // Kiểm tra video element trước khi sử dụng
    const videoElement = document.getElementById('videoElement');
    if (!videoElement) {
        console.error('❌ Không tìm thấy video element để phát!');
        showNotification('Lỗi: Không tìm thấy video player!', 'error');
        hideLoading();
        return;
    }

    // Xử lý YouTube URL
    if (videoUrl && (videoUrl.includes('youtu.be/') || videoUrl.includes('youtube.com/watch'))) {
        console.log('🎬 Phát hiện URL YouTube, chuyển đổi sang embed');
        
        // Chuyển YouTube URL sang embed format
        let videoId = '';
        if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        } else if (videoUrl.includes('youtube.com/watch?v=')) {
            videoId = videoUrl.split('v=')[1].split('&')[0];
        }

        if (videoId) {
            console.log('Loading YouTube video:', videoId);
            // Tạo iframe cho YouTube thay vì dùng video element
            const videoContainer = document.querySelector('.video-player');
            if (videoContainer) {
                videoContainer.innerHTML = `
                    <iframe width="100%" height="100%" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                `;
            }

            // Update episode title
            updateEpisodeTitle(episode);
            return;
        }
    }

    // Đối với video thông thường (MP4, etc.), restore video element if needed    let videoEl = document.getElementById('videoElement');
    if (!videoEl) {
        console.log('Restoring video element...');
        const videoContainer = document.querySelector('.video-player');
        if (videoContainer) {
            videoContainer.innerHTML = `
                <video class="video-element" id="videoElement" preload="metadata">
                    <source src="" type="video/mp4">
                    <track kind="captions" src="" srclang="vi" label="Tiếng Việt">
                    <track kind="captions" src="" srclang="en" label="English">
                    Trình duyệt của bạn không hỗ trợ thẻ video.                </video>
                <!-- Add back other video player UI elements if needed -->
            `;
            videoEl = document.getElementById('videoElement');
        }
    }

    // Đối với video thông thường (MP4, etc.)
    if (videoEl) {
        console.log('🎬 Đang thiết lập video source:', videoUrl);
        videoEl.src = videoUrl;
        videoEl.load();        // Tự động phát
        videoEl.play().catch(err => {
            console.log('Autoplay bị chặn:', err);
            showNotification('Video đã sẵn sàng. Nhấn để phát!', 'info');
        });
        
        console.log('✅ Video đã được thiết lập thành công');
        hideLoading();
    } else {
        console.error('❌ Không thể thiết lập video element');
        showNotification('Lỗi khi thiết lập video!', 'error');
        hideLoading();
    }

    // Lưu index tập đang xem vào localStorage (nếu gọi trực tiếp)
    if (currentEpisodes && episode) {
        const idx = currentEpisodes.findIndex(ep => ep.id === episode.id);
        if (idx !== -1) {
            localStorage.setItem(`currentEpisodeIndex_${movieId}`, idx);
        }
    }

    // Update episode title
    updateEpisodeTitle(episode);
}

// Helper function to update episode title
function updateEpisodeTitle(episode) {
    const currentEpisodeTitle = document.querySelector('.current-episode-title');
    if (currentEpisodeTitle) {
        currentEpisodeTitle.textContent = `Tập ${episode.episode_number}: ${episode.title}`;
    }
}

// Update active episode button
function updateActiveEpisode(episodeNumber) {
    // Remove active class from all episode buttons
    document.querySelectorAll('.episode-number-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to current episode by data attribute
    document.querySelectorAll('.episode-number-btn').forEach(btn => {
        const btnEpisodeNumber = btn.getAttribute('data-episode-number');
        if (btnEpisodeNumber && parseInt(btnEpisodeNumber) === episodeNumber) {
            btn.classList.add('active');
        }
    });
}

// ===== VIDEO PLAYER CONTROLS =====

// Playback controls
function togglePlayPause() {
    if (!video) return;

    if (video.paused) {
        video.play();
        showNotification('Đang phát video', 'success');
    } else {
        video.pause();
        showNotification('Đã tạm dừng', 'success');
    }
}

function seek(e) {
    if (!video || !progressContainer) return;

    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * video.duration;
    video.currentTime = newTime;
}

function updateProgress() {
    if (video.duration > 0) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        if (progressFilled) progressFilled.style.width = `${progressPercent}%`;
        if (progressThumb) progressThumb.style.left = `${progressPercent}%`;
        if (timeDisplay) timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

        // Track watching halfway through the movie
        if (!hasTrackedHalfway && progressPercent >= 50) {
            console.log('🎬 User has watched 50% of the movie. Tracking action...');
            if (typeof trackUserAction === 'function') {
                trackUserAction('WATCH_MOVIE_HALF', { movieId: movieId, episodeId: getCurrentEpisodeId() });
            }
            hasTrackedHalfway = true; // Đánh dấu đã gửi để không gửi lại
        }
    }
}


// Handle video end
function onVideoEnded() {
    console.log('🎬 Video ended. Tracking action and playing next episode...');
    isPlaying = false;
    if (playIcon) playIcon.textContent = '▶';

    // Gửi sự kiện hoàn thành xem phim
    if (typeof trackUserAction === 'function') {
        trackUserAction('WATCH_MOVIE', { movieId: movieId, episodeId: getCurrentEpisodeId() });
    }

    // Tự động chuyển tập tiếp theo
    playNextEpisode();
}

// Volume controls
function toggleMute() {
    if (!video) return;

    if (isMuted) {
        video.volume = currentVolume;
        isMuted = false;
        if (volumeIcon) volumeIcon.textContent = '🔊';
    } else {
        currentVolume = video.volume;
        video.volume = 0;
        isMuted = true;
        if (volumeIcon) volumeIcon.textContent = '🔇';
    }
    updateVolumeDisplay();
}

function setVolume(e) {
    if (!video || !volumeSlider) return;

    const rect = volumeSlider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width));

    video.volume = newVolume;
    currentVolume = newVolume;
    isMuted = false;

    updateVolumeDisplay();
    updateVolumeIcon();
}

function updateVolumeDisplay() {
    if (!video || !volumeFilled) return;

    const volumePercent = isMuted ? 0 : (video.volume * 100);
    volumeFilled.style.width = `${volumePercent}%`;
}

function updateVolumeIcon() {
    if (!video || !volumeIcon) return;

    if (isMuted || video.volume === 0) {
        volumeIcon.textContent = '🔇';
    } else if (video.volume < 0.5) {
        volumeIcon.textContent = '🔉';
    } else {
        volumeIcon.textContent = '🔊';
    }
}

// Playback speed
function changePlaybackSpeed() {
    if (!video) return;

    currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
    currentSpeed = playbackSpeeds[currentSpeedIndex];
    video.playbackRate = currentSpeed;
    updateSpeedDisplay();
    showNotification(`Tốc độ phát: ${currentSpeed}x`, 'success');
}

function updateSpeedDisplay() {
    if (speedIcon) speedIcon.textContent = `${currentSpeed}x`;
}

// Fullscreen
function toggleFullscreen() {
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
            console.log('Error entering fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function updateFullscreenIcon() {
    isFullscreen = !!document.fullscreenElement;
    if (fullscreenIcon) fullscreenIcon.textContent = isFullscreen ? '⛶' : '⛶';
}

// Theater mode
function toggleTheaterMode() {
    isTheaterMode = !isTheaterMode;
    document.body.classList.toggle('theater-mode', isTheaterMode);
    if (theaterIcon) theaterIcon.textContent = isTheaterMode ? '⛶' : '⛶';

    if (isTheaterMode) {
        showNotification('Đã bật chế độ rạp', 'success');
    } else {
        showNotification('Đã tắt chế độ rạp', 'success');
    }
}

// Picture in Picture
function togglePictureInPicture() {
    if (!isPiPActive) {
        if (document.pictureInPictureEnabled && video) {
            video.requestPictureInPicture()
                .then(() => {
                    isPiPActive = true;
                    showNotification('Đã bật Picture in Picture', 'success');
                })
                .catch(err => {
                    console.log('PiP error:', err);
                    showNotification('Không thể bật Picture in Picture', 'error');
                });
        } else {
            // Fallback PiP implementation
            enableCustomPiP();
        }
    } else {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else {
            disableCustomPiP();
        }
    }
}

function enableCustomPiP() {
    if (pipContainer && pipVideo && video) {
        pipContainer.classList.add('active');
        pipVideo.src = video.src;
        pipVideo.currentTime = video.currentTime;
        if (isPlaying) {
            pipVideo.play();
        }
        isPiPActive = true;
        showNotification('Đã bật Picture in Picture', 'success');
    }
}

function disableCustomPiP() {
    if (pipContainer) {
        pipContainer.classList.remove('active');
    }
    isPiPActive = false;
    showNotification('Đã tắt Picture in Picture', 'success');
}

function closePiP() {
    disableCustomPiP();
}

// Quality selector
function toggleQuality() {
    if (qualitySelector) {
        qualitySelector.classList.toggle('active');
    }
}

function changeQuality(quality) {
    if (!video) return;

    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;

    // Update active quality option
    document.querySelectorAll('.quality-option').forEach(option => {
        option.classList.remove('active');
    });
    event.target.classList.add('active');

    // In a real app, you would change the video source here
    showNotification(`Đã chuyển sang chất lượng ${quality}`, 'success');
    if (qualitySelector) qualitySelector.classList.remove('active');

    // Restore playback state
    video.currentTime = currentTime;
    if (wasPlaying) {
        video.play();
    }
}

// Subtitles
function toggleSubtitles() {
    if (!video) return;

    subtitlesEnabled = !subtitlesEnabled;

    if (subtitlesEnabled) {
        // Enable subtitles
        if (video.textTracks.length > 0) {
            video.textTracks[0].mode = 'showing';
        }
        showNotification('Đã bật phụ đề', 'success');
    } else {
        // Disable subtitles
        Array.from(video.textTracks).forEach(track => {
            track.mode = 'hidden';
        });
        showNotification('Đã tắt phụ đề', 'success');
    }
}

// Controls visibility
function showControls() {
    if (videoControls) {
        videoControls.classList.add('visible');
    }
    clearTimeout(controlsTimeout);

    controlsTimeout = setTimeout(() => {
        if (isPlaying && videoPlayer && !videoPlayer.matches(':hover')) {
            hideControls();
        }
    }, 3000);
}

function hideControls() {
    if (videoControls) {
        videoControls.classList.remove('visible');
    }
}

function hideControlsDelayed() {
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(hideControls, 1000);
}

// Loading
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Video ended
function onVideoEnded() {
    console.log('🎬 Video ended. Tracking action and playing next episode...');
    isPlaying = false;
    if (playIcon) playIcon.textContent = '▶';

    // Gửi sự kiện hoàn thành xem phim
    if (typeof trackUserAction === 'function') {
        trackUserAction('WATCH_MOVIE', { movieId: movieId, episodeId: getCurrentEpisodeId() });
    }

    // Tự động chuyển tập tiếp theo
    playNextEpisode();
}

// Keyboard shortcuts
function handleKeyboard(e) {
    // Prevent default browser shortcuts when video is focused
    if (document.activeElement === video || e.target.closest('.video-player')) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (video) {
                    video.currentTime -= 10;
                    showNotification('Tua lùi 10 giây', 'success');
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (video) {
                    video.currentTime += 10;
                    showNotification('Tua tới 10 giây', 'success');
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (video) {
                    video.volume = Math.min(1, video.volume + 0.1);
                    updateVolumeDisplay();
                    updateVolumeIcon();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (video) {
                    video.volume = Math.max(0, video.volume - 0.1);
                    updateVolumeDisplay();
                    updateVolumeIcon();
                }
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'KeyT':
                e.preventDefault();
                toggleTheaterMode();
                break;
            case 'KeyC':
                e.preventDefault();
                toggleSubtitles();
                break;
        }
    }
}

// Progress preview (hover)
function showProgressPreview(e) {
    if (!video || !progressContainer) return;

    // In a real app, this would show thumbnail preview
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const previewTime = (clickX / rect.width) * video.duration;

    // You could show a tooltip with the time here
}

// ===== NAVIGATION FUNCTIONS =====

function goBack() {
    // In a real app, this would navigate back to the previous page
    showNotification('Đang quay lại trang trước...', 'success');
    setTimeout(() => {
        window.history.back();
    }, 1000);
}

function playRelatedMovie(movieId) {
    // Chuyển hướng sang trang phim mới với id
    window.location.href = `moive.html?id=${movieId}`;
}

// ===== MOVIE ACTIONS =====

// Restart movie
function restartMovie() {
    const currentVideo = document.getElementById('videoElement');
    if (currentVideo) {
        currentVideo.currentTime = 0;
        currentVideo.play();
        showNotification('Đang phát lại từ đầu', 'success');
    }
}

// ===== LIKE/DISLIKE MOVIE =====
function updateLikeDislikeUI() {
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const likeCountEl = document.getElementById('likeCount');
    const dislikeCountEl = document.getElementById('dislikeCount');
    if (likeBtn) likeBtn.classList.toggle('liked', isLiked);
    if (dislikeBtn) dislikeBtn.classList.toggle('disliked', isDisliked);
    if (likeCountEl) likeCountEl.textContent = likeCount;
    if (dislikeCountEl) dislikeCountEl.textContent = dislikeCount;
}

async function toggleLike() {
    if (!isAuthenticated || !currentUser) {
        showLoginPrompt();
        return;
    }
    
    console.log('👍 Đang toggle like cho phim:', movieId);
    
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser.id.toString(),
            'X-Username': currentUser.username
        };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        
        const res = await fetch(`http://localhost:8080/api/cartoons/${movieId}/like`, {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify({ isLiked: !isLiked })
        });
        
        console.log('🌐 Like API response status:', res.status);
        
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Tính năng thích/không thích chưa được hỗ trợ');
            }
            throw new Error(`Không thể cập nhật trạng thái thích (${res.status})`);
        }
        
        // Check if response is JSON
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            isLiked = data.isLiked;
            isDisliked = false;
            likeCount = data.likeCount || 0;
            dislikeCount = data.dislikeCount || 0;
            updateLikeDislikeUI();
            showNotification(isLiked ? 'Đã thích phim!' : 'Đã bỏ thích!', 'success');
        } else {
            // Fallback for non-JSON response
            console.log('⚠️ API không trả về JSON, sử dụng fallback');
            isLiked = !isLiked;
            isDisliked = false;
            updateLikeDislikeUI();
            showNotification(isLiked ? 'Đã thích phim!' : 'Đã bỏ thích!', 'success');
        }
    } catch (e) {
        console.error('❌ Lỗi toggle like:', e);
        showNotification(e.message, 'error');
    }
}

async function toggleDislike() {
    if (!isAuthenticated || !currentUser) {
        showLoginPrompt();
        return;
    }
    
    console.log('👎 Đang toggle dislike cho phim:', movieId);
    
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser.id.toString(),
            'X-Username': currentUser.username
        };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        
        const res = await fetch(`http://localhost:8080/api/cartoons/${movieId}/dislike`, {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify({ isDisliked: !isDisliked })
        });
        
        console.log('🌐 Dislike API response status:', res.status);
        
        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Tính năng thích/không thích chưa được hỗ trợ');
            }
            throw new Error(`Không thể cập nhật trạng thái không thích (${res.status})`);
        }
        
        // Check if response is JSON
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            isDisliked = data.isDisliked;
            isLiked = false;
            likeCount = data.likeCount || 0;
            dislikeCount = data.dislikeCount || 0;
            updateLikeDislikeUI();
            showNotification(isDisliked ? 'Đã không thích phim!' : 'Đã bỏ không thích!', 'success');
        } else {
            // Fallback for non-JSON response
            console.log('⚠️ API không trả về JSON, sử dụng fallback');
            isDisliked = !isDisliked;
            isLiked = false;
            updateLikeDislikeUI();
            showNotification(isDisliked ? 'Đã không thích phim!' : 'Đã bỏ không thích!', 'success');
        }
    } catch (e) {
        console.error('❌ Lỗi toggle dislike:', e);
        showNotification(e.message, 'error');
    }
}

// Load like/dislike state for authenticated users
async function loadLikeDislikeState() {
    if (!isAuthenticated || !currentUser || !movieId) {
        console.log('⚠️ Bỏ qua tải trạng thái like/dislike: chưa đăng nhập hoặc không có movieId');
        return;
    }

    try {
        console.log('🔄 Đang tải trạng thái like/dislike cho phim:', movieId);
        
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser.id.toString(),
            'X-Username': currentUser.username
        };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const response = await fetch(`http://localhost:8080/api/cartoons/${movieId}/like-status`, {
            method: 'GET',
            credentials: 'include',
            headers
        });

        console.log('🌐 Like/Dislike API response status:', response.status);
        console.log('🌐 Like/Dislike API response content-type:', response.headers.get('content-type'));

        if (response.ok) {
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('✅ Trạng thái like/dislike:', data);
                
                // Update state
                isLiked = data.isLiked || false;
                isDisliked = data.isDisliked || false;
                likeCount = data.likeCount || 0;
                dislikeCount = data.dislikeCount || 0;
                
                // Update UI
                updateLikeDislikeUI();
            } else {
                console.log('⚠️ API trả về không phải JSON, có thể endpoint chưa được implement');
                console.log('📄 Response content type:', contentType);
                
                // Use default values
                isLiked = false;
                isDisliked = false;
                likeCount = 0;
                dislikeCount = 0;
                updateLikeDislikeUI();
            }
        } else if (response.status === 404) {
            console.log('ℹ️ Endpoint like-status chưa được implement, sử dụng giá trị mặc định');
            // Use default values for 404
            isLiked = false;
            isDisliked = false;
            likeCount = 0;
            dislikeCount = 0;
            updateLikeDislikeUI();
        } else {
            console.log('ℹ️ Không thể tải trạng thái like/dislike, status:', response.status);
        }
    } catch (error) {
        console.error('❌ Lỗi khi tải trạng thái like/dislike:', error);
        
        // Check if it's a JSON parsing error
        if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
            console.log('🔍 Lỗi parse JSON - có thể server trả về HTML thay vì JSON');
            console.log('💡 Đây thường xảy ra khi endpoint chưa được implement hoặc có lỗi server');
        }
        
        // Use default values on error
        isLiked = false;
        isDisliked = false;
        likeCount = 0;
        dislikeCount = 0;
        updateLikeDislikeUI();
        
        // Không hiển thị lỗi cho người dùng, chỉ log
    }
}

// ===== COMMENTS FUNCTIONALITY =====

// Update comments count
function updateCommentsCount(count) {
    const commentsCount = document.getElementById('comments-count');
    if (commentsCount) {
        commentsCount.textContent = `Bình luận (${count})`;
    }
}

// Load comments from API
async function loadComments() {
    if (!movieId) return;

    try {
        const token = localStorage.getItem('token'); const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        const response = await fetch(`http://localhost:8080/api/cartoons/${movieId}/comments`, {
            method: 'GET',
            credentials: 'include',
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to load comments');
        }

        const comments = await response.json();
        console.log('Comments loaded:', comments);
        currentComments = comments;
        displayComments(comments);
        updateCommentsCount(comments.length);
    } catch (err) {
        console.error('Error loading comments:', err);
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            commentsList.innerHTML =
                '<div style="text-align: center; padding: 20px; color: #ff6b6b;">Không thể tải bình luận</div>';
        }
    }
}

// Display comments in UI with enhanced features
function displayComments(comments) {
    const container = document.getElementById('comments-list');
    if (!container) return;

    if (comments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>Chưa có bình luận nào.</p>
                <p>Hãy là người đầu tiên bình luận về phim này!</p>
            </div>
        `;
        return;
    }

    const commentsHtml = comments.map(comment => {
        const avatar = comment.userAvatar || 'AN';
        const timeAgo = formatTimeAgo(comment.createdAt);
        const rating = '⭐'.repeat(comment.rating || 0);

        // Like/dislike button states
        const likedClass = comment.userLikeStatus === 'liked' ? 'liked' : '';
        const dislikedClass = comment.userLikeStatus === 'disliked' ? 'disliked' : '';

        // Replies HTML
        const repliesHtml = comment.replies && comment.replies.length > 0
            ? comment.replies.map(reply => `
                <div class="comment-reply">
                    <div class="comment-avatar">${reply.userAvatar}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${reply.userName}</span>
                            <span class="comment-time">${formatTimeAgo(reply.createdAt)}</span>
                        </div>
                        <div class="comment-text">${reply.content}</div>
                    </div>
                </div>
            `).join('')
            : '';

        return `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-avatar">${avatar}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.userName || 'Ẩn danh'}</span>
                        <span class="comment-rating">${rating}</span>
                        <span class="comment-time">${timeAgo}</span>
                    </div>
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-actions-list">
                        <button class="comment-action like-btn ${likedClass}" onclick="likeComment(${comment.id}, true)" data-comment-id="${comment.id}">
                            <span>👍</span>
                            <span id="like-count-${comment.id}">${comment.likeCount || 0}</span>
                        </button>
                        <button class="comment-action dislike-btn ${dislikedClass}" onclick="likeComment(${comment.id}, false)" data-comment-id="${comment.id}">
                            <span>👎</span>
                            <span id="dislike-count-${comment.id}">${comment.dislikeCount || 0}</span>
                        </button>
                        <button class="comment-action reply-btn" onclick="showReplyForm(${comment.id})">
                            <span>💬</span>
                            <span>Trả lời</span>
                        </button>
                        ${comment.canDelete ? `<button class="comment-action delete-btn" onclick="deleteComment(${comment.id})">
                            <span>🗑️</span>
                            <span>Xóa</span>
                        </button>` : ''}
                    </div>
                    <div class="reply-form" id="reply-form-${comment.id}" style="display: none;">
                        <textarea placeholder="Viết phản hồi..." id="reply-input-${comment.id}" class="comment-input"></textarea>
                        <div class="reply-actions">
                            <button class="action-button" onclick="postReply(${comment.id})">Trả lời</button>
                            <button class="action-button" onclick="hideReplyForm(${comment.id})">Hủy</button>
                        </div>
                    </div>
                    <div class="comment-replies">
                        ${repliesHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = commentsHtml;
}

// Post new comment with authentication
async function postComment() {
    // Check localStorage authentication
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        showLoginPrompt();
        return;
    }

    let currentUser;
    try {
        currentUser = JSON.parse(userData);
    } catch (e) {
        console.error('Invalid user data in localStorage');
        showLoginPrompt();
        return;
    }

    const input = document.getElementById('comment-input');
    const ratingSelect = document.getElementById('rating-select');

    if (!input || !ratingSelect) return;

    const rating = ratingSelect.value;
    const content = input.value.trim();

    if (!content) {
        showNotification('Vui lòng nhập nội dung bình luận', 'error');
        return;
    } if (!movieId) {
        showNotification('Không tìm thấy thông tin phim', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser.id.toString(),
            'X-Username': currentUser.username
        };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const response = await fetch(`http://localhost:8080/api/cartoons/${movieId}/comments`, {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify({
                content: content,
                rating: parseInt(rating)
            })
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.log('❌ Authentication failed, clearing user data');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('username');
                localStorage.removeItem('token');
                showLoginPrompt();
                return;
            }

            const errorText = await response.text();
            let errorMessage = 'Không thể đăng bình luận';

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If not JSON, use text as error message
                errorMessage = errorText || errorMessage;
            }

            throw new Error(errorMessage);
        }

        const newComment = await response.json();

        // Nếu backend trả về userName là 'Ẩn danh' hoặc thiếu, tự gán lại từ currentUser
        if (!newComment.userName || newComment.userName === 'Ẩn danh') {
            newComment.userName = currentUser.fullName || currentUser.username || 'Ẩn danh';
        }
        // Nếu backend trả về thiếu avatar, gán avatar mặc định (chữ cái đầu)
        if (!newComment.userAvatar) {
            if (currentUser.fullName) {
                newComment.userAvatar = currentUser.fullName.charAt(0).toUpperCase();
            } else if (currentUser.username) {
                newComment.userAvatar = currentUser.username.charAt(0).toUpperCase();
            } else {
                newComment.userAvatar = 'AN';
            }
        }

        // Add to current comments and refresh display
        currentComments.unshift(newComment);
        displayComments(currentComments);
        updateCommentsCount(currentComments.length);

        // Clear form
        input.value = '';
        ratingSelect.value = '5';

        showNotification('Đã đăng bình luận!', 'success');

    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification(error.message, 'error');
    }
}

// Like/Dislike comment with API integration
async function likeComment(commentId, isLiked) {
    // Check localStorage authentication
    let currentUser;
    try {
        const userData = localStorage.getItem('currentUser');
        if (!userData) throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
        currentUser = JSON.parse(userData);
    } catch (e) {
        showLoginPrompt();
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser.id.toString(),
            'X-Username': currentUser.username
        };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const response = await fetch(`http://localhost:8080/api/cartoons/comments/${commentId}/like`, {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify({ isLiked: isLiked })
        });

        if (response.status === 401) {
            // Xử lý khi hết phiên đăng nhập
            localStorage.removeItem('currentUser');
            localStorage.removeItem('username');
            localStorage.removeItem('token');
            showLoginPrompt();
            return;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Không thể cập nhật like/dislike');
        }

        const result = await response.json();
        await loadComments();
        showNotification(isLiked ? 'Đã thích bình luận!' : 'Đã không thích bình luận!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Show reply form
function showReplyForm(commentId) {
    if (!isAuthenticated) {
        showLoginPrompt();
        return;
    }

    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'block';
        const replyInput = document.getElementById(`reply-input-${commentId}`);
        if (replyInput) {
            replyInput.focus();
        }
    }
}

// Hide reply form
function hideReplyForm(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'none';
        const replyInput = document.getElementById(`reply-input-${commentId}`);
        if (replyInput) {
            replyInput.value = '';
        }
    }
}

// Post reply to comment
async function postReply(parentCommentId) {
    // Check localStorage authentication
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
        showLoginPrompt();
        return;
    }

    let currentUser;
    try {
        currentUser = JSON.parse(userData);
    } catch (e) {
        console.error('Invalid user data in localStorage');
        showLoginPrompt();
        return;
    }

    const replyInput = document.getElementById(`reply-input-${parentCommentId}`);
    if (!replyInput) return;

    const content = replyInput.value.trim();
    if (!content) {
        showNotification('Vui lòng nhập nội dung phản hồi', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser.id.toString(),
            'X-Username': currentUser.username
        };
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        const response = await fetch(`http://localhost:8080/api/cartoons/${movieId}/comments`, {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify({
                content: content,
                rating: 0, // Replies don't have ratings
                parentId: parentCommentId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Không thể đăng phản hồi');
        }

        // Reload comments to show new reply
        await loadComments();

        // Hide reply form
        hideReplyForm(parentCommentId);

        showNotification('Đã đăng phản hồi!', 'success');

    } catch (error) {
        console.error('Error posting reply:', error);
        showNotification(error.message, 'error');
    }
}

// Delete comment
async function deleteComment(commentId) {
    if (!isAuthenticated) {
        showLoginPrompt();
        return;
    }

    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa bình luận này?');
    if (!confirmDelete) return;

    try {
        const response = await fetch(`http://localhost:8080/api/cartoons/comments/${commentId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Không thể xóa bình luận');
        }

        // Reload comments
        await loadComments();

        showNotification('Đã xóa bình luận!', 'success');

    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification(error.message, 'error');
    }
}

// Sort comments
function sortComments() {
    const sortBy = document.getElementById('comments-sort');
    if (!sortBy) return;

    const sortValue = sortBy.value;
    let sortedComments = [...currentComments];

    switch (sortValue) {
        case 'newest':
            sortedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sortedComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'popular':
            // Sort by rating for now (could be by likes later)
            sortedComments.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
    }

    displayComments(sortedComments);
}

// Like/Dislike comment functions (placeholder)
// function likeComment(commentId) {
//     console.log('Liked comment:', commentId);
//     showNotification('Tính năng like đang được phát triển', 'info');
// }

// function dislikeComment(commentId) {
//     console.log('Disliked comment:', commentId);
//     showNotification('Tính năng dislike đang được phát triển', 'info');
// }

// Load comments when page loads
if (movieId) {
    // Delay loading comments slightly to ensure DOM is ready
    setTimeout(() => {
        loadComments();
    }, 500);
}

// Logout function
function logout() {
    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');

    // Clear current user data
    currentUser = null;
    isAuthenticated = false;

    // Redirect to login
    showNotification('Đã đăng xuất!', 'success');
    setTimeout(() => {
        window.location.href = '../login_register/login.html';
    }, 1000);
}

// ===== DEBUG AND TEST FUNCTIONS =====

// Hàm test để kiểm tra tất cả các element cần thiết
function debugCheckElements() {
    console.log('🔍 DEBUGGING: Kiểm tra các element...');
    
    // Kiểm tra video element
    const videoEl = document.getElementById('videoElement');
    console.log('Video element:', videoEl);
    
    // Kiểm tra episodes container
    const episodeContainer = document.getElementById('episodes-container');
    console.log('Episodes container:', episodeContainer);
    
    // Kiểm tra movie details
    const movieDetails = document.querySelector('.movie-details h1');
    console.log('Movie title element:', movieDetails);
    
    // Kiểm tra các element meta
    const rating = document.getElementById('movieRating');
    const year = document.getElementById('movieYear');
    const duration = document.getElementById('movieDuration');
    const genre = document.getElementById('movieGenre');
    
    console.log('Meta elements:', { rating, year, duration, genre });
    
    // Kiểm tra loading overlay
    const loading = document.getElementById('loadingOverlay');
    console.log('Loading overlay:', loading);
    
    // Kiểm tra notification
    const notification = document.getElementById('notification');
    console.log('Notification element:', notification);
    
    // Kiểm tra movieId
    console.log('Current movieId:', movieId);
    console.log('URL search params:', window.location.search);
    
    return {
        video: !!videoEl,
        episodes: !!episodeContainer,
        movieTitle: !!movieDetails,
        loading: !!loading,
        notification: !!notification,
        movieId: !!movieId
    };
}

// Test function để kiểm tra API
async function testAPI() {
    console.log('🔍 Testing API connection...');
    
    try {
        // Test endpoint cơ bản
        const response = await fetch('http://localhost:8080/api/cartoons');
        console.log('API cartoons response status:', response.status);
        
        if (movieId) {
            // Test endpoint cụ thể cho phim
            const movieResponse = await fetch(`http://localhost:8080/api/cartoons/${movieId}`);
            console.log('API movie response status:', movieResponse.status);
            
            if (movieResponse.ok) {
                const movieData = await movieResponse.json();
                console.log('Movie data:', movieData);
            }
            
            // Test endpoint episodes
            const episodesResponse = await fetch(`http://localhost:8080/api/cartoons/${movieId}/episodes`);
            console.log('API episodes response status:', episodesResponse.status);
            
            if (episodesResponse.ok) {
                const episodesData = await episodesResponse.json();
                console.log('Episodes data:', episodesData);
            }
        }
    } catch (error) {
        console.error('API test failed:', error);
    }
}

// Expose functions for debugging
window.debugCheckElements = debugCheckElements;
window.testAPI = testAPI;

// Force reload functions for debugging
window.forceLoadMovie = function() {
    console.log('🔧 Force loading movie data...');
    if (!movieId) {
        movieId = getMovieIdFromUrl();
        console.log('Updated movieId:', movieId);
    }
    if (movieId) {
        loadMovieData();
    } else {
        console.error('❌ No movieId found!');
    }
};

window.forceLoadEpisodes = function() {
    console.log('🔧 Force loading episodes...');
    if (movieId) {
        loadEpisodes();
    } else {
        console.error('❌ No movieId for episodes!');
    }
};