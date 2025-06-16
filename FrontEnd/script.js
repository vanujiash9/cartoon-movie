'use strict';

// ====================================
// IFRAME INITIALIZATION FUNCTIONS
// ====================================

// Initialize functions that need to be available immediately
function initHeaderIframe() {
    console.log('🎯 Header is now integrated, no iframe needed');
    // Header is now integrated directly into index.html
}

function initFooterIframe() {
    console.log('🎯 Footer iframe initialized');
    // Function content will be handled later in script
}

// Movie data
const movies = [
    {
        title: 'Red Notice',
        genre: 'Hành động/Hài',
        year: '2021',
        rating: '6.3',
        categories: ['action', 'comedy']
    },
    {
        title: 'Spider-Man: Homecoming',
        genre: 'Hành động/Thám hiểm',
        year: '2017',
        rating: '7.4',
        categories: ['action', 'adventure']
    },
    {
        title: 'Ma Trận: Hồi Sinh',
        genre: 'Khoa học viễn tưởng/Hành động',
        year: '2021',
        rating: '5.6',
        categories: ['scifi', 'action']
    },
    {
        title: 'Bất Tử',
        genre: 'Phiêu lưu/Hành động',
        year: '2021',
        rating: '6.3',
        categories: ['adventure', 'action']
    },
    {
        title: 'Dune: Phần Một',
        genre: 'Khoa học viễn tưởng/Phiêu lưu',
        year: '2021',
        rating: '8.0',
        categories: ['scifi', 'adventure']
    },
    {
        title: '1917',
        genre: 'Chiến tranh/Chính kịch',
        year: '2019',
        rating: '8.2',
        categories: ['war', 'drama']
    },
    {
        title: 'Shang-Chi và Huyền Thoại Mười Chiếc Nhẫn',
        genre: 'Hành động/Giả tưởng',
        year: '2021',
        rating: '7.4',
        categories: ['action', 'fantasy']
    },
    {
        title: 'Casino Royale',
        genre: 'Hành động/Phiêu lưu',
        year: '2006',
        rating: '8.0',
        categories: ['action', 'adventure']
    },
    {
        title: 'The Dark Knight',
        genre: 'Hành động/Phiêu lưu',
        year: '2008',
        rating: '9.0',
        categories: ['action', 'adventure']
    },
    {
        title: 'Black Panther',
        genre: 'Hành động/Phiêu lưu',
        year: '2018',
        rating: '7.3',
        categories: ['action', 'adventure']
    },
    {
        title: 'Venom',
        genre: 'Hành động/Phiêu lưu',
        year: '2018',
        rating: '6.6',
        categories: ['action', 'adventure']
    },
    {
        title: 'Chúa Nhẫn: Sự Trở Về Của Nhà Vua',
        genre: 'Giả tưởng/Phiêu lưu',
        year: '2003',
        rating: '9.0',
        categories: ['fantasy', 'adventure']
    },
    {
        title: 'Saving Private Ryan',
        genre: 'Chiến tranh/Hành động',
        year: '1998',
        rating: '8.6',
        categories: ['war', 'action']
    },
    {
        title: 'Interstellar',
        genre: 'Khoa học viễn tưởng/Phiêu lưu',
        year: '2014',
        rating: '8.7',
        categories: ['scifi', 'adventure']
    },
    {
        title: 'Gladiator',
        genre: 'Hành động/Phiêu lưu',
        year: '2000',
        rating: '8.5',
        categories: ['action', 'adventure']
    },
    {
        title: 'Avengers: Endgame',
        genre: 'Hành động/Khoa học viễn tưởng',
        year: '2019',
        rating: '8.5',
        categories: ['action', 'scifi']
    },
    {
        title: 'Wonder Woman 1984',
        genre: 'Hành động/Phiêu lưu',
        year: '2020',
        rating: '5.4',
        categories: ['action', 'adventure']
    },
    {
        title: 'Captain Marvel',
        genre: 'Hành động/Khoa học viễn tưởng',
        year: '2019',
        rating: '5.4',
        categories: ['action', 'scifi']
    }
];

// DOM elements
const genreFilter = document.getElementById('genreFilter');
const yearFilter = document.getElementById('yearFilter');
const moviesGrid = document.getElementById('moviesGrid');
const loadMoreBtn = document.getElementById('loadMore');

// State variables
let currentMovies = [];
let displayedMovies = 0;
const moviesPerPage = 9;
let bookmarkedMovies = JSON.parse(localStorage.getItem('bookmarkedMovies') || '[]');
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let watchHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if coming from login page
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
      if (referrer.includes('login-success') || urlParams.get('login') === 'success') {
        console.log('Detected return from login, forcing header update...');
        console.log('URL params:', Array.from(urlParams.entries()));
        console.log('Referrer:', referrer);
        
        // Clear the URL parameters to avoid repeated detection
        if (urlParams.get('login') === 'success') {
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
        
        // Immediate attempts
        setTimeout(() => updateHeaderLoginStatus(), 100);
        setTimeout(() => updateHeaderLoginStatus(), 300);
        
        // Medium delay attempts
        setTimeout(() => updateHeaderLoginStatus(), 800);
        setTimeout(() => updateHeaderLoginStatus(), 1500);
        
        // Long delay attempts for stubborn cases
        setTimeout(() => updateHeaderLoginStatus(), 3000);
        setTimeout(() => updateHeaderLoginStatus(), 5000);
    }
    
    initializeApp();
    
    // Additional check after DOM fully loaded
    setTimeout(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (token && username) {
            console.log('Found user login data after DOM load, updating header...');
            updateHeaderLoginStatus();
        }
    }, 2000);
});

