/*
 * ==========================================
 * MAXION - Main JavaScript File
 * ==========================================
 */

// ==========================================
// GLOBAL VARIABLES & CONFIGURATION
// ==========================================
const MAXION = {
    // Configuration
    config: {
        heroSlideInterval: 5000,
        animationDuration: 300,
        observerThreshold: 0.1,
        observerRootMargin: '0px 0px -50px 0px'
    },
    
    // State management
    state: {
        currentSlide: 0,
        slideInterval: null,
        isInitialized: false,
        activeModal: null,
        theme: 'dark'
    },
    
    // Cache DOM elements
    elements: {
        body: null,
        headerIframe: null,
        footerIframe: null,
        heroSlides: null,
        heroDots: null,
        heroSection: null,
        modals: null,
        forms: null
    },
    
    // Initialize the application
    init() {
        if (this.state.isInitialized) return;
        
        console.log('🎌 Initializing MAXION...');
        
        this.cacheElements();
        this.loadTheme();
        this.initHeroSlider();
        this.initEventListeners();
        this.initScrollAnimations();
        this.initIframeHandlers();
        this.initFormHandlers();
        this.initMiscFeatures();
        
        this.state.isInitialized = true;
        console.log('✅ MAXION initialized successfully!');
    },
    
    // Cache frequently used DOM elements
    cacheElements() {
        this.elements.body = document.body;
        this.elements.headerIframe = document.getElementById('header-iframe');
        this.elements.footerIframe = document.querySelector('iframe[src="./footer.html"]');
        this.elements.heroSlides = document.querySelectorAll('.hero-slide');
        this.elements.heroDots = document.querySelectorAll('.hero-dot');
        this.elements.heroSection = document.querySelector('.hero');
        this.elements.modals = document.querySelectorAll('.modal');
        this.elements.forms = {
            login: document.getElementById('login-form'),
            register: document.getElementById('register-form'),
            resetPassword: document.getElementById('reset-password-form')
        };
    }
};

// ==========================================
// THEME MANAGEMENT
// ==========================================
MAXION.themeManager = {
    toggle() {
        const body = MAXION.elements.body;
        
        if (body.classList.contains('dark-mode')) {
            this.setTheme('light');
        } else {
            this.setTheme('dark');
        }
        
        MAXION.iframeManager.syncTheme();
    },
    
    setTheme(theme) {
        const body = MAXION.elements.body;
        
        body.classList.remove('dark-mode', 'light-mode');
        body.classList.add(`${theme}-mode`);
        
        MAXION.state.theme = theme;
        localStorage.setItem('theme', theme);
        
        // Add smooth transition effect
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    },
    
    load() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
    }
};

// ==========================================
// HERO SLIDER FUNCTIONALITY
// ==========================================
MAXION.heroSlider = {
    init() {
        if (MAXION.elements.heroSlides.length === 0) return;
        
        this.setupAutoPlay();
        this.setupNavigation();
        this.setupHoverPause();
        
        console.log('🎬 Hero slider initialized');
    },
    
    setupAutoPlay() {
        MAXION.state.slideInterval = setInterval(() => {
            this.nextSlide();
        }, MAXION.config.heroSlideInterval);
    },
    
    setupNavigation() {
        // Dot navigation
        MAXION.elements.heroDots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Arrow navigation
        const prevBtn = document.querySelector('.hero-prev');
        const nextBtn = document.querySelector('.hero-next');
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
    },
    
    setupHoverPause() {
        if (MAXION.elements.heroSection) {
            MAXION.elements.heroSection.addEventListener('mouseenter', () => {
                clearInterval(MAXION.state.slideInterval);
            });
            
            MAXION.elements.heroSection.addEventListener('mouseleave', () => {
                this.setupAutoPlay();
            });
        }
    },
    
    goToSlide(slideIndex) {
        const slides = MAXION.elements.heroSlides;
        const dots = MAXION.elements.heroDots;
        
        // Remove active classes
        slides[MAXION.state.currentSlide].classList.remove('active');
        dots[MAXION.state.currentSlide].classList.remove('active');
        
        // Update current slide
        MAXION.state.currentSlide = slideIndex;
        
        // Add active classes
        slides[MAXION.state.currentSlide].classList.add('active');
        dots[MAXION.state.currentSlide].classList.add('active');
        
        // Add animation effect
        slides[MAXION.state.currentSlide].style.animation = 'fadeIn 1s ease-in-out';
        setTimeout(() => {
            slides[MAXION.state.currentSlide].style.animation = '';
        }, 1000);
    },
    
    nextSlide() {
        const totalSlides = MAXION.elements.heroSlides.length;
        const nextIndex = (MAXION.state.currentSlide + 1) % totalSlides;
        this.goToSlide(nextIndex);
    },
    
    prevSlide() {
        const totalSlides = MAXION.elements.heroSlides.length;
        const prevIndex = (MAXION.state.currentSlide - 1 + totalSlides) % totalSlides;
        this.goToSlide(prevIndex);
    },
    
    destroy() {
        if (MAXION.state.slideInterval) {
            clearInterval(MAXION.state.slideInterval);
            MAXION.state.slideInterval = null;
        }
    }
};

