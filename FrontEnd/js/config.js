/* =======================================================
   CONFIG.JS - CẤU HÌNH CHUNG CHO TOÀN BỘ PROJECT
   ======================================================= */

const AppConfig = {
    // API Configuration
    api: {
        baseUrl: 'http://localhost:8080',
        timeout: 10000,
        endpoints: {
            // Auth endpoints
            login: '/api/auth/login',
            register: '/api/auth/register',
            me: '/api/users/me',
            
            // Cartoons endpoints
            cartoons: '/api/cartoons',
            cartoonById: (id) => `/api/cartoons/${id}`,
            cartoonEpisodes: (id) => `/api/cartoons/${id}/episodes`,
            
            // Episodes endpoints
            episodes: '/api/episodes',
            episodeById: (id) => `/api/episodes/${id}`,
            
            // Comments endpoints
            comments: '/api/comments',
            commentsByEpisode: (id) => `/api/episodes/${id}/comments`,
            
            // Achievements endpoints
            achievements: '/api/achievements',
            userAchievements: (userId) => `/api/achievements/progress/${userId}`,
            
            // Admin endpoints
            admin: {
                cartoons: '/admin/api/cartoons',
                episodes: '/admin/api/episodes',
                users: '/admin/api/users',
                statistics: '/admin/api/statistics'
            }
        }
    },

    // UI Configuration
    ui: {
        itemsPerPage: 12,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
        
        // Notification settings
        notifications: {
            autoHide: true,
            hideAfter: 5000,
            position: 'top-right'
        },
        
        // Modal settings
        modal: {
            backdrop: 'static',
            keyboard: false
        }
    },

    // Validation rules
    validation: {
        password: {
            minLength: 6,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false
        },
        
        username: {
            minLength: 3,
            maxLength: 20,
            pattern: /^[a-zA-Z0-9_]+$/
        },
        
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        
        episode: {
            titleMaxLength: 255,
            descriptionMaxLength: 1000,
            minDuration: 1,
            maxDuration: 7200 // 2 hours
        }
    },

    // Cache settings
    cache: {
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        keys: {
            userInfo: 'userInfo',
            cartoons: 'cartoons',
            episodes: 'episodes',
            achievements: 'achievements'
        }
    },

    // Feature flags
    features: {
        achievements: true,
        socialSharing: true,
        comments: true,
        ratings: true,
        notifications: true,
        autoPlay: false,
        darkMode: true
    },

    // Media settings
    media: {
        thumbnailSize: {
            width: 300,
            height: 200
        },
        
        avatarSize: {
            width: 100,
            height: 100
        },
        
        videoQuality: ['720p', '1080p', '4K'],
        defaultQuality: '720p'
    },

    // Error messages
    messages: {
        errors: {
            network: 'Lỗi kết nối mạng. Vui lòng thử lại.',
            unauthorized: 'Bạn cần đăng nhập để thực hiện hành động này.',
            forbidden: 'Bạn không có quyền thực hiện hành động này.',
            notFound: 'Không tìm thấy nội dung yêu cầu.',
            serverError: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            validation: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
        },
        
        success: {
            login: 'Đăng nhập thành công!',
            register: 'Đăng ký thành công!',
            logout: 'Đăng xuất thành công!',
            save: 'Lưu thành công!',
            delete: 'Xóa thành công!',
            update: 'Cập nhật thành công!'
        },
        
        info: {
            loading: 'Đang tải...',
            noData: 'Không có dữ liệu',
            emptyList: 'Danh sách trống'
        }
    },

    // Routes
    routes: {
        home: './index.html',
        login: './login-register/login.html',
        register: './login-register/register.html',
        profile: './profile/profile.html',
        achievements: './achievements/achievements.html',
        movieDetail: './movie-detail/movie_detail.html',
        moviePlayer: './movie-player/movie.html',
        admin: './admin/admin.html'
    },

    // Development settings
    development: {
        debug: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        mockData: false
    }
};

// Logger utility
const Logger = {
    debug: (...args) => {
        if (AppConfig.development.debug && AppConfig.development.logLevel === 'debug') {
            console.log('[DEBUG]', ...args);
        }
    },
    
    info: (...args) => {
        if (AppConfig.development.debug && ['debug', 'info'].includes(AppConfig.development.logLevel)) {
            console.info('[INFO]', ...args);
        }
    },
    
    warn: (...args) => {
        if (AppConfig.development.debug && ['debug', 'info', 'warn'].includes(AppConfig.development.logLevel)) {
            console.warn('[WARN]', ...args);
        }
    },
    
    error: (...args) => {
        console.error('[ERROR]', ...args);
    }
};

// Export for global use
window.AppConfig = AppConfig;
window.Logger = Logger;
