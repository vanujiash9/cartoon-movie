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

// Playback speeds
const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
let currentSpeedIndex = 3; // 1x

// Movie data
const movieId = getMovieIdFromUrl();
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

// Initialize video player
document.addEventListener('DOMContentLoaded', async function () {
    // Debug localStorage first
    debugLocalStorage();

    // Check authentication first
    const authStatus = await checkAuthentication();
    console.log('🔍 Auth status result:', authStatus, 'isAuthenticated:', isAuthenticated);

    // Show appropriate UI based on authentication
    updateAuthUI(authStatus);

    initializePlayer();
    setupEventListeners();
    loadMovieData();
    loadEpisodes();

    // Show loading
    showLoading();

    // Hide loading when video is ready
    if (video) {
        video.addEventListener('canplay', hideLoading);
        video.addEventListener('loadedmetadata', updateDuration);
    }

    // Load comments after a short delay
    setTimeout(() => {
        loadComments();
    }, 500);

    await loadLikeDislikeState();
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
    if (video) {
        video.volume = currentVolume;
        video.currentTime = 0;
    }
    updateVolumeDisplay();
    updateSpeedDisplay();
    updateProgress();
}

function setupEventListeners() {
    if (!video) return;

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
    });

    // Initialize focus for keyboard controls
    if (videoPlayer) {
        videoPlayer.setAttribute('tabindex', '0');
        videoPlayer.focus();
    }
}

// ===== MOVIE DATA LOADING =====

function loadMovieData() {
    if (!movieId) return;

    fetch(`http://localhost:8080/api/cartoons/${movieId}`)
        .then(res => res.json())
        .then(movie => {
            // Cập nhật tiêu đề trang
            document.title = movie.title + ' | Maxion';

            // Cập nhật tiêu đề hiển thị
            const h1 = document.querySelector('.movie-details h1');
            if (h1) h1.textContent = movie.title;

            // Cập nhật thông tin meta phim
            updateMovieInfo(movie);

            // Cập nhật mô tả phim
            const description = document.querySelector('.movie-details .description');
            if (description && movie.description) {
                description.textContent = movie.description;
            }

            // Cập nhật năm phát hành
            const yearElement = document.querySelector('.meta-item:nth-child(2) span:nth-child(2)');
            if (yearElement && movie.releaseYear) {
                yearElement.textContent = movie.releaseYear;
            }

            // Cập nhật thể loại
            const genreElement = document.querySelector('.meta-item:nth-child(4) span:nth-child(2)');
            if (genreElement && movie.genre) {
                genreElement.textContent = movie.genre;
            }
        })
        .catch(err => {
            console.error("Lỗi khi tải thông tin phim:", err);
        });
}

