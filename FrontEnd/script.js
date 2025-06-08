'use strict';

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
    initializeApp();
});

// Initialize application
function initializeApp() {
    console.log('Initializing app with', movies.length, 'movies');
    currentMovies = [...movies];
    displayMovies();
    animateProgressBars();
    setupEventListeners();
    updateQuickStats();
    
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
    movieCard.innerHTML = `
        <div class="card-head">
            <img src="data:image/svg+xml;base64,${btoa(`
                <svg width="200" height="280" viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="280" fill="#3498db"/>
                    <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="14" fill="white" font-weight="bold">${movie.title}</text>
                    <text x="100" y="140" text-anchor="middle" font-family="Arial" font-size="12" fill="white">${movie.year}</text>
                    <text x="100" y="160" text-anchor="middle" font-family="Arial" font-size="11" fill="white">${movie.genre}</text>
                    <rect x="160" y="15" width="30" height="20" fill="rgba(0,0,0,0.7)" rx="10"/>
                    <text x="175" y="28" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">⭐${movie.rating}</text>
                </svg>
            `)}" alt="${movie.title}" class="card-img">
            
            <div class="card-overlay">
                <div class="bookmark ${bookmarkedMovies.includes(movie.title) ? 'active' : ''}" 
                     onclick="toggleBookmark('${movie.title}', this)">
                    <span>❤️</span>
                </div>
                
                <div class="rating">
                    <span>⭐</span>
                    <span>${movie.rating}</span>
                </div>
                
                <div class="play" onclick="playMovie('${movie.title}')">
                    <span>▶️</span>
                </div>
            </div>
        </div>
        
        <div class="card-body">
            <h3 class="card-title">${movie.title}</h3>
            
            <div class="card-info">
                <span class="genre">${movie.genre}</span>
                <span class="year">${movie.year}</span>
            </div>
        </div>
    `;
    
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
        notification.style.transform = 'translateX(400px)';
    }, 3000);
}

// ====================================
// IFRAME COMMUNICATION SYSTEM
// ====================================

// Header iframe integration
function initHeaderIframe() {
    const headerFrame = document.getElementById('headerFrame');
    console.log('Header iframe loaded');
    
    // Handle header iframe communication
    window.addEventListener('message', function(event) {
        if (event.source === headerFrame.contentWindow) {
            console.log('Message from header:', event.data);
            
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
            
            // Handle theme changes from header
            if (event.data.type === 'themeChanged') {
                const theme = event.data.theme;
                document.documentElement.setAttribute('data-theme', theme);
                showNotification(`Đã chuyển sang chế độ ${theme === 'light' ? 'sáng' : 'tối'}`, 'success');
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
                break;
        }
    }
    
    // Random recommendation shortcut (Ctrl/Cmd + R)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
        e.preventDefault();
        getRandomRecommendation();
    }
});

// Add CSS for smooth section targeting
const style = document.createElement('style');
style.textContent = `
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

document.head.appendChild(style);