// ==========================================
// MODAL MANAGEMENT
// ==========================================
MAXION.modalManager = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Close any existing modal
        this.closeAll();
        
        MAXION.state.activeModal = modalId;
        modal.style.display = 'flex';
        
        // Add smooth animation
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
        
        console.log(`📋 Modal opened: ${modalId}`);
    },
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            MAXION.state.activeModal = null;
        }, MAXION.config.animationDuration);
        
        console.log(`📋 Modal closed: ${modalId}`);
    },
    
    closeAll() {
        MAXION.elements.modals.forEach(modal => {
            if (modal.classList.contains('active')) {
                this.close(modal.id);
            }
        });
    },
    
    switch(fromModalId, toModalId) {
        this.close(fromModalId);
        setTimeout(() => {
            this.open(toModalId);
        }, MAXION.config.animationDuration);
    }
};

// ==========================================
// IFRAME COMMUNICATION
// ==========================================
MAXION.iframeManager = {
    adjustHeight(iframe) {
        try {
            const height = iframe.contentWindow.document.body.scrollHeight;
            iframe.style.height = height + 'px';
        } catch(e) {
            console.log('Cannot access iframe content - likely cross-origin');
        }
    },
    
    syncTheme() {
        const theme = MAXION.state.theme;
        
        // Sync with header
        if (MAXION.elements.headerIframe && MAXION.elements.headerIframe.contentWindow) {
            try {
                MAXION.elements.headerIframe.contentWindow.postMessage({
                    type: 'themeChange',
                    theme: theme
                }, '*');
            } catch(e) {
                console.log('Cannot send theme to header iframe');
            }
        }
        
        // Sync with footer
        if (MAXION.elements.footerIframe && MAXION.elements.footerIframe.contentWindow) {
            try {
                MAXION.elements.footerIframe.contentWindow.postMessage({
                    type: 'themeChange',
                    theme: theme
                }, '*');
            } catch(e) {
                console.log('Cannot send theme to footer iframe');
            }
        }
    },
    
    handleMessages(event) {
        const { type, data } = event.data;
        
        switch(type) {
            case 'openModal':
                MAXION.modalManager.open(data.modalId);
                break;
                
            case 'search':
                MAXION.searchManager.performSearch(data.term);
                break;
                
            case 'scrollToTop':
                MAXION.utils.scrollToTop();
                break;
                
            case 'themeChange':
                MAXION.themeManager.setTheme(data.theme);
                break;
                
            default:
                console.log('Unknown message type:', type);
        }
    }
};

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================
MAXION.searchManager = {
    performSearch(term) {
        if (!term || term.trim() === '') return;
        
        // Simulate search
        console.log(`🔍 Searching for: "${term}"`);
        
        // Show loading state
        this.showSearchLoading();
        
        // Simulate API call
        setTimeout(() => {
            this.showSearchResults(term);
        }, 1000);
    },
    
    showSearchLoading() {
        // Create loading indicator
        const loadingToast = this.createToast('Đang tìm kiếm...', 'info');
        document.body.appendChild(loadingToast);
        
        setTimeout(() => {
            loadingToast.remove();
        }, 1000);
    },
    
    showSearchResults(term) {
        const resultToast = this.createToast(`Tìm thấy kết quả cho: "${term}"`, 'success');
        document.body.appendChild(resultToast);
        
        setTimeout(() => {
            resultToast.remove();
        }, 3000);
    },
    
    createToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        `;
        toast.textContent = message;
        
        return toast;
    }
};

// ==========================================
// ANIMATION & SCROLL EFFECTS
// ==========================================
MAXION.animationManager = {
    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupParallaxEffects();
    },
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: MAXION.config.observerThreshold,
            rootMargin: MAXION.config.observerRootMargin
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe cards and sections
        const elementsToAnimate = document.querySelectorAll(
            '.feature-card, .movie-card, .watch-card, .achievement-card, .category-item'
        );
        
        elementsToAnimate.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(element);
        });
    },
    
    setupHoverEffects() {
        // Movie cards
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Achievement cards
        document.querySelectorAll('.achievement-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.querySelector('.achievement-icon').style.transform = 'rotate(5deg) scale(1.1)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.querySelector('.achievement-icon').style.transform = 'rotate(0deg) scale(1)';
            });
        });
    },
    
    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroSection = document.querySelector('.hero');
            
            if (heroSection) {
                const rate = scrolled * -0.5;
                heroSection.style.transform = `translateY(${rate}px)`;
            }
        });
    }
};

// ==========================================
// FORM HANDLING
// ==========================================
MAXION.formManager = {
    init() {
        this.setupValidation();
        this.setupSubmissionHandlers();
    },
    
    setupValidation() {
        // Real-time validation
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', this.validateEmail);
        });
        
        document.querySelectorAll('input[type="password"]').forEach(input => {
            input.addEventListener('input', this.validatePassword);
        });
    },
    
    setupSubmissionHandlers() {
        // Login form
        if (MAXION.elements.forms.login) {
            MAXION.elements.forms.login.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }
        
        // Register form
        if (MAXION.elements.forms.register) {
            MAXION.elements.forms.register.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e.target);
            });
        }
        
        // Reset password form
        if (MAXION.elements.forms.resetPassword) {
            MAXION.elements.forms.resetPassword.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleResetPassword(e.target);
            });
        }
    },
    
    validateEmail(event) {
        const email = event.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            event.target.style.borderColor = 'var(--danger-color)';
            MAXION.formManager.showFieldError(event.target, 'Email không hợp lệ');
        } else {
            event.target.style.borderColor = 'var(--border-color)';
            MAXION.formManager.hideFieldError(event.target);
        }
    },
    
    validatePassword(event) {
        const password = event.target.value;
        
        if (password.length > 0 && password.length < 6) {
            event.target.style.borderColor = 'var(--danger-color)';
            MAXION.formManager.showFieldError(event.target, 'Mật khẩu phải có ít nhất 6 ký tự');
        } else {
            event.target.style.borderColor = 'var(--border-color)';
            MAXION.formManager.hideFieldError(event.target);
        }
    },
    
    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.cssText = `
                color: var(--danger-color);
                font-size: 0.8rem;
                margin-top: 4px;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        requestAnimationFrame(() => {
            errorElement.style.opacity = '1';
        });
    },
    
    hideFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.opacity = '0';
            setTimeout(() => {
                errorElement.remove();
            }, 300);
        }
    },
    
    handleLogin(form) {
        const email = form.querySelector('#login-email').value;
        const password = form.querySelector('#login-password').value;
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang đăng nhập...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            console.log('Login attempt:', { email, password });
            alert('Tính năng đăng nhập sẽ được cập nhật sớm!');
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            MAXION.modalManager.close('login-modal');
            form.reset();
        }, 1500);
    },
    
    handleRegister(form) {
        const name = form.querySelector('#register-name').value;
        const email = form.querySelector('#register-email').value;
        const password = form.querySelector('#register-password').value;
        const confirmPassword = form.querySelector('#register-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang đăng ký...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            console.log('Register attempt:', { name, email, password });
            alert('Tính năng đăng ký sẽ được cập nhật sớm!');
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            MAXION.modalManager.close('register-modal');
            form.reset();
        }, 1500);
    },
    
    handleResetPassword(form) {
        const email = form.querySelector('#reset-email').value;
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang gửi...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            console.log('Reset password for:', email);
            alert('Link khôi phục mật khẩu đã được gửi đến email của bạn!');
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            MAXION.modalManager.close('reset-password-modal');
            form.reset();
        }, 1500);
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
MAXION.utils = {
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },
    
    smoothScrollTo(selector) {
        const target = document.querySelector(selector);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },
    
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
MAXION.performance = {
    init() {
        this.measurePageLoad();
        this.trackInteractions();
    },
    
    measurePageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`⚡ Page loaded in ${loadTime.toFixed(2)}ms`);
        });
    },
    
    trackInteractions() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn, .movie-card, .nav-link')) {
                console.log(`🖱️ User clicked:`, e.target.className);
            }
        });
    }
};

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================
MAXION.initEventListeners = function() {
    // Modal events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            MAXION.modalManager.close(e.target.id);
        }
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && MAXION.state.activeModal) {
            MAXION.modalManager.close(MAXION.state.activeModal);
        }
    });
    
    // Message handling for iframe communication
    window.addEventListener('message', MAXION.iframeManager.handleMessages);
    
    // Scroll events
    const throttledScrollHandler = MAXION.utils.throttle(() => {
        // Send scroll events to footer iframe
        if (MAXION.elements.footerIframe && MAXION.elements.footerIframe.contentWindow) {
            try {
                MAXION.elements.footerIframe.contentWindow.postMessage({
                    type: 'scroll',
                    scrollY: window.pageYOffset
                }, '*');
            } catch(e) {
                // Ignore cross-origin errors
            }
        }
    }, 100);
    
    window.addEventListener('scroll', throttledScrollHandler);
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                MAXION.utils.smoothScrollTo(this.getAttribute('href'));
            }
        });
    });
    
    // Calendar navigation
    document.querySelectorAll('.calendar-nav button').forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.textContent === '◀' ? 'prev' : 'next';
            console.log(`📅 Navigate ${direction} month`);
            // Add calendar navigation logic here
        });
    });
    
    // Resize handler
    window.addEventListener('resize', MAXION.utils.debounce(() => {
        console.log('📱 Window resized:', window.innerWidth + 'x' + window.innerHeight);
        // Handle responsive adjustments
    }, 250));
};