// Initialize application
function initializeApp() {
    console.log('Initializing app with', movies.length, 'movies');
    currentMovies = [...movies];
    displayMovies();
    animateProgressBars();
    setupEventListeners();
    updateQuickStats();
    
    // Check and update header login status after a short delay
    setTimeout(() => {
        updateHeaderLoginStatus();
    }, 1000);
    
    // Update debug panel
    updateDebugPanel();
    
    // Additional check for login status after longer delay
    setTimeout(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (token && username) {
            console.log('Found login data after app init, force updating header...');
            updateHeaderLoginStatus();
        }
    }, 2000);
    
    // Initialize hash navigation
    initializeHashNavigation();
    
    // Show welcome message for first-time visitors
    if (!localStorage.getItem('hasVisited')) {
        setTimeout(() => {
            showNotification('Chào mừng đến với Maxion! Khám phá hàng nghìn bộ phim chất lượng cao.', 'success');
            localStorage.setItem('hasVisited', 'true');
        }, 2000);
    }
}

// Tích hợp API backend lấy danh sách phim
function fetchMoviesFromAPI() {
    fetch('http://localhost:8080/api/cartoons')
        .then(res => res.json())
        .then(data => {
            console.log('[API] Dữ liệu trả về:', data);
            if (Array.isArray(data) && data.length > 0) {
                window.movies = data.map(item => ({
                    title: item.title || '',
                    description: item.description || '',
                    year: item.releaseYear ? String(item.releaseYear) : '',
                    imageUrl: item.imageUrl || '',
                    genre: item.genre || '',
                    status: item.status || '',
                    trailerUrl: item.trailerUrl || '',
                    videoUrl: item.videoUrl || '',
                    totalEpisodes: item.totalEpisodes || '',
                }));
                currentMovies = [...window.movies];
                console.log('[API] Đã lấy dữ liệu phim từ backend:', currentMovies);
                displayMovies();
            } else {
                console.warn('[API] API trả về mảng rỗng hoặc không hợp lệ, dùng dữ liệu mẫu.');
                currentMovies = [...movies];
                displayMovies();
            }
        })
        .catch(err => {
            console.error('[API] Không thể lấy dữ liệu từ backend, dùng dữ liệu mẫu.', err);
            currentMovies = [...movies];
            displayMovies();
        });
}

// Gọi hàm fetchMoviesFromAPI khi khởi tạo app
function initializeApp() {
    fetchMoviesFromAPI();
    animateProgressBars();
    setupEventListeners();
    updateQuickStats();
    initializeHashNavigation();
    if (!localStorage.getItem('hasVisited')) {
        setTimeout(() => {
            showNotification('Chào mừng đến với Maxion! Khám phá hàng nghìn bộ phim chất lượng cao.', 'success');
            localStorage.setItem('hasVisited', 'true');
        }, 2000);
    }
}

// ====================================
// HASH NAVIGATION SYSTEM
// ====================================

function initializeHashNavigation() {
    // Handle hash on page load
    window.addEventListener('load', function() {
        handleHashNavigation();
    });
    
    // Handle hash changes
    window.addEventListener('hashchange', function() {
        handleHashNavigation();
    });
    
    // Handle initial hash if page is already loaded
    if (document.readyState === 'complete') {
        setTimeout(handleHashNavigation, 500);
    }
}

function handleHashNavigation() {
    const hash = window.location.hash.substring(1);
    console.log('Handling hash navigation:', hash);
    
    if (hash && hash !== 'top') {
        setTimeout(() => {
            const target = document.getElementById(hash);
            if (target) {
                // Calculate offset for fixed header
                const headerHeight = 100; // Adjust based on your header height
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                showNotification(`Đã đến: ${getSectionDisplayName(hash)}`, 'success');
            } else {
                console.warn('Section not found:', hash);
            }
        }, 1000); // Delay to ensure page is fully loaded
    } else if (hash === 'top' || hash === '') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (hash === 'top') {
            showNotification('Đã về đầu trang', 'success');
        }
    }
}

function getSectionDisplayName(sectionId) {
    const sectionNames = {
        'movies': 'Danh sách phim',
        'achievements': 'Thành tựu',
        'category': 'Thể loại',
        'live': 'TV Trực tiếp',
        'top': 'Đầu trang'
    };
    
    return sectionNames[sectionId] || sectionId;
}

// Setup event listeners
function setupEventListeners() {
    // Filters
    if (genreFilter) {
        genreFilter.addEventListener('change', filterMovies);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', filterMovies);
    }
    
    // Radio filters
    document.querySelectorAll('input[name="grade"]').forEach(radio => {
        radio.addEventListener('change', sortMovies);
    });
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreMovies);
    }
    
    // Smooth scrolling for navigation links (fallback)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                const headerHeight = 100;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update hash without triggering hashchange
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });
}

