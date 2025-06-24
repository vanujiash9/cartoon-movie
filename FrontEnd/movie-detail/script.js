// === GLOBAL HELPERS ===
// Dummy notification function if not globally available from another script
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info') {
        console.log(`[Notification] ${type.toUpperCase()}: ${message}`);
        
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            max-width: 300px;
            word-wrap: break-word;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 4000);
    }
}

// Helper function to validate and provide fallback for image URLs
function getValidImageUrl(url, fallback) {
    if (!url || url.trim() === '' || url.includes('/api/placeholder/')) {
        return fallback;
    }
    return url;
}

// Helper function to create SVG placeholder
function createSVGPlaceholder(text, width, height, bgColor = '#3498db', textColor = '#ffffff') {
    const svgContent = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" fill="${bgColor}"/>
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 10}" 
                  fill="${textColor}" font-weight="bold">${text.slice(0, 20)}</text>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
}

// === USER INTERFACE INITIALIZATION ===

// Initialize user interface and header features
function initializeUserInterface() {
    console.log('🔧 Initializing user interface...');
    
    // Update header login status
    updateHeaderLoginStatus();
    
    // Initialize voice search if available
    initializeVoiceSearch();
    
    // Initialize notification bell
    initializeNotificationBell();
    
    // Initialize user dropdown
    initializeUserDropdown();
    
    // Initialize search form
    initializeSearchForm();
    
    console.log('✅ User interface initialized');
}

// Update header login status
function updateHeaderLoginStatus() {
    console.log('🔍 updateHeaderLoginStatus called');

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email') || '';
    const fullName = localStorage.getItem('fullName') || '';

    console.log('📋 Login status check:', { token: !!token, username, email, fullName });

    // Get header elements
    const signInBtn = document.getElementById('signInBtn');
    const userMenu = document.getElementById('userMenu');
    const displayUserName = document.getElementById('displayUserName');
    const userAvatar = document.getElementById('userAvatar');

    console.log('🎯 Header elements:', {
        signInBtn: !!signInBtn,
        userMenu: !!userMenu,
        displayUserName: !!displayUserName,
        userAvatar: !!userAvatar
    });

    // Check login status (only need username)
    if (username) {
        console.log('✅ User is logged in:', username);

        if (signInBtn) {
            signInBtn.style.display = 'none';
            console.log('🔄 Hidden sign in button');
        }

        if (userMenu) {
            userMenu.style.display = 'flex';
            userMenu.classList.add('visible');
            console.log('🔄 Showed user menu');
        }

        if (displayUserName) {
            const displayName = fullName ? fullName : username;
            displayUserName.textContent = displayName;
            console.log('🎯 script.js set display name to:', displayName, 'from fullName:', fullName, 'username:', username);
        }

        if (userAvatar) {
            // Avatar with first letter of fullName if available, otherwise username
            const firstLetter = (fullName ? fullName : username).charAt(0).toUpperCase();
            userAvatar.src = `data:image/svg+xml;base64,${btoa(`
                <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <circle cx='20' cy='20' r='20' fill='#3498db'/>
                    <text x='20' y='26' text-anchor='middle' font-family='Arial' font-size='16' font-weight='bold' fill='white'>${firstLetter}</text>
                </svg>
            `)}`;
            console.log('🔄 Updated avatar:', firstLetter);
        }
    } else {
        console.log('❌ User not logged in');

        if (signInBtn) {
            signInBtn.style.display = 'flex';
            console.log('🔄 Showed sign in button');
        }

        if (userMenu) {
            userMenu.style.display = 'none';
            userMenu.classList.remove('visible');
            console.log('🔄 Hidden user menu');
        }
    }
}

// Initialize voice search functionality
function initializeVoiceSearch() {
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', startVoiceSearch);
        console.log('🎤 Voice search initialized');
    }
}

// Initialize notification bell
function initializeNotificationBell() {
    const bellIcon = document.querySelector('.notification-bell');
    const dropdown = document.querySelector('.notification-dropdown');
    
    if (bellIcon && dropdown) {
        bellIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            console.log('🔔 Notification dropdown toggled');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside it
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        console.log('🔔 Notification bell initialized');
    }
}

// Initialize user dropdown menu
function initializeUserDropdown() {
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            console.log('👤 User dropdown toggled');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside it
        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Handle logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                localStorage.removeItem('email');
                localStorage.removeItem('fullName');
                showNotification('Đã đăng xuất thành công!', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            });
        }

        console.log('👤 User dropdown initialized');
    }
}