function loadEpisodes() {
    if (!movieId) {
        const container = document.getElementById('episodes-container');
        if (container) container.innerText = "Không tìm thấy id phim!";
        return;
    }

    fetch(`http://localhost:8080/api/cartoons/${movieId}/episodes`)
        .then(res => {
            console.log('Episodes API status:', res.status);
            console.log('Episodes API content-type:', res.headers.get('content-type'));
            if (!res.ok) throw new Error("Không tìm thấy tập phim!");

            // Kiểm tra content-type trước khi parse JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('API không trả về JSON, có thể là trang lỗi HTML');
            }

            return res.json();
        })
        .then(episodes => {
            console.log('[DEBUG] Episodes received:', episodes);
            const container = document.getElementById('episodes-container');
            console.log('[DEBUG] Container found:', container);

            if (episodes.length === 0) {
                // Nếu chưa có tập nào, hiển thị thông báo
                if (container) container.innerHTML = '<p>Phim này chưa có tập nào để xem.</p>';
            } else {
                // Sắp xếp tập theo thứ tự
                episodes.sort((a, b) => (a.episodeNumber || a.episode_number) - (b.episodeNumber || b.episode_number));
                console.log('[DEBUG] Episodes sorted:', episodes);

                // Lưu vào biến global
                currentEpisodes = episodes;
                // Lấy index tập đang xem từ localStorage (nếu có)
                let savedIndex = 0;
                const saved = localStorage.getItem(`currentEpisodeIndex_${movieId}`);
                if (saved !== null && !isNaN(Number(saved))) {
                    savedIndex = Math.max(0, Math.min(Number(saved), episodes.length - 1));
                }
                // Tự động phát tập đã lưu hoặc tập đầu tiên
                const episodeToPlay = episodes[savedIndex] || episodes[0];
                if (episodeToPlay && (episodeToPlay.videoUrl || episodeToPlay.video_url)) {
                    loadEpisode(episodeToPlay);
                }

                // Hiển thị danh sách tập theo hàng ngang với onclick đơn giản hơn
                const episodesHtml = episodes.map((ep, index) => `
                    <div class="episode-number-btn ${ep.id === episodeToPlay.id ? 'active' : ''}"
                         onclick="loadEpisodeByIndex(${index})"
                         data-episode-id="${ep.id}"
                         data-episode-number="${ep.episodeNumber || ep.episode_number}"
                         title="${ep.title}">
                        ${ep.episodeNumber || ep.episode_number}
                    </div>
                `).join('');

                console.log('[DEBUG] Episodes HTML:', episodesHtml);

                if (container) {
                    container.innerHTML = episodesHtml;
                    console.log('[DEBUG] Container updated');
                }
            }
        })
        .catch(err => {
            console.error("Lỗi khi tải danh sách tập:", err);
            const container = document.getElementById('episodes-container');
            if (container) container.innerText = "Không thể tải danh sách tập.";
        });
}

// ===== EPISODE MANAGEMENT =====

// Hàm load episode bằng index từ currentEpisodes array
function loadEpisodeByIndex(index) {
    if (currentEpisodes && currentEpisodes[index]) {
        const episode = currentEpisodes[index];
        loadEpisode(episode);
        // Lưu index tập đang xem vào localStorage
        localStorage.setItem(`currentEpisodeIndex_${movieId}`, index);
    } else {
        console.error('Không tìm thấy episode với index:', index);
    }
}

// Hàm load và phát một tập phim
function loadEpisode(episode) {
    console.log('Loading episode:', episode);
    console.log('Episode number:', episode.episodeNumber || episode.episode_number);
    console.log('Video URL:', episode.videoUrl || episode.video_url);

    // Update active episode first
    updateActiveEpisode(episode.episodeNumber || episode.episode_number);

    // Nếu là YouTube URL, chuyển đổi sang embed format
    let videoUrl = episode.videoUrl || episode.video_url;
    if (videoUrl && (videoUrl.includes('youtu.be/') || videoUrl.includes('youtube.com/watch'))) {
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

    // Đối với video thông thường (MP4, etc.), restore video element if needed
    let currentVideo = document.getElementById('videoElement');
    if (!currentVideo) {
        console.log('Restoring video element...');
        const videoContainer = document.querySelector('.video-player');
        if (videoContainer) {
            videoContainer.innerHTML = `
                <video class="video-element" id="videoElement" preload="metadata">
                    <source src="" type="video/mp4">
                    <track kind="captions" src="" srclang="vi" label="Tiếng Việt">
                    <track kind="captions" src="" srclang="en" label="English">
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
                <!-- Add back other video player UI elements if needed -->
            `;
            currentVideo = document.getElementById('videoElement');
        }
    }

    // Đối với video thông thường (MP4, etc.)
    if (currentVideo) {
        currentVideo.src = videoUrl;
        currentVideo.load();

        // Tự động phát
        currentVideo.play().catch(err => {
            console.log('Autoplay bị chặn:', err);
        });
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
    if (!video || !video.duration) return;

    const progress = (video.currentTime / video.duration) * 100;
    if (progressFilled) progressFilled.style.width = `${progress}%`;
    if (progressThumb) progressThumb.style.left = `${progress}%`;

    // Update time display
    const current = formatTime(video.currentTime);
    const duration = formatTime(video.duration);
    if (timeDisplay) timeDisplay.textContent = `${current} / ${duration}`;
}

function updateDuration() {
    if (!video) return;

    const duration = formatTime(video.duration);
    if (timeDisplay) timeDisplay.textContent = `00:00 / ${duration}`;
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
    showNotification('Video đã kết thúc', 'success');
    // Auto-play next episode or related video
    setTimeout(() => {
        showNotification('Đang tự động phát video tiếp theo...', 'success');
    }, 3000);
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
    // Gửi API like
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/cartoons/${movieId}/like`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? 'Bearer ' + token : undefined,
                'X-User-ID': currentUser.id.toString(),
                'X-Username': currentUser.username
            },
            body: JSON.stringify({ isLiked: !isLiked })
        });
        if (!res.ok) throw new Error('Không thể cập nhật trạng thái thích');
        const data = await res.json();
        isLiked = data.isLiked;
        isDisliked = false;
        likeCount = data.likeCount;
        dislikeCount = data.dislikeCount;
        updateLikeDislikeUI();
        showNotification(isLiked ? 'Đã thích phim!' : 'Đã bỏ thích!', 'success');
    } catch (e) {
        showNotification(e.message, 'error');
    }
}

async function toggleDislike() {
    if (!isAuthenticated || !currentUser) {
        showLoginPrompt();
        return;
    }
    // Gửi API dislike
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/cartoons/${movieId}/dislike`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? 'Bearer ' + token : undefined,
                'X-User-ID': currentUser.id.toString(),
                'X-Username': currentUser.username
            },
            body: JSON.stringify({ isDisliked: !isDisliked })
        });
        if (!res.ok) throw new Error('Không thể cập nhật trạng thái không thích');
        const data = await res.json();
        isDisliked = data.isDisliked;
        isLiked = false;
        likeCount = data.likeCount;
        dislikeCount = data.dislikeCount;
        updateLikeDislikeUI();
        showNotification(isDisliked ? 'Đã không thích phim!' : 'Đã bỏ không thích!', 'success');
    } catch (e) {
        showNotification(e.message, 'error');
    }
}