// Movie filtering and sorting
function filterMovies() {
    const selectedGenre = genreFilter.value;
    const selectedYear = yearFilter.value;
    
    console.log('Filtering:', selectedGenre, selectedYear);
    
    currentMovies = movies.filter(movie => {
        const genreMatch = selectedGenre === 'all' || movie.categories.includes(selectedGenre);
        const yearMatch = selectedYear === 'all' || checkYearRange(movie.year, selectedYear);
        
        return genreMatch && yearMatch;
    });
    
    console.log('Filtered movies:', currentMovies.length);
    displayMovies();
    showNotification(`Tìm thấy ${currentMovies.length} phim phù hợp`, 'success');
}

function filterByCategory(category) {
    if (genreFilter) {
        genreFilter.value = category;
        filterMovies();
        
        // Scroll to movies section with hash
        window.location.hash = 'movies';
        
        showNotification(`Lọc theo: ${getGenreDisplayName(category)}`, 'success');
    }
}

function getGenreDisplayName(genre) {
    const genreNames = {
        'action': 'Hành động',
        'adventure': 'Phiêu lưu',
        'animation': 'Hoạt hình',
        'comedy': 'Hài',
        'drama': 'Chính kịch',
        'fantasy': 'Giả tưởng',
        'horror': 'Kinh dị',
        'scifi': 'Khoa học viễn tưởng',
        'war': 'Chiến tranh',
        'thriller': 'Thriller',
        'crime': 'Tội phạm'
    };
    
    return genreNames[genre] || genre;
}

function checkYearRange(movieYear, yearRange) {
    const year = parseInt(movieYear);
    
    switch(yearRange) {
        case '2024': return year === 2024;
        case '2020-2023': return year >= 2020 && year <= 2023;
        case '2010-2019': return year >= 2010 && year <= 2019;
        case '2000-2009': return year >= 2000 && year <= 2009;
        case '1980-1999': return year >= 1980 && year <= 1999;
        default: return true;
    }
}

function sortMovies() {
    const selectedSort = document.querySelector('input[name="grade"]:checked').id;
    
    console.log('Sorting by:', selectedSort);
    
    switch(selectedSort) {
        case 'popular':
            currentMovies.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            break;
        case 'newest':
            currentMovies.sort((a, b) => parseInt(b.year) - parseInt(a.year));
            break;
        case 'featured':
        default:
            // Reset to original filtered list
            const selectedGenre = genreFilter ? genreFilter.value : 'all';
            const selectedYear = yearFilter ? yearFilter.value : 'all';
            
            currentMovies = [...movies].filter(movie => {
                const genreMatch = selectedGenre === 'all' || movie.categories.includes(selectedGenre);
                const yearMatch = selectedYear === 'all' || checkYearRange(movie.year, selectedYear);
                
                return genreMatch && yearMatch;
            });
            break;
    }
    
    displayMovies();
}

