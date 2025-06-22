// Achievements management
class AchievementManager {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api';
        this.userId = null;
        this.username = null;
        this.achievements = [];
        this.currentPage = 0;
        this.itemsPerPage = this.getItemsPerPage();
        this.totalPages = 0;
    }

    // Tính số items hiển thị theo screen size
    getItemsPerPage() {
        const width = window.innerWidth;
        if (width <= 768) {
            return 2; // Mobile: 2 thành tựu
        } else if (width <= 1200) {
            return 3; // Tablet: 3 thành tựu
        } else {
            return 5; // Desktop: 5 thành tựu
        }
    }    // Khởi tạo
    async init() {
        console.log('🎯 AchievementManager.init() called');

        // Thử lấy username trước
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');

        if (username && token) {
            console.log('✅ Username found, loading achievements directly with username:', username);
            this.username = username;
            this.loadAchievementsByUsername();
            this.checkAchievementsByUsername();
            this.setupNavigation();
            this.setupResize();
        } else {
            console.log('❌ No username/token found, achievements will not load');
        }
    }// Lấy user ID từ localStorage hoặc API
    async getCurrentUserId() {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                console.log('🎯 User info from localStorage:', user);
                return user.id;
            } catch (e) {
                console.error('Error parsing userInfo:', e);
            }
        }

        // Nếu không có userInfo, thử lấy từ các key khác
        const userId = localStorage.getItem('userId');
        if (userId) {
            console.log('🆔 Found userId in localStorage:', userId);
            return userId;
        }

        // Nếu không có, gọi API để lấy thông tin user hiện tại
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');

        console.log('🔍 LocalStorage debug:', {
            userId: userId,
            username: username,
            userInfo: !!userInfo,
            token: !!token
        }); if (token) {
            try {
                console.log('📡 Fetching user info from API...');
                const response = await fetch(`${this.baseUrl}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', [...response.headers]);

                if (response.ok) {
                    try {
                        const user = await response.json();
                        console.log('✅ Got user from API:', user);

                        // Lưu vào localStorage
                        localStorage.setItem('userInfo', JSON.stringify(user));
                        localStorage.setItem('userId', user.id);

                        return user.id;
                    } catch (jsonError) {
                        console.error('💥 Error parsing JSON response:', jsonError);
                        console.error('Response text:', await response.text());
                    }
                } else if (response.status === 401) {
                    console.error('❌ Authentication failed - clearing localStorage');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                    localStorage.removeItem('userId');
                } else {
                    console.error('❌ Failed to get user info:', response.status);
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                }
            } catch (error) {
                console.error('💥 Error fetching user info:', error);
            }
        }

        console.log('⚠️ No userId found anywhere');
        return null;
    }// Tải danh sách thành tựu với tiến độ chi tiết
    async loadAchievements() {
        if (!this.userId) {
            console.log('❌ No userId found, cannot load achievements');
            return;
        }

        console.log('🎯 Loading achievements for userId:', this.userId);

        try {
            const token = localStorage.getItem('token');
            const url = `${this.baseUrl}/user-achievements/user/${this.userId}/detailed-progress`;

            console.log('📡 Making API call to:', url);
            console.log('🔑 Using token:', token ? 'Present' : 'Missing');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📋 API Response status:', response.status);

            if (response.ok) {
                this.achievements = await response.json();
                console.log('✅ Achievements loaded:', this.achievements);
                this.renderAchievements();
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to load achievements:', response.status, errorText);
            }
        } catch (error) {
            console.error('💥 Error loading achievements:', error);
        }
    }    // Tải danh sách thành tựu theo username
    async loadAchievementsByUsername() {
        if (!this.username) {
            console.log('❌ No username found, cannot load achievements');
            this.showNotLoggedInMessage();
            return;
        }

        console.log('🎯 Loading achievements for username:', this.username);

        try {
            const token = localStorage.getItem('token');
            const url = `${this.baseUrl}/user-achievements/username/${this.username}/detailed-progress`;

            console.log('📡 Making API call to:', url);
            console.log('🔑 Using token:', token ? 'Present' : 'Missing');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📋 API Response status:', response.status);

            if (response.ok) {
                try {
                    this.achievements = await response.json();
                    console.log('✅ Achievements loaded:', this.achievements);
                    this.renderAchievements();
                } catch (jsonError) {
                    console.error('💥 Error parsing achievements JSON:', jsonError);
                    const text = await response.text();
                    console.error('Response text:', text);
                    this.showErrorMessage('Lỗi xử lý dữ liệu thành tựu');
                }
            } else if (response.status === 401) {
                console.error('❌ Authentication failed for achievements');
                this.showNotLoggedInMessage();
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to load achievements:', response.status, errorText);
                this.showErrorMessage('Không thể tải thành tựu');
            }
        } catch (error) {
            console.error('💥 Error loading achievements:', error);
            this.showErrorMessage('Lỗi kết nối khi tải thành tựu');
        }
    }

    // Kiểm tra và cập nhật thành tựu
    async checkAchievements() {
        if (!this.userId) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/user-achievements/user/${this.userId}/check-achievements`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Tải lại thành tựu sau khi kiểm tra
                    setTimeout(() => this.loadAchievements(), 1000);
                }
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }

    // Kiểm tra và cập nhật thành tựu theo username
    async checkAchievementsByUsername() {
        if (!this.username) return;

        try {
            const token = localStorage.getItem('token');
            const url = `${this.baseUrl}/user-achievements/username/${this.username}/check-achievements`;

            console.log('📡 Checking achievements for username:', this.username);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Achievements check result:', result);
                if (result.success) {
                    // Tải lại thành tựu sau khi kiểm tra
                    setTimeout(() => this.loadAchievementsByUsername(), 1000);
                }
            } else {
                console.error('❌ Failed to check achievements:', response.status);
            }
        } catch (error) {
            console.error('💥 Error checking achievements:', error);
        }
    }

    // Render thành tựu trên trang
    renderAchievements() {
        const container = document.querySelector('#achievementCards');
        console.log('🔍 renderAchievements called. Container:', container, 'Achievements:', this.achievements);
        if (!container || !this.achievements.length) return;

        // Tính toán phân trang
        this.totalPages = Math.ceil(this.achievements.length / this.itemsPerPage);

        // Hiển thị tất cả thành tựu, scroll sẽ được quản lý bởi CSS và navigation
        container.innerHTML = this.achievements.map(achievement => {
            const progressPercent = achievement.progressPercent || 0;
            const current = achievement.current || 0;
            const target = achievement.target || 1;
            const icon = achievement.icon || '🏆';

            return `
                <article class="achievement-card ${achievement.completed ? 'completed' : ''}">
                    <div class="achievement-icon">${icon}</div>
                    <h3 class="achievement-title">${achievement.name}</h3>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="progress-bar">
                        <div class="progress" data-progress="${progressPercent}" style="width: ${progressPercent}%"></div>
                    </div>
                    <span>${current}/${target}</span>
                    ${achievement.completed ? '<div class="achievement-badge">✅ Hoàn thành</div>' : ''}
                </article>
            `;
        }).join('');

        // Animate progress bars
        this.animateProgressBars();

        // Setup dots navigation
        this.setupDots();

        // Update navigation state
        this.updateNavigation();
    }

    // Animation cho progress bars
    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress[data-progress]');
        progressBars.forEach(bar => {
            const progress = parseInt(bar.dataset.progress);
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.transition = 'width 1s ease-in-out';
                bar.style.width = progress + '%';
            }, 100);
        });
    }

    // Thiết lập navigation
    setupNavigation() {
        const prevBtn = document.getElementById('prevAchievements');
        const nextBtn = document.getElementById('nextAchievements');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }
    }

    // Thiết lập resize listener
    setupResize() {
        window.addEventListener('resize', () => {
            const newItemsPerPage = this.getItemsPerPage();
            if (newItemsPerPage !== this.itemsPerPage) {
                this.itemsPerPage = newItemsPerPage;
                this.currentPage = 0;
                this.renderAchievements();
            }
        });
    }

    // Thiết lập dots navigation
    setupDots() {
        const dotsContainer = document.getElementById('achievementDots');
        if (!dotsContainer || this.totalPages <= 1) {
            dotsContainer.innerHTML = '';
            return;
        }

        const dots = Array.from({ length: this.totalPages }, (_, i) =>
            `<span class="dot ${i === this.currentPage ? 'active' : ''}" data-page="${i}"></span>`
        ).join('');

        dotsContainer.innerHTML = dots;

        // Add click events to dots
        dotsContainer.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            });
        });
    }

    // Chuyển đến trang trước
    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateCarousel();
        }
    }

    // Chuyển đến trang sau
    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.updateCarousel();
        }
    }

    // Chuyển đến trang cụ thể
    goToPage(page) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.updateCarousel();
        }
    }

    // Cập nhật carousel
    updateCarousel() {
        const container = document.querySelector('#achievementCards');
        if (!container) return;

        // Tính toán khoảng cách di chuyển theo screen size
        const cardWidth = window.innerWidth <= 768 ? 240 + 30 : 280 + 30; // min-width + gap
        const translateX = -this.currentPage * cardWidth * this.itemsPerPage;

        container.style.transform = `translateX(${translateX}px)`;

        this.updateNavigation();
        this.updateDots();
    }

    // Cập nhật trạng thái navigation
    updateNavigation() {
        const prevBtn = document.getElementById('prevAchievements');
        const nextBtn = document.getElementById('nextAchievements');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages - 1;
        }
    }

    // Cập nhật dots
    updateDots() {
        const dots = document.querySelectorAll('#achievementDots .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentPage);
        });
    }

    // Hiển thị thông báo thành tựu mới
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-popup">
                <div class="popup-icon">🎉</div>
                <div class="popup-content">
                    <h4>Thành tựu mới!</h4>
                    <p><strong>${achievement.name}</strong></p>
                    <p>${achievement.description}</p>
                </div>
                <button class="popup-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }    // Mở trang thành tựu chi tiết
    openAchievementsPage() {
        window.location.href = './achievements/achievements.html';
    }

    // Hiển thị thông báo lỗi
    showErrorMessage(message) {
        const container = document.getElementById('achievementsContainer');
        if (container) {
            container.innerHTML = `
                <div class="achievements-error">
                    <div class="error-icon">⚠️</div>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="retry-btn">Thử lại</button>
                </div>
            `;
        }
    }

    // Hiển thị thông báo chưa đăng nhập
    showNotLoggedInMessage() {
        const container = document.getElementById('achievementsContainer');
        if (container) {
            container.innerHTML = `
                <div class="achievements-login-prompt">
                    <div class="login-icon">🔐</div>
                    <p>Vui lòng đăng nhập để xem thành tựu</p>
                    <button onclick="window.location.href='./login_register/login.html'" class="login-btn">Đăng nhập</button>
                </div>
            `;
        }
    }
}

// Initialize achievement manager when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎯 AchievementManager DOMContentLoaded');
    window.achievementManager = new AchievementManager();

    // Check if user is logged in before initializing
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    console.log('🔍 Initialization check:', {
        token: token ? 'Present' : 'Missing',
        username: username || 'Missing'
    });

    if (token) {
        console.log('✅ Token found, initializing AchievementManager...');
        window.achievementManager.init().catch(error => {
            console.error('💥 Error initializing AchievementManager:', error);
        });
    } else {
        console.log('❌ No token found, AchievementManager will not initialize');
    }
});

// Export for use in other scripts
window.AchievementManager = AchievementManager;