// ===== LIKE/DISLIKE COMMENT =====
async function likeComment(commentId, isLikedAction) {
    if (!isAuthenticated || !currentUser) {
        showLoginPrompt();
        return;
    }
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/cartoons/comments/${commentId}/like`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? 'Bearer ' + token : undefined,
                'X-User-ID': currentUser.id.toString(),
                'X-Username': currentUser.username
            },
            body: JSON.stringify({ isLiked: isLikedAction })
        });
        if (!res.ok) throw new Error('Không thể cập nhật like/dislike bình luận');
        const data = await res.json();

        // Cập nhật UI comment
        await loadComments();
        showNotification(isLikedAction ? 'Đã thích bình luận!' : 'Đã không thích bình luận!', 'success');
    } catch (e) {
        showNotification(e.message, 'error');
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
        const response = await fetch(`http://localhost:8080/api/cartoons/${movieId}/comments`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': currentUser.id.toString(), // Send user ID in header
                'X-Username': currentUser.username      // Send username in header
            },
            body: JSON.stringify({
                content: content,
                rating: parseInt(rating)
            })
        }); if (!response.ok) {
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

// ===== MISSING FUNCTIONS =====

// Toggle favorite movie
function toggleFavorite() {
    if (!isAuthenticated || !currentUser) {
        showLoginPrompt();
        return;
    }

    // TODO: Implement favorite functionality
    showNotification('Tính năng yêu thích đang được phát triển', 'info');
}

// Download movie
function downloadMovie() {
    if (!isAuthenticated || !currentUser) {
        showLoginPrompt();
        return;
    }

    showNotification('Tính năng tải xuống đang được phát triển', 'info');
}

// Share movie
function shareMovie() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: window.location.href
        }).then(() => {
            showNotification('Đã chia sẻ thành công!', 'success');
        }).catch(err => {
            console.error('Error sharing:', err);
            copyToClipboard();
        });
    } else {
        copyToClipboard();
    }
}

// Copy URL to clipboard
function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('Đã sao chép link vào clipboard!', 'success');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
        showNotification('Không thể sao chép link', 'error');
    });
}