// Display movies
function displayMovies() {
    console.log('Displaying movies:', currentMovies.length);
    
    if (!moviesGrid) {
        console.error('Movies grid not found!');
        return;
    }
    
    displayedMovies = 0;
    moviesGrid.innerHTML = '';
    
    if (currentMovies.length === 0) {
        moviesGrid.innerHTML = `
            <div class="empty-state">
                <h3>🎬 Không tìm thấy phim</h3>
                <p>Không có phim nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
            </div>
        `;
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    loadMoreMovies();
}

function loadMoreMovies() {
    const startIndex = displayedMovies;
    const endIndex = Math.min(startIndex + moviesPerPage, currentMovies.length);
    
    console.log('Loading movies from', startIndex, 'to', endIndex);
    
    for (let i = startIndex; i < endIndex; i++) {
        const movie = currentMovies[i];
        const movieCard = createMovieCard(movie, i);
        moviesGrid.appendChild(movieCard);
    }
    
    displayedMovies = endIndex;
    
    // Hide load more button if all movies are displayed
    if (loadMoreBtn) {
        if (displayedMovies >= currentMovies.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
    
    // Add animation to new cards
    const newCards = moviesGrid.querySelectorAll('.movie-card:nth-last-child(-n+' + (endIndex - startIndex) + ')');
    newCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

function createMovieCard(movie, index) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    let imgSrc = '';
    let useSVG = false;
    if (movie.imageUrl && typeof movie.imageUrl === 'string' && movie.imageUrl.trim() !== '') {
        imgSrc = movie.imageUrl.trim();
    } else {
        useSVG = true;
    }
    const fallbackSVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg width=\"200\" height=\"280\" viewBox=\"0 0 200 280\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n\n            <rect width=\"200\" height=\"280\" fill=\"#3498db\"/>\n            <text x=\"100\" y=\"120\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"18\" fill=\"white\" font-weight=\"bold\">${(movie.title||'').slice(0,32)}</text>\n            <text x=\"100\" y=\"150\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"13\" fill=\"#e0e0e0\">${movie.year||''}</text>\n            <text x=\"100\" y=\"170\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"12\" fill=\"#e0e0e0\">${(movie.genre||'').slice(0,32)}</text>\n        </svg>`);
    let statusBadge = '';
    if (movie.status) {
        let badgeColor = 'gray';
        let badgeText = '';
        switch (movie.status.toLowerCase()) {
            case 'active':
                badgeColor = '#27ae60'; badgeText = 'Đang chiếu'; break;
            case 'inactive':
                badgeColor = '#e74c3c'; badgeText = 'Ngừng chiếu'; break;
            case 'coming soon':
                badgeColor = '#f1c40f'; badgeText = 'Sắp ra mắt'; break;
            default:
                badgeColor = '#7f8c8d'; badgeText = movie.status;
        }
        statusBadge = `<span class=\"movie-status-badge\" style=\"background:${badgeColor};color:#fff;padding:2px 10px;border-radius:8px;font-size:12px;position:absolute;bottom:10px;right:10px;z-index:2;\">${badgeText}</span>`;
    }
    movieCard.innerHTML = `
        <div class=\"card-head\">
            <img src=\"${useSVG ? fallbackSVG : imgSrc}\" alt=\"${movie.title || ''}\" class=\"card-img\" style=\"object-fit:cover;width:100%;height:100%;border-radius:15px;\" onerror=\"this.onerror=null;this.src='${fallbackSVG}'\">
            ${movie.trailerUrl ? `<video class=\"trailer-video\" src=\"${movie.trailerUrl}\" muted loop preload=\"none\" style=\"display:none;width:100%;height:100%;object-fit:cover;border-radius:15px;\"></video>` : ''}
            <div class=\"card-overlay\">
                <div class=\"play\" onclick=\"playMovie('${movie.title}')\">
                    <span>▶️</span>
                </div>
            </div>
            ${statusBadge}
        </div>
        <div class=\"card-body\">
            <h3 class=\"card-title\">${movie.title || ''}</h3>
            <div class=\"card-info\">
                <span class=\"genre\">${movie.genre || ''}</span>
                <span class=\"year\">${movie.year || ''}</span>
            </div>
            <p class=\"card-desc\">${movie.description || ''}</p>
        </div>
        <div class=\"movie-detail-popup\">
            <div class=\"popup-header\">
                <span class=\"popup-title\">${movie.title || ''}</span>
                <span class=\"popup-subtitle\">${movie.englishTitle || ''}</span>
            </div>
            <div class=\"popup-actions\">
                <button class=\"popup-btn popup-watch\">▶ Xem ngay</button>
                <button class=\"popup-btn popup-like\">❤ Thích</button>
                <button class=\"popup-btn popup-detail\">Chi tiết</button>
            </div>
            <div class=\"popup-info\">
                <span class=\"imdb\">IMDb ${movie.imdb || ''}</span>
                <span class=\"quality\">${movie.quality || '4K'}</span>
                <span class=\"age\">${movie.age || 'T16'}</span>
                <span class=\"year\">${movie.year || ''}</span>
                <span class=\"season\">${movie.season ? 'Phần ' + movie.season : ''}</span>
                <span class=\"episode\">${movie.episode ? 'Tập ' + movie.episode : ''}</span>
            </div>
            <div class=\"popup-genres\">${movie.categories ? movie.categories.map(c => `<span>${c}</span>`).join(' • ') : ''}</div>
            <div class=\"popup-desc\">${movie.description || ''}</div>
        </div>
    `;
    // Hiệu ứng hover: show video, hide img
    movieCard.addEventListener('mouseenter', function() {
        const video = movieCard.querySelector('.trailer-video');
        const img = movieCard.querySelector('.card-img');
        if (video) {
            video.style.display = 'block';
            video.play();
            if (img) img.style.display = 'none';
        }
        // Hiện popup
        const popup = movieCard.querySelector('.movie-detail-popup');
        if (popup) popup.classList.add('show');
    });
    movieCard.addEventListener('mouseleave', function() {
        const video = movieCard.querySelector('.trailer-video');
        const img = movieCard.querySelector('.card-img');
        if (video) {
            video.pause();
            video.currentTime = 0;
            video.style.display = 'none';
            if (img) img.style.display = 'block';
        }
        // Ẩn popup
        const popup = movieCard.querySelector('.movie-detail-popup');
        if (popup) popup.classList.remove('show');
    });
    return movieCard;
}

// Bookmark functionality
function toggleBookmark(movieTitle, element) {
    const index = bookmarkedMovies.indexOf(movieTitle);
    
    if (index > -1) {
        bookmarkedMovies.splice(index, 1);
        element.classList.remove('active');
        showNotification(`Đã xóa "${movieTitle}" khỏi danh sách yêu thích`, 'success');
    } else {
        bookmarkedMovies.push(movieTitle);
        element.classList.add('active');
        showNotification(`Đã thêm "${movieTitle}" vào danh sách yêu thích`, 'success');
    }
    
    localStorage.setItem('bookmarkedMovies', JSON.stringify(bookmarkedMovies));
    updateQuickStats();
    updateFooterStats();
    
    // Add feedback animation
    element.style.transform = 'scale(1.2)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// Play movie functions
function playMovie(movieTitle) {
    // Add to watch history
    if (!watchHistory.includes(movieTitle)) {
        watchHistory.push(movieTitle);
        localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
        updateQuickStats();
        updateFooterStats();
    }
    
    showNotification(`Đang phát: ${movieTitle}`, 'success');
    
    // Simulate opening video player
    setTimeout(() => {
        showNotification('Video player sẽ mở ở đây trong ứng dụng thực tế', 'success');
    }, 1000);
}

function playBannerMovie() {
    playMovie('John Wick: Chapter 3 - Parabellum');
}

function playLiveStream(streamId) {
    const streamNames = {
        'planet-earth': 'Planet Earth II',
        'game-of-thrones': 'Game of Thrones',
        'vikings': 'Vikings'
    };
    
    const streamName = streamNames[streamId] || streamId;
    showNotification(`Đang kết nối đến ${streamName} LIVE...`, 'success');
    
    setTimeout(() => {
        showNotification('Kết nối thành công! Đang phát trực tiếp...', 'success');
    }, 1500);
}

// Enhanced features
function getRandomRecommendation() {
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    showNotification(`Đề xuất cho bạn: ${randomMovie.title} (${randomMovie.rating}⭐)`, 'success');
    return randomMovie;
}

function getTrendingMovies() {
    // Simulate trending based on high ratings and recent years
    const trending = movies
        .filter(movie => parseFloat(movie.rating) > 7.5)
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 6);
    
    currentMovies = trending;
    displayMovies();
    showNotification('Đang hiển thị phim đang thịnh hành', 'success');
}

function applyAdvancedFilter() {
    const minRating = 7.0; // Minimum rating filter
    const recentYears = ['2020', '2021', '2022', '2023', '2024'];
    
    currentMovies = movies.filter(movie => {
        const hasGoodRating = parseFloat(movie.rating) >= minRating;
        const isRecent = recentYears.includes(movie.year);
        return hasGoodRating || isRecent;
    });
    
    displayMovies();
    showNotification(`Lọc nâng cao: ${currentMovies.length} phim chất lượng cao`, 'success');
}

// Quick stats functionality
function updateQuickStats() {
    const totalMovies = movies.length;
    const avgRating = (movies.reduce((sum, movie) => sum + parseFloat(movie.rating), 0) / totalMovies).toFixed(1);
    const topGenre = getTopGenre();
    
    // Store in localStorage for other components to access
    localStorage.setItem('totalMovies', totalMovies);
    localStorage.setItem('avgRating', avgRating);
    localStorage.setItem('topGenre', getGenreDisplayName(topGenre));
}

function getTopGenre() {
    const genreCount = {};
    movies.forEach(movie => {
        movie.categories.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
    });
    
    return Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b);
}

// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress');
    
    // Intersection Observer for progress bars
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target;
                const targetWidth = progress.getAttribute('data-progress');
                progress.style.width = targetWidth + '%';
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => {
        observer.observe(bar);
    });
}

// Notification system
function showNotification(message, type = 'success') {
    // Try to use header notification if available
    try {
        const headerFrame = document.getElementById('headerFrame');
        if (headerFrame && headerFrame.contentWindow && headerFrame.contentWindow.HeaderApp) {
            headerFrame.contentWindow.HeaderApp.showNotification(message, type);
            return;
        }
    } catch (e) {
        console.log('Header notification not available, using fallback');
    }
    
    // Fallback notification system
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: var(--oxford-blue);
            color: var(--white);
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: var(--transition);
            border-left: 4px solid var(--light-azure);
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        notification.style.transform = 'translateX(700px)';
    }, 3000);
}

// ============================================================
// EXTERNAL USER DROPDOWN (Outside iframe)
// ============================================================

let externalDropdown = null;

function showExternalUserDropdown(position) {
    // Remove existing dropdown if any
    hideExternalUserDropdown();
    
    // Create dropdown element
    externalDropdown = document.createElement('div');
    externalDropdown.className = 'external-user-dropdown';
    externalDropdown.innerHTML = `
        <div class="dropdown-item" onclick="navigateToProfile()">
            <span>👤</span>
            Hồ sơ của tôi
        </div>
        <div class="dropdown-item" onclick="viewBookmarksExternal()">
            <span>❤️</span>
            Danh sách yêu thích
        </div>
        <div class="dropdown-item" onclick="viewHistoryExternal()">
            <span>⏰</span>
            Lịch sử xem
        </div>
        <div class="dropdown-item" onclick="logoutExternal()">
            <span>🚪</span>
            Đăng xuất
        </div>
    `;
    
    // Apply styles
    externalDropdown.style.cssText = `
        position: fixed;
        top: ${position.top}px;
        right: ${position.right}px;
        background: #2a2d3a;
        border-radius: 15px;
        min-width: 200px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        z-index: 10001;
        border: 1px solid rgba(52, 152, 219, 0.2);
        animation: fadeInUp 0.3s ease-out;
    `;
      // Add to document
    document.body.appendChild(externalDropdown);
    
    // Add click outside listener để đóng dropdown
    setTimeout(() => {
        document.addEventListener('click', handleExternalDropdownOutsideClick);
    }, 100); // Delay to prevent immediate close
}

// Handle click outside external dropdown
function handleExternalDropdownOutsideClick(event) {
    if (externalDropdown && !externalDropdown.contains(event.target)) {
        // Also check if click is on header iframe area
        const headerFrame = document.getElementById('headerFrame') || document.querySelector('iframe[src*="header.html"]');
        let isHeaderClick = false;
        
        if (headerFrame) {
            const rect = headerFrame.getBoundingClientRect();
            const clickX = event.clientX;
            const clickY = event.clientY;
            
            isHeaderClick = (
                clickX >= rect.left && 
                clickX <= rect.right && 
                clickY >= rect.top && 
                clickY <= rect.bottom
            );
        }
        
        if (!isHeaderClick) {
            hideExternalUserDropdown();
            document.removeEventListener('click', handleExternalDropdownOutsideClick);
        }
    }
}

function hideExternalUserDropdown() {
    if (externalDropdown) {
        externalDropdown.remove();
        externalDropdown = null;
        document.removeEventListener('click', handleExternalDropdownOutsideClick);
    }
}

// External dropdown actions
function navigateToProfile() {
    hideExternalUserDropdown();
    showNotification('Đang chuyển đến trang hồ sơ...', 'success');
    setTimeout(() => {
        window.location.href = './user/user.html';
    }, 1000);
}

function viewBookmarksExternal() {
    hideExternalUserDropdown();
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedMovies') || '[]');
    if (bookmarks.length > 0) {
        showNotification(`Bạn có ${bookmarks.length} phim yêu thích. Đang chuyển đến danh sách...`, 'success');
        setTimeout(() => {
            window.location.href = './user/user.html#bookmarks';
        }, 1000);
    } else {
        showNotification('Bạn chưa có phim yêu thích nào. Hãy thêm phim vào danh sách yêu thích!', 'info');
    }
}

function viewHistoryExternal() {
    hideExternalUserDropdown();
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    if (history.length > 0) {
        showNotification(`Bạn đã xem ${history.length} phim. Đang chuyển đến lịch sử...`, 'success');
        setTimeout(() => {
            window.location.href = './user/user.html#history';
        }, 1000);
    } else {
        showNotification('Bạn chưa xem phim nào. Hãy bắt đầu khám phá!', 'info');
    }
}

function logoutExternal() {
    hideExternalUserDropdown();
    
    if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        return;
    }
    
    // Clear user data
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('bookmarkedMovies');
    localStorage.removeItem('watchHistory');
    
    showNotification('Đã đăng xuất thành công!', 'success');
    
    // Update header
    updateHeaderLoginStatus();
    
    // Redirect to login
    setTimeout(() => {
        window.location.href = './login_register/login.html';
    }, 1500);
}

// Add CSS for external dropdown
const dropdownCSS = `
    .external-user-dropdown .dropdown-item {
        padding: 12px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        color: white;
        font-size: 14px;
    }
    
    .external-user-dropdown .dropdown-item:hover {
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
    }
    
    .external-user-dropdown .dropdown-item:last-child {
        border-bottom: none;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Inject CSS
const dropdownStyle = document.createElement('style');
dropdownStyle.textContent = dropdownCSS;
document.head.appendChild(dropdownStyle);

// ====================================
// IFRAME COMMUNICATION SYSTEM
// ====================================

// Header iframe integration
function initHeaderIframe() {
    const headerFrame = document.getElementById('headerFrame');
    console.log('Header iframe loaded');
    
    let headerReadyRetries = 0;
    const maxRetries = 10;
    
    // Ping header repeatedly until it responds
    function pingHeader() {
        if (headerFrame && headerFrame.contentWindow) {
            console.log(`Pinging header (attempt ${headerReadyRetries + 1}/${maxRetries})`);
            headerFrame.contentWindow.postMessage({ type: 'ping' }, '*');
            headerReadyRetries++;
            
            if (headerReadyRetries < maxRetries) {
                setTimeout(pingHeader, 500);
            }
        }
    }
    
    // Start pinging immediately and repeatedly
    setTimeout(pingHeader, 200);
    
    // Also try updating login status multiple times with different delays
    setTimeout(() => updateHeaderLoginStatus(), 800);
    setTimeout(() => updateHeaderLoginStatus(), 1500);
    setTimeout(() => updateHeaderLoginStatus(), 3000);
    
    // Handle header iframe communication
    window.addEventListener('message', function(event) {
        if (event.source === headerFrame.contentWindow) {
            console.log('Message from header:', event.data);
            
            if (event.data.type === 'pong') {
                console.log('Header is ready! Stopping ping attempts and updating login status...');
                headerReadyRetries = maxRetries; // Stop further pings
                
                // Multiple update attempts when header is ready
                setTimeout(() => updateHeaderLoginStatus(), 50);
                setTimeout(() => updateHeaderLoginStatus(), 200);
                setTimeout(() => updateHeaderLoginStatus(), 500);
                return;
            }
            
            // Handle login navigation from header
            if (event.data.type === 'navigateToLogin') {
                console.log('Navigating to login from header:', event.data.url);
                window.location.href = event.data.url;
                return;
            }
            
            // Handle navigation messages from header
            if (event.data.type === 'navigateToSection') {
                const sectionId = event.data.sectionId;
                navigateToSection(sectionId);
            }
              // Handle search messages from header
            if (event.data.type === 'searchMovie') {
                const query = event.data.query;
                performSearch(query);
            }
            
            // Handle user dropdown messages from header
            if (event.data.type === 'showUserDropdown') {
                showExternalUserDropdown(event.data.position);
            }
            
            if (event.data.type === 'hideUserDropdown') {
                hideExternalUserDropdown();
            }
        }
    });
    
    // Send scroll events to header iframe để update navbar scroll effect
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        if (headerFrame && headerFrame.contentWindow) {
            headerFrame.contentWindow.postMessage({
                type: 'parentScroll',
                scrollTop: scrollTop
            }, '*');
        }
    });
}

// GHI ĐÈ HÀM updateHeaderLoginStatus để cập nhật trực tiếp header tích hợp (không còn dùng iframe)
function updateHeaderLoginStatus() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email') || '';
    const fullName = localStorage.getItem('fullName') || '';
    // Lấy các phần tử header
    const signInBtn = document.getElementById('signInBtn');
    const userMenu = document.getElementById('userMenu');
    const displayUserName = document.getElementById('displayUserName');
    const userAvatar = document.getElementById('userAvatar');
    // Kiểm tra trạng thái đăng nhập
    if (token && username) {
        signInBtn.style.display = 'none';
        userMenu.style.display = '';
        userMenu.classList.add('visible');
        displayUserName.textContent = username;
        // Avatar chữ cái đầu
        const firstLetter = username.charAt(0).toUpperCase();
        userAvatar.src = `data:image/svg+xml;base64,${btoa(`
            <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='20' cy='20' r='20' fill='#3498db'/>
                <text x='20' y='26' text-anchor='middle' font-family='Arial' font-size='16' font-weight='bold' fill='white'>${firstLetter}</text>
            </svg>
        `)}`;
    } else {
        signInBtn.style.display = 'flex';
        userMenu.style.display = 'none';
        userMenu.classList.remove('visible');
    }
}

// Debug functions (kept for development, can be removed in production)
function updateDebugPanel() {
    // Function kept for potential future debugging needs
    console.log('Debug info - Token:', localStorage.getItem('token') ? 'Present' : 'None',
                'Username:', localStorage.getItem('username') || 'None');
}

function manualRefreshHeader() {
    console.log('Manual header refresh triggered');
    updateHeaderLoginStatus();
    
    // Also try to call header's refresh function directly
    const headerFrame = document.getElementById('headerFrame');
    if (headerFrame && headerFrame.contentWindow) {
        // Try multiple methods to refresh
        if (headerFrame.contentWindow.refreshLoginStatus) {
            headerFrame.contentWindow.refreshLoginStatus();
        }
        if (headerFrame.contentWindow.HeaderApp && headerFrame.contentWindow.HeaderApp.forceRefresh) {
            headerFrame.contentWindow.HeaderApp.forceRefresh();
        }
        
        // Also send message-based refresh
        headerFrame.contentWindow.postMessage({
            type: 'forceRefresh'
        }, '*');
    }
    
    console.log('Manual refresh completed');
}

function clearLoginData() {
    localStorage.removeItem('token');
    localStorage.removeItem('username'); 
    localStorage.removeItem('email');
    updateHeaderLoginStatus();
    console.log('Login data cleared');
}

function testLogin() {
    console.log('Test login - navigating to login page');
    window.location.href = './login_register/login.html';
}

function simulateLogin() {
    // Simulate a successful login for testing
    localStorage.setItem('token', 'test-token-123');
    localStorage.setItem('username', 'TestUser');
    localStorage.setItem('email', 'test@example.com');
    updateHeaderLoginStatus();
    console.log('Simulated login completed');
}

// Global login status checker - can be called from console for debugging
window.checkGlobalLoginStatus = function() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    
    console.log('=== Global Login Status Check ===');
    console.log('Token:', token ? 'Present (' + token.substring(0, 10) + '...)' : 'None');
    console.log('Username:', username || 'None');
    console.log('Email:', email || 'None');
    console.log('Is Logged In:', !!(token && username));
    
    // Force header update
    updateHeaderLoginStatus();
    
    // Try manual header refresh
    const headerFrame = document.getElementById('headerFrame');
    if (headerFrame && headerFrame.contentWindow && headerFrame.contentWindow.refreshLoginStatus) {
        headerFrame.contentWindow.refreshLoginStatus();
    }
    
    return {
        isLoggedIn: !!(token && username),
        token: token,
        username: username,
        email: email
    };
};

// Listen for storage changes (when user logs in/out from another tab)
window.addEventListener('storage', function(e) {
    console.log('Storage changed:', e.key, e.newValue);
    if (e.key === 'token' || e.key === 'username' || e.key === 'loginStatusChanged') {
        setTimeout(() => {
            console.log('Updating header due to storage change');
            updateHeaderLoginStatus();
        }, 100);
        
        // Multiple attempts for storage changes
        setTimeout(() => updateHeaderLoginStatus(), 500);
        setTimeout(() => updateHeaderLoginStatus(), 1000);
    }
});

// Force check login status every 5 seconds (for debugging)
setInterval(() => {
    const currentToken = localStorage.getItem('token');
    const currentUsername = localStorage.getItem('username');
    if (currentToken && currentUsername) {
        console.log('Periodic check - user is logged in:', currentUsername);
        updateHeaderLoginStatus();
    }
}, 5000);

// Listen for login success from popup/child windows
window.addEventListener('message', function(e) {
    console.log('Received message:', e.data);
    
    if (e.data.type === 'userLoggedIn') {
        console.log('User logged in from child window/popup');
        console.log('User info:', e.data.userInfo);
        
        // Multiple aggressive update attempts
        setTimeout(() => updateHeaderLoginStatus(), 50);
        setTimeout(() => updateHeaderLoginStatus(), 200);
        setTimeout(() => updateHeaderLoginStatus(), 500);
        setTimeout(() => updateHeaderLoginStatus(), 1000);
        setTimeout(() => updateHeaderLoginStatus(), 2000);
    }
});

// Update header login status when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Page became visible, checking login status...');
        setTimeout(() => {
            updateHeaderLoginStatus();
        }, 100);
    }
});