// Initialize search form
function initializeSearchForm() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            const query = searchInput.value.trim();
            if (query) {
                showNotification(`Đang tìm kiếm: ${query}`, 'info');
                // Redirect to main page with search query
                window.location.href = `../index.html?search=${encodeURIComponent(query)}`;
            }
        });
        console.log('🔍 Search form initialized');
    }
}

// Voice search functionality
function startVoiceSearch() {
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification('Trình duyệt không hỗ trợ tìm kiếm giọng nói', 'error');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'vi-VN';

    recognition.start();
    
    recognition.onstart = function() {
        console.log('Voice search started...');
        showNotification('Đang nghe... Hãy nói từ khóa tìm kiếm', 'info');
        
        if (voiceBtn) {
            voiceBtn.style.color = 'var(--light-azure)';
            voiceBtn.style.transform = 'scale(1.2)';
        }
    };

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        console.log('Voice result:', speechResult);
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = speechResult;
            showNotification(`Đã nhận diện: "${speechResult}"`, 'success');
            // Auto-submit search
            setTimeout(() => {
                const searchForm = document.getElementById('searchForm');
                if (searchForm) {
                    searchForm.dispatchEvent(new Event('submit'));
                }
            }, 1000);
        }
    };

    recognition.onend = function() {
        console.log('Voice search ended.');
        
        if (voiceBtn) {
            voiceBtn.style.color = ''; // Reset color
            voiceBtn.style.transform = ''; // Reset scale
        }
    };

    recognition.onerror = function(event) {
        console.error('Voice search error:', event.error);
        showNotification('Lỗi tìm kiếm giọng nói: ' + event.error, 'error');
        
        if (voiceBtn) {
            voiceBtn.style.color = '';
            voiceBtn.style.transform = '';
        }
    };
}

// Show notification function
function showNotification(message, type = 'success') {
    // Check if we have an external notification system (avoid calling ourselves)
    if (window.showToast && typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Fallback toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set colors based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Adjust iframe height for footer
function adjustIframeHeight(iframe) {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const height = iframeDoc.body.scrollHeight;
        iframe.style.height = height + 'px';
        console.log('📐 Adjusted iframe height to:', height + 'px');
    } catch (error) {
        console.warn('Could not adjust iframe height:', error);
        // Set a default height if we can't access the content
        iframe.style.height = '200px';
    }
}

// === MAIN LOGIC ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Movie detail page loaded');
    
    // Initialize user interface first
    initializeUserInterface();
    
    // --- MOVIE DETAIL FETCHING ---
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    console.log('📋 URL Parameters:', {
        movieId,
        fullURL: window.location.href,
        search: window.location.search
    });

    if (movieId) {
        fetchMovieDetails(movieId);
        // In a real app, you'd also fetch episodes, reviews, etc.
        // fetchMovieEpisodes(movieId);
        // fetchMovieReviews(movieId);
    } else {
        console.warn('⚠️ No movie ID found in URL');
        handleFetchError('Không tìm thấy ID phim trong URL.');
    }

    // --- INITIALIZE EVENT LISTENERS ---
    setupEventListeners();
    
    // Add some global error handling
    window.addEventListener('error', (event) => {
        console.error('🚨 Global error:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('🚨 Unhandled promise rejection:', event.reason);
    });
});

// === DATA FETCHING FUNCTIONS ===

async function fetchMovieDetails(movieId) {
    const apiUrl = `http://localhost:8080/api/cartoons/${movieId}`;
    console.log(`🎬 Fetching details for movie ID: ${movieId} from ${apiUrl}`);
    
    // Show loading state
    showLoadingState();
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }        const movieResponse = await response.json();
        console.log('✅ API Response received:', movieResponse);
        
        // Extract the actual cartoon data from the API response
        const movie = movieResponse.cartoon || movieResponse;
        const stats = {
            likeCount: movieResponse.likeCount || 0,
            dislikeCount: movieResponse.dislikeCount || 0,
            isLiked: movieResponse.isLiked || false,
            isDisliked: movieResponse.isDisliked || false
        };
        
        console.log('✅ Movie details extracted successfully:', {
            id: movie.id,
            title: movie.title,
            description: movie.description ? movie.description.substring(0, 50) + '...' : 'No description',
            stats: stats,
            fields: Object.keys(movie)
        });
        populateMovieDetails(movie, stats);
    } catch (error) {
        console.error('❌ Failed to fetch movie details:', error);
        handleFetchError('Lỗi khi tải dữ liệu phim.', error.message);
    }
}