// Update movie info display
function updateMovieInfo(movie) {
    console.log('🎬 Updating movie info:', movie);

    // Update title
    const titleElement = document.getElementById('movieTitle');
    if (titleElement && movie.title) {
        titleElement.textContent = movie.title;
    }

    // Update description
    const descElement = document.getElementById('movieDescription');
    if (descElement && movie.description) {
        descElement.textContent = movie.description;
    }

    // Update genre
    const genreElement = document.getElementById('movieGenre');
    if (genreElement && movie.genre) {
        genreElement.textContent = movie.genre;
    }

    // Update year
    const yearElement = document.getElementById('movieYear');
    if (yearElement && movie.releaseYear) {
        yearElement.textContent = movie.releaseYear;
    }

    // Update image
    const imageElement = document.getElementById('movieImage');
    if (imageElement && movie.imageUrl) {
        imageElement.src = movie.imageUrl;
        imageElement.alt = movie.title || 'Movie poster';
    }

    // Update total episodes
    const episodesElement = document.getElementById('totalEpisodes');
    if (episodesElement && movie.totalEpisodes) {
        episodesElement.textContent = `${movie.totalEpisodes} tập`;
    }

    // Update status
    const statusElement = document.getElementById('movieStatus');
    if (statusElement && movie.status) {
        statusElement.textContent = movie.status;
    }
}

// ===== COMMENTS FUNCTIONS =====

function toggleComments() {
    console.log('🔄 Toggle comments visibility');

    const commentsSection = document.getElementById('commentsSection');
    const toggleBtn = document.querySelector('.toggle-comments-btn');

    if (commentsSection) {
        commentsSection.classList.toggle('hidden');

        if (toggleBtn) {
            const isHidden = commentsSection.classList.contains('hidden');
            toggleBtn.textContent = isHidden ? 'Hiển thị bình luận' : 'Ẩn bình luận';
        }

        console.log('✅ Comments section toggled:', !commentsSection.classList.contains('hidden') ? 'visible' : 'hidden');
    } else {
        console.warn('❌ Comments section not found');
    }
}

// ===== LOAD LIKE/DISLIKE STATE ON PAGE LOAD =====
async function loadLikeDislikeState() {
    try {
        const res = await fetch(`http://localhost:8080/api/cartoons/${movieId}/like-stats`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Không thể lấy trạng thái like/dislike');
        const data = await res.json();
        isLiked = data.isLiked;
        isDisliked = data.isDisliked;
        likeCount = data.likeCount;
        dislikeCount = data.dislikeCount;
        updateLikeDislikeUI();
    } catch (e) {
        console.warn('Không thể lấy trạng thái like/dislike:', e.message);
    }
}

// Make functions available globally for onclick handlers
window.loadEpisodeByIndex = loadEpisodeByIndex;
window.togglePlayPause = togglePlayPause;
window.toggleMute = toggleMute;
window.changePlaybackSpeed = changePlaybackSpeed;
window.toggleFullscreen = toggleFullscreen;
window.toggleTheaterMode = toggleTheaterMode;
window.togglePictureInPicture = togglePictureInPicture;
window.toggleQuality = toggleQuality;
window.changeQuality = changeQuality;
window.toggleSubtitles = toggleSubtitles;
window.closePiP = closePiP;
window.goBack = goBack;
window.restartMovie = restartMovie;
window.postComment = postComment;
window.sortComments = sortComments;
window.likeComment = likeComment;
window.showReplyForm = showReplyForm;
window.hideReplyForm = hideReplyForm;
window.postReply = postReply;
window.deleteComment = deleteComment;
window.playRelatedMovie = playRelatedMovie;
window.logout = logout;
window.toggleLike = toggleLike;
window.toggleDislike = toggleDislike;
window.toggleFavorite = toggleFavorite;
window.downloadMovie = downloadMovie;
window.shareMovie = shareMovie;
window.toggleComments = toggleComments;
window.playRelatedMovie = playRelatedMovie;
window.postComment = postComment;
window.sortComments = sortComments;
window.likeComment = likeComment;
window.dislikeComment = dislikeComment;
window.logout = logout;