// Also check when window regains focus
window.addEventListener('focus', function() {
    console.log('Window gained focus, checking login status...');
    setTimeout(() => {
        updateHeaderLoginStatus();
    }, 100);
});

// Check for URL hash changes that might indicate return from login
window.addEventListener('hashchange', function() {
    console.log('Hash changed, checking login status...');
    setTimeout(() => {
        updateHeaderLoginStatus();
    }, 100);
});

// Navigation function for header communication
function navigateToSection(sectionId) {
    console.log('Navigating to section:', sectionId);
    
    if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Update hash without triggering event
        history.pushState(null, null, '#top');
        showNotification('Đã về đầu trang', 'success');
    } else {
        const target = document.getElementById(sectionId);
        if (target) {
            const headerHeight = 100; // Adjust based on your header height
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update hash without triggering event
            history.pushState(null, null, `#${sectionId}`);
            showNotification(`Đã đến: ${getSectionDisplayName(sectionId)}`, 'success');
        }
    }
}

// Search function for header communication
function performSearch(query) {
    console.log('Performing search:', query);
    
    // Filter movies based on search query
    const searchResults = movies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.genre.toLowerCase().includes(query.toLowerCase())
    );
    
    if (searchResults.length > 0) {
        currentMovies = searchResults;
        displayMovies();
        
        // Navigate to movies section
        window.location.hash = 'movies';
        
        showNotification(`Tìm thấy ${searchResults.length} kết quả cho "${query}"`, 'success');
    } else {
        showNotification(`Không tìm thấy phim nào cho "${query}"`, 'error');
    }
}