function showLoadingState() {
    const heroTitle = document.getElementById('movie-banner-title');
    const movieTitle = document.getElementById('movie-title');
    
    if (heroTitle) heroTitle.textContent = 'Đang tải...';
    if (movieTitle) movieTitle.textContent = 'Đang tải...';
}

// === DOM POPULATION FUNCTIONS ===

function populateMovieDetails(movie, stats = {}) {
    console.log('🎬 populateMovieDetails called with:');
    console.log('Raw movie data:', movie);
    console.log('Stats data:', stats);
    console.log('Movie object keys:', Object.keys(movie));
    
    // Handle different possible title fields and ensure we have a valid title
    const movieTitle = movie.title || movie.name || movie.movieTitle || 'Tên phim không xác định';
    const movieDescription = movie.description || movie.overview || movie.summary || 'Chưa có mô tả cho bộ phim này.';
    
    console.log('✅ Processed data:');
    console.log('- Final title:', movieTitle);
    console.log('- Final description:', movieDescription.substring(0, 100) + '...');
    console.log('- Original title field:', movie.title);
    console.log('- Original description field:', movie.description);
    
    // Update page title
    document.title = `${movieTitle} - Maxion`;

    // --- Hero Section ---
    const heroImg = document.getElementById('movie-banner-img');
    const heroTitle = document.getElementById('movie-banner-title');
    const heroDesc = document.getElementById('movie-banner-description');
    
    if(heroImg) {
        const bannerUrl = movie.bannerUrl || movie.imageUrl || movie.poster_path;
        if (bannerUrl && !bannerUrl.includes('/api/placeholder/')) {
            heroImg.src = bannerUrl;
            heroImg.onerror = () => {
                heroImg.src = createSVGPlaceholder(movieTitle, 1200, 500, '#2c3e50', '#ffffff');
            };
        } else {
            heroImg.src = createSVGPlaceholder(movieTitle, 1200, 500, '#2c3e50', '#ffffff');
        }
    }
    if(heroTitle) heroTitle.textContent = movieTitle;
    if(heroDesc) heroDesc.textContent = movieDescription;

    // --- Main Info Section ---
    const posterImg = document.getElementById('movie-poster-img');
    const mainMovieTitle = document.getElementById('movie-title');
    const metaInfo = document.getElementById('movie-meta-info');

    if(posterImg) {
        const posterUrl = movie.imageUrl || movie.poster_path || movie.bannerUrl;
        if (posterUrl && !posterUrl.includes('/api/placeholder/')) {
            posterImg.src = posterUrl;
            posterImg.onerror = () => {
                posterImg.src = createSVGPlaceholder(movieTitle, 300, 450, '#34495e', '#ffffff');
            };
        } else {
            posterImg.src = createSVGPlaceholder(movieTitle, 300, 450, '#34495e', '#ffffff');
        }
    }
    if(mainMovieTitle) mainMovieTitle.textContent = movieTitle;    if(metaInfo) {
        // Build meta info with better fallbacks
        const metaItems = [];
        
        if (movie.releaseYear) metaItems.push(`${movie.releaseYear}`);
        if (movie.totalEpisodes) {
            metaItems.push(`${movie.totalEpisodes} tập`);
        } else {
            metaItems.push('Đang cập nhật');
        }
        if (movie.status && movie.status.trim() !== '') {
            metaItems.push(movie.status);
        } else {
            metaItems.push('N/A');
        }
        if (movie.duration) {
            metaItems.push(`${movie.duration} phút`);
        } else {
            metaItems.push('24 phút'); // Default
        }
        
        // Age rating fallback
        metaItems.push(movie.ageRating || '13+');
        
        metaInfo.innerHTML = metaItems.map(item => `<span>${item}</span>`).join('');
    }// --- Action Buttons ---
    const watchNowBtn = document.getElementById('watch-now-btn');
    if(watchNowBtn) {
        watchNowBtn.onclick = () => {
            // Track user action if available
            if (window.trackUserAction) {
                window.trackUserAction('WATCH_MOVIE', movie.id);
            }
            window.location.href = `../movie-player/movie.html?id=${movie.id}`;
        };
    }
    
    // --- Like/Dislike Stats ---
    const ratingSection = document.querySelector('.movie-rating');
    if (ratingSection && stats) {
        // Add like/dislike stats after the rating
        let statsHtml = `
            <div class="movie-stats" style="margin-top: 10px; display: flex; gap: 15px; align-items: center;">
                <span class="stat-item" style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #27ae60;">👍</span>
                    <span>${stats.likeCount || 0} lượt thích</span>
                </span>
                <span class="stat-item" style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #e74c3c;">👎</span>
                    <span>${stats.dislikeCount || 0} không thích</span>
                </span>
            </div>
        `;
        
        // Remove existing stats if any
        const existingStats = ratingSection.querySelector('.movie-stats');
        if (existingStats) {
            existingStats.remove();
        }
        
        ratingSection.insertAdjacentHTML('afterend', statsHtml);
    }
    // Note: Add to list and Share buttons can be enhanced here

    // --- Overview Tab ---
    const overviewDesc = document.getElementById('movie-overview-description');
    const categoryList = document.getElementById('movie-category-list');

    if(overviewDesc) {
        overviewDesc.innerHTML = `<p>${movieDescription.replace(/\n/g, '</p><p>')}</p>`;
    }
      if(categoryList) {
        const genres = movie.genre || movie.genres;
        if (genres && genres.trim() !== '') {
            // Handle both comma-separated string and array
            const genreArray = Array.isArray(genres) ? genres : genres.split(',');
            const validGenres = genreArray.filter(g => g && g.trim() !== '').map(g => g.trim());
            
            if (validGenres.length > 0) {
                categoryList.innerHTML = validGenres.map(g => `<div class="category-item">${g}</div>`).join('');
            } else {
                categoryList.innerHTML = '<span>Đang cập nhật</span>';
            }
        } else {
            categoryList.innerHTML = '<span>Đang cập nhật</span>';
        }
    }
    
    // --- Trailer Modal ---
    const trailerModal = document.getElementById('trailer-modal');
    const playTrailerBtn = document.querySelector('.play-trailer-btn');
    if (trailerModal && movie.trailerUrl && movie.trailerUrl.trim() !== '') {
        const iframe = trailerModal.querySelector('iframe');
        if (iframe) {
            // Convert YouTube URLs to embed format if needed
            let embedUrl = movie.trailerUrl;
            if (movie.trailerUrl.includes('youtube.com/watch?v=')) {
                const videoId = movie.trailerUrl.split('v=')[1].split('&')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (movie.trailerUrl.includes('youtu.be/')) {
                const videoId = movie.trailerUrl.split('youtu.be/')[1].split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
            iframe.src = embedUrl;
        }
        if (playTrailerBtn) {
            playTrailerBtn.style.display = 'flex';
        }
    } else {
        // Hide trailer button if no trailer available
        if (playTrailerBtn) {
            playTrailerBtn.style.display = 'none';
        }
    }    console.log('✅ Movie details populated successfully for:', movieTitle);
    console.log('📊 Summary:');
    console.log('- Title:', movieTitle);
    console.log('- Description length:', movieDescription.length, 'chars');
    console.log('- Release year:', movie.releaseYear || 'N/A');
    console.log('- Total episodes:', movie.totalEpisodes || 'N/A');
    console.log('- Genre:', movie.genre || 'N/A');
    console.log('- Like count:', stats.likeCount || 0);
    console.log('- Has poster image:', !!(movie.imageUrl && !movie.imageUrl.includes('/api/placeholder/')));
    console.log('- Has banner image:', !!(movie.bannerUrl || movie.imageUrl));
    console.log('- Has trailer:', !!(movie.trailerUrl && movie.trailerUrl.trim()));
    
    // Initialize community discussion
    if (movie.id) {
        initializeCommunityDiscussion(movie.id);
    }
}

function handleFetchError(userMessage, technicalMessage = '') {
    console.error('🚨 Movie fetch error:', { userMessage, technicalMessage });
    
    const contentArea = document.querySelector('.movie-detail-content .container');
    if (contentArea) {
        contentArea.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; color: var(--text-color, #ffffff);">
                <h2 style="color: #e74c3c; margin-bottom: 20px;">❌ ${userMessage}</h2>
                <p style="margin-bottom: 15px;">Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau.</p>
                ${technicalMessage ? `
                    <details style="margin: 20px 0; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                        <summary style="cursor: pointer; color: var(--text-secondary, #cccccc); font-size: 0.9rem;">Chi tiết lỗi (nhấp để xem)</summary>
                        <pre style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; margin-top: 10px; font-size: 0.8rem; overflow-x: auto;">${technicalMessage}</pre>
                    </details>
                ` : ''}
                <div style="margin-top: 30px;">
                    <a href="../index.html" class="btn btn-primary" style="margin-right: 10px; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">🏠 Về trang chủ</a>
                    <button onclick="window.location.reload()" class="btn btn-outline" style="padding: 10px 20px; border: 1px solid #3498db; color: #3498db; background: transparent; border-radius: 5px; cursor: pointer;">🔄 Thử lại</button>
                </div>
            </div>
        `;
    }
    
    // Hide hero section if there's a total failure  
    const heroSection = document.querySelector('.movie-detail-hero');
    if(heroSection) {
        heroSection.style.display = 'none';
    }
    
    // Update page title to reflect error
    document.title = 'Lỗi tải phim - Maxion';
}


// === EVENT LISTENERS SETUP ===

function setupEventListeners() {
    // --- Tab Functionality ---
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // --- Modal Triggers ---
    const playTrailerBtn = document.querySelector('.play-trailer-btn');
    if(playTrailerBtn) {
        playTrailerBtn.addEventListener('click', () => openModal('trailer-modal'));
    }
    
    // This is a placeholder for episode clicks. This should be delegated if episodes are loaded dynamically.
    document.querySelectorAll('.episode-card').forEach(card => {
        card.addEventListener('click', () => {
            // In a real app, you'd pass the specific episode data to the player
            openModal('video-player-modal');
        });
    });

    // --- Modal Management (Global) ---
    document.querySelectorAll('.modal').forEach(modal => {
        // Close on background click
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal(this.id);
            }
        });
        // Close button inside modal
        const closeBtn = modal.querySelector('.close-btn, .close');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal.id));
        }
    });

    // Close modal on escape key
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal.id);
                }
            });
        }
    });
}

// === MODAL FUNCTIONS (made globally accessible) ===

window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';

        // If it's a video modal, pause the video to save resources
        const iframe = modal.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
            const originalSrc = iframe.src;
            iframe.src = ''; // This is a common trick to stop video playback
            iframe.src = originalSrc;
        }
    }
};

// Make share modal functions global if they are called from HTML onclick
window.openShareModal = function() {
    openModal('shareModal');
};
window.closeShareModal = function() {
    closeModal('shareModal');
};

// === COMMUNITY DISCUSSION FUNCTIONS ===

let currentUser = null;
let currentMovieId = null;
let isLoadingComments = false;

// Initialize community discussion
function initializeCommunityDiscussion(movieId) {
    currentMovieId = movieId;
    currentUser = getCurrentUser(); // Use shared function from shared-api.js
    
    // Debug user data
    console.log('🔍 Current user from localStorage:', currentUser);
    if (currentUser) {
        console.log('✅ User ID:', currentUser.id, 'Username:', currentUser.username);
    } else {
        console.log('❌ No user data found in localStorage');
    }
    
    // Load comments for the movie
    loadComments(movieId);
    
    // Setup event listeners for comment form
    setupCommentForm();
    
    // Update UI based on login status
    updateUIForLoginStatus();
}

// Update UI based on login status
function updateUIForLoginStatus() {
    const commentForm = document.getElementById('comment-form');
    const loginPrompt = document.getElementById('login-prompt');
    
    if (currentUser) {
        if (commentForm) commentForm.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';
    } else {
        if (commentForm) commentForm.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }
}

// Load comments for the movie
async function loadComments(movieId) {
    if (isLoadingComments) return;
    isLoadingComments = true;
    
    try {
        showCommentsLoading(true);
        
        const response = await fetch(`http://localhost:8080/api/comments/cartoon/${movieId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const comments = await response.json();
        console.log('✅ Comments loaded:', comments);
        
        renderComments(comments);
        showCommentsLoading(false);
        
    } catch (error) {
        console.error('❌ Error loading comments:', error);
        showCommentsError('Không thể tải bình luận. Vui lòng thử lại.');
        showCommentsLoading(false);
    } finally {
        isLoadingComments = false;
    }
}

// Show/hide comments loading state
function showCommentsLoading(show) {
    const loadingEl = document.getElementById('comments-loading');
    const commentsContainer = document.getElementById('comments-container');
    
    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
    if (commentsContainer && show) {
        commentsContainer.innerHTML = '';
    }
}

// Show comments error
function showCommentsError(message) {
    const commentsContainer = document.getElementById('comments-container');
    if (commentsContainer) {
        commentsContainer.innerHTML = `
            <div class="comments-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="loadComments(${currentMovieId})" class="retry-btn">Thử lại</button>
            </div>
        `;
    }
}

// Render comments list
function renderComments(comments) {
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;
    
    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="no-comments">
                <i class="fas fa-comments"></i>
                <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
        `;
        return;
    }
    
    // Filter only parent comments (not replies)
    const parentComments = comments.filter(comment => !comment.parentId);
    
    commentsContainer.innerHTML = parentComments.map(comment => renderComment(comment)).join('');
    
    // Setup event listeners for comment actions
    setupCommentEventListeners();
}

// Render a single comment
function renderComment(comment) {
    const isOwnComment = currentUser && (currentUser.id === comment.userId || currentUser.id === comment.user?.id);
    const canDelete = isOwnComment || (currentUser && currentUser.role === 'ADMIN');
    
    const repliesHtml = comment.replies && comment.replies.length > 0 
        ? comment.replies.map(reply => renderReply(reply, comment.id)).join('')
        : '';
    
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-main">
                <div class="comment-avatar">
                    <div class="avatar-circle">${comment.userAvatar || comment.userName.charAt(0).toUpperCase()}</div>
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.userName}</span>
                        <span class="comment-time">${formatCommentTime(comment.createdAt)}</span>
                        ${comment.rating ? `<span class="comment-rating">${'⭐'.repeat(comment.rating)}</span>` : ''}
                    </div>
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-actions">
                        <button class="action-btn like-btn ${comment.userLikeStatus === 'liked' ? 'active' : ''}" 
                                onclick="toggleCommentLike(${comment.id}, true)">
                            <i class="fas fa-thumbs-up"></i>
                            <span class="like-count">${comment.likeCount || 0}</span>
                        </button>
                        <button class="action-btn dislike-btn ${comment.userLikeStatus === 'disliked' ? 'active' : ''}" 
                                onclick="toggleCommentLike(${comment.id}, false)">
                            <i class="fas fa-thumbs-down"></i>
                            <span class="dislike-count">${comment.dislikeCount || 0}</span>
                        </button>
                        ${currentUser ? `
                            <button class="action-btn reply-btn" onclick="showReplyForm(${comment.id})">
                                <i class="fas fa-reply"></i> Trả lời
                            </button>
                        ` : ''}
                        ${canDelete ? `
                            <button class="action-btn delete-btn" onclick="deleteComment(${comment.id})">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            ${repliesHtml ? `<div class="comment-replies">${repliesHtml}</div>` : ''}
            
            <div class="reply-form-container" id="reply-form-${comment.id}" style="display: none;">
                <div class="reply-form">
                    <textarea placeholder="Viết câu trả lời..." id="reply-content-${comment.id}"></textarea>
                    <div class="reply-form-actions">
                        <button onclick="submitReply(${comment.id})" class="submit-reply-btn">Gửi</button>
                        <button onclick="hideReplyForm(${comment.id})" class="cancel-reply-btn">Hủy</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render a reply
function renderReply(reply, parentId) {
    const isOwnReply = currentUser && (currentUser.id === reply.userId || currentUser.id === reply.user?.id);
    const canDelete = isOwnReply || (currentUser && currentUser.role === 'ADMIN');
    
    return `
        <div class="comment-reply" data-comment-id="${reply.id}" data-parent-id="${parentId}">
            <div class="comment-avatar">
                <div class="avatar-circle small">${reply.userAvatar || reply.userName.charAt(0).toUpperCase()}</div>
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${reply.userName}</span>
                    <span class="comment-time">${formatCommentTime(reply.createdAt)}</span>
                </div>
                <div class="comment-text">${reply.content}</div>
                <div class="comment-actions">
                    ${canDelete ? `
                        <button class="action-btn delete-btn" onclick="deleteComment(${reply.id})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Format comment time
function formatCommentTime(timeString) {
    try {
        const date = new Date(timeString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return 'Không xác định';
    }
}

// Setup comment form
function setupCommentForm() {
    const commentForm = document.getElementById('comment-form');
    if (!commentForm) return;
    
    const submitBtn = commentForm.querySelector('.submit-comment-btn');
    const textarea = commentForm.querySelector('#comment-content');
    const ratingInputs = commentForm.querySelectorAll('input[name="rating"]');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitComment);
    }
    
    if (textarea) {
        textarea.addEventListener('input', function() {
            // Auto-resize textarea
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            
            // Update submit button state
            if (submitBtn) {
                submitBtn.disabled = this.value.trim().length === 0;
            }
        });
    }
}

// Submit new comment
async function submitComment() {
    if (!currentUser) {
        showNotification('Bạn cần đăng nhập để bình luận', 'warning');
        return;
    }
    
    const content = document.getElementById('comment-content').value.trim();
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const rating = ratingEl ? parseInt(ratingEl.value) : 5;
    
    if (!content) {
        showNotification('Vui lòng nhập nội dung bình luận', 'warning');
        return;
    }
    
    // Debug the request data
    console.log('🚀 Submitting comment:', {
        currentUser,
        movieId: currentMovieId,
        content,
        rating,
        headers: {
            'X-User-ID': currentUser.id?.toString(),
            'X-Username': currentUser.username
        }
    });
      try {
        console.log('🚀 Posting comment with data:', {
            movieId: currentMovieId,
            content: content,
            rating: rating,
            user: currentUser
        });
          const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': currentUser.id.toString(),
            'X-Username': currentUser.username,
            'Authorization': `Bearer token_${currentUser.id}_${Date.now()}`
        };
        
        console.log('📋 Request headers:', headers);
        
        const response = await fetch(`http://localhost:8080/api/comments/cartoon/${currentMovieId}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                content: content,
                rating: rating
            })
        });
          if (!response.ok) {
            console.log('❌ Response status:', response.status);
            console.log('❌ Response headers:', Object.fromEntries(response.headers.entries()));
            
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                const textData = await response.text();
                console.log('❌ Response text:', textData);
                errorData = { error: textData || 'Không thể đăng bình luận' };
            }
            
            console.log('❌ Error data:', errorData);
            throw new Error(errorData.error || 'Không thể đăng bình luận');
        }
        
        const newComment = await response.json();
        console.log('✅ Comment posted:', newComment);
        
        // Clear form
        document.getElementById('comment-content').value = '';
        document.querySelector('input[name="rating"]:checked').checked = false;
        document.querySelector('input[name="rating"][value="5"]').checked = true;
        
        // Reload comments
        loadComments(currentMovieId);
        
        showNotification('Đã đăng bình luận thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error posting comment:', error);
        showNotification(error.message, 'error');
    }
}

// Show reply form
function showReplyForm(commentId) {
    if (!currentUser) {
        showNotification('Bạn cần đăng nhập để trả lời', 'warning');
        return;
    }
    
    // Hide all other reply forms
    document.querySelectorAll('.reply-form-container').forEach(form => {
        form.style.display = 'none';
    });
    
    // Show the specific reply form
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'block';
        const textarea = replyForm.querySelector('textarea');
        if (textarea) {
            textarea.focus();
        }
    }
}

// Hide reply form
function hideReplyForm(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'none';
        const textarea = replyForm.querySelector('textarea');
        if (textarea) {
            textarea.value = '';
        }
    }
}

// Submit reply
async function submitReply(parentId) {
    if (!currentUser) {
        showNotification('Bạn cần đăng nhập để trả lời', 'warning');
        return;
    }
    
    const content = document.getElementById(`reply-content-${parentId}`).value.trim();
    
    if (!content) {
        showNotification('Vui lòng nhập nội dung trả lời', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8080/api/comments/cartoon/${currentMovieId}`, {
            method: 'POST',            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': currentUser.id.toString(),
                'X-Username': currentUser.username,
                'Authorization': `Bearer token_${currentUser.id}_${Date.now()}`
            },
            body: JSON.stringify({
                content: content,
                rating: 5, // Default rating for replies
                parentId: parentId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Không thể gửi trả lời');
        }
        
        const newReply = await response.json();
        console.log('✅ Reply posted:', newReply);
        
        // Hide reply form
        hideReplyForm(parentId);
        
        // Reload comments
        loadComments(currentMovieId);
        
        showNotification('Đã gửi trả lời thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error posting reply:', error);
        showNotification(error.message, 'error');
    }
}

// Toggle comment like/dislike
async function toggleCommentLike(commentId, isLike) {
    if (!currentUser) {
        showNotification('Bạn cần đăng nhập để thực hiện hành động này', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8080/api/comments/${commentId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isLike: isLike
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể thực hiện hành động');
        }
        
        const result = await response.json();
        console.log('✅ Like/dislike result:', result);
        
        if (result.success) {
            // Update UI
            updateCommentLikeUI(commentId, result.likeCount, result.dislikeCount, result.action);
            
            let message = '';
            switch (result.action) {
                case 'liked':
                    message = 'Đã thích bình luận';
                    break;
                case 'disliked':
                    message = 'Đã không thích bình luận';
                    break;
                case 'removed':
                    message = 'Đã hủy đánh giá';
                    break;
            }
            showNotification(message, 'success');
        }
        
    } catch (error) {
        console.error('❌ Error toggling like:', error);
        showNotification(error.message, 'error');
    }
}

// Update comment like UI
function updateCommentLikeUI(commentId, likeCount, dislikeCount, action) {
    const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentEl) return;
    
    const likeBtn = commentEl.querySelector('.like-btn');
    const dislikeBtn = commentEl.querySelector('.dislike-btn');
    const likeCountEl = commentEl.querySelector('.like-count');
    const dislikeCountEl = commentEl.querySelector('.dislike-count');
    
    // Update counts
    if (likeCountEl) likeCountEl.textContent = likeCount;
    if (dislikeCountEl) dislikeCountEl.textContent = dislikeCount;
    
    // Update button states
    if (likeBtn && dislikeBtn) {
        likeBtn.classList.remove('active');
        dislikeBtn.classList.remove('active');
        
        if (action === 'liked') {
            likeBtn.classList.add('active');
        } else if (action === 'disliked') {
            dislikeBtn.classList.add('active');
        }
    }
}

// Delete comment
async function deleteComment(commentId) {
    if (!currentUser) {
        showNotification('Bạn cần đăng nhập để xóa bình luận', 'warning');
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Không thể xóa bình luận');
        }
        
        const result = await response.json();
        console.log('✅ Comment deleted:', result);
        
        // Reload comments
        loadComments(currentMovieId);
        
        showNotification('Đã xóa bình luận thành công!', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting comment:', error);
        showNotification(error.message, 'error');
    }
}

// Setup comment event listeners
function setupCommentEventListeners() {
    // This function is called after comments are rendered
    // Most event listeners are inline for simplicity, but you can add more here if needed
}

// === DEBUG FUNCTIONS FOR TESTING ===

// Create a test user and login automatically
async function createTestUserAndLogin() {
    try {
        // First try to register a test user
        const registerResponse = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser',
                password: '123456',
                fullName: 'Test User',
                email: 'testuser@test.com'
            })
        });
        
        if (registerResponse.ok) {
            console.log('✅ Test user registered successfully');
        } else {
            console.log('⚠️ Test user might already exist, proceeding with login...');
        }
        
        // Then login
        const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser',
                password: '123456'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login successful:', loginData);
            
            // Create user object to store in localStorage
            const userData = {
                id: loginData.user ? loginData.user.id : 1,
                username: loginData.user ? loginData.user.username : 'testuser',
                fullName: loginData.user ? loginData.user.fullName : 'Test User',
                email: loginData.user ? loginData.user.email : 'testuser@test.com',
                role: loginData.user ? loginData.user.role : 'USER',
                avatar: 'T'
            };
            
            // Store user data and token
            localStorage.setItem('currentUser', JSON.stringify(userData));
            if (loginData.token) {
                localStorage.setItem('authToken', loginData.token);
            }
            
            // Refresh the current user and update UI
            currentUser = getCurrentUser();
            updateHeaderLoginStatus();
            updateUIForLoginStatus();
            
            showNotification(`Đã đăng nhập thành công với tài khoản: ${userData.fullName}`, 'success');
            return userData;
        } else {
            const errorData = await loginResponse.json();
            throw new Error(errorData.message || 'Login failed');
        }
        
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        showNotification(`Lỗi tạo user test: ${error.message}`, 'error');
        
        // Fallback to simple simulation
        simulateLogin();
    }
}

// Simulate user login for testing (fallback)
function simulateLogin(username = 'testuser', fullName = 'Test User', id = 999) {
    const userData = {
        id: id,
        username: username,
        fullName: fullName,
        email: `${username}@test.com`,
        role: 'USER',
        avatar: fullName.substring(0, 1).toUpperCase()
    };
    
    // Also store authentication token
    const authToken = `token_${id}_${Date.now()}`;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    console.log('✅ Simulated login for:', userData);
    console.log('📋 Auth token:', authToken);
    
    // Refresh the current user and update UI
    currentUser = getCurrentUser();
    updateHeaderLoginStatus();
    updateUIForLoginStatus();
    
    showNotification(`Đã đăng nhập thành công với tài khoản: ${fullName}`, 'success');
}

// Simulate logout for testing
function simulateLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    currentUser = null;
    updateHeaderLoginStatus();
    updateUIForLoginStatus();
    
    console.log('✅ Simulated logout');
    showNotification('Đã đăng xuất thành công', 'info');
}

// Make debug functions available globally for console testing
window.createTestUserAndLogin = createTestUserAndLogin;
window.simulateLogin = simulateLogin;
window.simulateLogout = simulateLogout;

// === END DEBUG FUNCTIONS ===