// ==========================================
// INITIALIZATION METHODS
// ==========================================
MAXION.loadTheme = function() {
    MAXION.themeManager.load();
};

MAXION.initHeroSlider = function() {
    MAXION.heroSlider.init();
};

MAXION.initScrollAnimations = function() {
    MAXION.animationManager.init();
};

MAXION.initIframeHandlers = function() {
    // Setup iframe height adjustment
    window.adjustIframeHeight = MAXION.iframeManager.adjustHeight;
    window.syncThemeWithIframe = MAXION.iframeManager.syncTheme;
    
    // Global modal functions for iframe communication
    window.openModal = MAXION.modalManager.open.bind(MAXION.modalManager);
    window.closeModal = MAXION.modalManager.close.bind(MAXION.modalManager);
    window.switchModal = MAXION.modalManager.switch.bind(MAXION.modalManager);
    
    // Sync theme after iframe loads
    setTimeout(() => {
        MAXION.iframeManager.syncTheme();
    }, 1000);
};

MAXION.initFormHandlers = function() {
    MAXION.formManager.init();
};

MAXION.initMiscFeatures = function() {
    MAXION.performance.init();
    
    // Add custom CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
};

// ==========================================
// ERROR HANDLING
// ==========================================
window.addEventListener('error', (e) => {
    console.error('🚨 JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
});

// ==========================================
// INITIALIZE ON DOM READY
// ==========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        MAXION.init();
    });
} else {
    MAXION.init();
}

// Make MAXION available globally for debugging
window.MAXION = MAXION;

// ==========================================
// EXPORT FOR MODULE SYSTEMS (if needed)
// ==========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MAXION;
}