// Footer iframe integration
function initFooterIframe() {
    const footerFrame = document.getElementById('footerFrame');
    
    // Handle iframe communication
    window.addEventListener('message', function(event) {
        // Handle resize requests from footer iframe
        if (event.data.type === 'resizeIframe') {
            footerFrame.style.height = event.data.height + 'px';
        }
        
        // Handle scroll to top requests
        if (event.data.type === 'scrollToTop') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Handle function calls from footer
        if (event.data.type === 'callFunction') {
            const functionName = event.data.functionName;
            if (window[functionName] && typeof window[functionName] === 'function') {
                window[functionName]();
            }
        }
        
        // Handle stats requests from footer
        if (event.data.type === 'requestStats') {
            sendStatsToFooter();
        }
    });
    
    // Send scroll events to footer iframe
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        if (footerFrame && footerFrame.contentWindow) {
            footerFrame.contentWindow.postMessage({
                type: 'parentScroll',
                scrollTop: scrollTop
            }, '*');
        }
    });
    
    // Initial stats send
    setTimeout(() => {
        sendStatsToFooter();
    }, 1000);
}

function sendStatsToFooter() {
    const footerFrame = document.getElementById('footerFrame');
    const bookmarkedMovies = JSON.parse(localStorage.getItem('bookmarkedMovies') || '[]');
    const watchHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    
    const stats = {
        totalMovies: movies ? movies.length : 18,
        avgRating: movies ? (movies.reduce((sum, movie) => sum + parseFloat(movie.rating), 0) / movies.length).toFixed(1) : '7.2',
        topGenre: getGenreDisplayName(getTopGenre()),
        bookmarkCount: bookmarkedMovies.length,
        watchedCount: watchHistory.length
    };
    
    if (footerFrame && footerFrame.contentWindow) {
        footerFrame.contentWindow.postMessage({
            type: 'updateStats',
            stats: stats
        }, '*');
    }
}

// Update stats whenever bookmark or watch history changes
function updateFooterStats() {
    sendStatsToFooter();
}

// Global functions for external access
window.MainApp = {
    getRandomRecommendation,
    getTrendingMovies,
    applyAdvancedFilter,
    showNotification,
    updateQuickStats,
    filterByCategory,
    playMovie,
    playBannerMovie,
    playLiveStream,
    toggleBookmark,
    navigateToSection,
    performSearch,
    handleHashNavigation
};

// Error handling for images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
    }
}, true);

// Keyboard shortcuts for the main page
document.addEventListener('keydown', function(e) {
    // Quick navigation shortcuts
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                window.location.hash = 'top';
                break;
            case '2':
                e.preventDefault();
                window.location.hash = 'movies';
                break;
            case '3':
                e.preventDefault();
                window.location.hash = 'category';
                break;
            case '4':
                e.preventDefault();
                window.location.hash = 'achievements';
                break;
            case '5':
                e.preventDefault();
                window.location.hash = 'live';
                break;        }
    }
    
    // Random recommendation shortcut (Ctrl/Cmd + R)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
        e.preventDefault();
        getRandomRecommendation();
    }
});

// Add CSS for smooth section targeting
const smoothScrollCSS = `
    /* Smooth scroll offset for sections */
    section[id] {
        scroll-margin-top: 100px;
    }
    
    /* Enhanced transitions */
    html {
        scroll-behavior: smooth;
    }
    
    /* Focus management for accessibility */
    section[id]:target {
        animation: highlightSection 0.5s ease-in-out;
    }
    
    @keyframes highlightSection {
        0% { background-color: rgba(52, 152, 219, 0.1); }
        100% { background-color: transparent; }
    }
`;

// Inject the CSS
const smoothScrollStyle = document.createElement('style');
smoothScrollStyle.textContent = smoothScrollCSS;
document.head.appendChild(smoothScrollStyle);
