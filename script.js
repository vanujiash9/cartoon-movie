// Biến và cấu hình toàn cục
const CONFIG = {
    darkModeClass: 'dark-mode',
    lightModeClass: 'light-mode',
    themeKey: 'maxion-theme-preference',
    userKey: 'maxion-user-data',
    tokenKey: 'maxion-auth-token',
    apiBaseUrl: 'https://api.example.com', // Thay thế bằng URL API thực tế khi có
    defaultAvatar: '/api/placeholder/40/40'
};

// Quản lý DOM - chờ cho tài liệu HTML tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo tất cả các chức năng
    initThemeToggle();
    initModals();
    initMobileMenu();
    initFormValidation();
    initSearchFunctionality();
    initCalendarEvents();
    initMovieHover();
    initUserAuth();
    initScrollEffects();
    
    // Kiểm tra và áp dụng theme đã lưu
    applyStoredTheme();
    
    // Kiểm tra trạng thái đăng nhập
    checkAuthStatus();
});

// ----------------------
// QUẢN LÝ THEME (SÁNG/TỐI)
// ----------------------

function initThemeToggle() {
    // Tạo nút chuyển đổi theme nếu chưa có
    if (!document.querySelector('.theme-toggle')) {
        const themeBtn = document.createElement('button');
        themeBtn.className = 'btn btn-outline theme-toggle';
        themeBtn.innerHTML = '🌓';
        themeBtn.title = 'Chuyển đổi chế độ sáng/tối';
        themeBtn.onclick = toggleTheme;
        
        // Chèn trước nút đăng nhập
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            userActions.prepend(themeBtn);
        }
        
        // Thêm CSS inline cho nút
        const style = document.createElement('style');
        style.textContent = `
            .theme-toggle {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                margin-right: 10px;
            }
            .dark-mode {
                --bg-color: #121212;
                --bg-secondary: #1e1e1e;
                --text-color: #ffffff;
                --text-secondary: #b0b0b0;
            }
            .light-mode {
                --bg-color: #f5f5f5;
                --bg-secondary: #ffffff;
                --text-color: #333333;
                --text-secondary: #666666;
            }
            .light-mode .modal-header, .light-mode .plan-header {
                color: white;
            }
            .light-mode .feature-content, .light-mode .movie-content, 
            .light-mode .achievement-card, .light-mode .watch-content,
            .light-mode .modal-content, .light-mode .calendar-container {
                color: #333333;
            }
        `;
        document.head.appendChild(style);
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.contains(CONFIG.darkModeClass);
    
    // Chuyển đổi chế độ theme
    if (isDarkMode) {
        document.body.classList.remove(CONFIG.darkModeClass);
        document.body.classList.add(CONFIG.lightModeClass);
        localStorage.setItem(CONFIG.themeKey, 'light');
    } else {
        document.body.classList.remove(CONFIG.lightModeClass);
        document.body.classList.add(CONFIG.darkModeClass);
        localStorage.setItem(CONFIG.themeKey, 'dark');
    }
    
    // Cập nhật biểu tượng toggle
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = isDarkMode ? '🌞' : '🌙';
    }

    // Hiệu ứng chuyển đổi
    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 500);
}

function applyStoredTheme() {
    const storedTheme = localStorage.getItem(CONFIG.themeKey) || 'dark';
    
    if (storedTheme === 'light') {
        document.body.classList.add(CONFIG.lightModeClass);
        document.body.classList.remove(CONFIG.darkModeClass);
        
        // Cập nhật biểu tượng
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.innerHTML = '🌞';
        }
    } else {
        document.body.classList.add(CONFIG.darkModeClass);
        document.body.classList.remove(CONFIG.lightModeClass);
        
        // Cập nhật biểu tượng
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.innerHTML = '🌙';
        }
    }
}

// ----------------------
// QUẢN LÝ MODAL
// ----------------------

function initModals() {
    // Fix vấn đề modal trùng lặp
    const loginModals = document.querySelectorAll('#login-modal');
    if (loginModals.length > 1) {
        for (let i = 1; i < loginModals.length; i++) {
            loginModals[i].remove();
        }
    }
    
    // Đóng modal khi click bên ngoài
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Xử lý phím Escape
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="flex"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Hiệu ứng mở modal
        modal.style.opacity = '0';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Ngăn cuộn khi modal mở
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transition = 'opacity 0.3s ease';
        }, 10);
        
        // Focus vào input đầu tiên nếu có
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, 300);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Hiệu ứng đóng modal
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Khôi phục cuộn
            modal.style.transition = '';
        }, 300);
        
        // Reset form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            clearValidationErrors(form);
        }
    }
}

function switchModal(closeModalId, openModalId) {
    const closeModal = document.getElementById(closeModalId);
    const openModal = document.getElementById(openModalId);
    
    if (closeModal && openModal) {
        // Hiệu ứng chuyển đổi modal
        closeModal.style.opacity = '0';
        closeModal.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            closeModal.style.display = 'none';
            openModal.style.opacity = '0';
            openModal.style.display = 'flex';
            
            setTimeout(() => {
                openModal.style.opacity = '1';
                openModal.style.transition = 'opacity 0.3s ease';
                
                // Focus vào input đầu tiên nếu có
                const firstInput = openModal.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 10);
        }, 300);
    }
}

// ----------------------
// QUẢN LÝ MENU TRÊN MOBILE
// ----------------------

function initMobileMenu() {
    const header = document.querySelector('header');
    
    // Tạo nút menu mobile nếu chưa có
    if (!document.querySelector('.mobile-menu-btn')) {
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.onclick = toggleMobileMenu;
        
        // Chèn trước logo
        const logo = document.querySelector('.logo');
        if (logo && header) {
            header.querySelector('.header-container').insertBefore(mobileMenuBtn, logo);
        }
    }
    
    // Xử lý kích thước màn hình
    handleResize();
    
    // Lắng nghe sự kiện thay đổi kích thước
    window.addEventListener('resize', handleResize);
}

function toggleMobileMenu() {
    const mainNav = document.querySelector('.main-nav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mainNav) {
        mainNav.classList.toggle('active');
        
        // Thay đổi biểu tượng
        if (menuBtn) {
            menuBtn.innerHTML = mainNav.classList.contains('active') ? '✕' : '☰';
        }
        
        // Hiệu ứng
        if (mainNav.classList.contains('active')) {
            mainNav.style.opacity = '0';
            mainNav.style.display = 'block';
            
            setTimeout(() => {
                mainNav.style.opacity = '1';
                mainNav.style.transition = 'opacity 0.3s ease';
            }, 10);
        } else {
            mainNav.style.opacity = '0';
            mainNav.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                mainNav.style.display = 'none';
                mainNav.style.transition = '';
            }, 300);
        }
    }
}

function handleResize() {
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
        // Reset mobile menu khi resize về desktop
        const mainNav = document.querySelector('.main-nav');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (mainNav) {
            mainNav.classList.remove('active');
            mainNav.style.display = '';
            mainNav.style.opacity = '';
            mainNav.style.transition = '';
        }
        
        if (menuBtn) {
            menuBtn.innerHTML = '☰';
        }
    }
}

// ----------------------
// KIỂM TRA TÍNH HỢP LỆ CỦA FORM
// ----------------------

function initFormValidation() {
    // Form đăng nhập
    const loginForm = document.querySelector('#login-modal form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Reset lỗi
            clearValidationErrors(loginForm);
            
            // Kiểm tra email
            if (!isValidEmail(email)) {
                showValidationError('login-email', 'Email không hợp lệ');
                return;
            }
            
            // Kiểm tra mật khẩu
            if (password.length < 6) {
                showValidationError('login-password', 'Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }
            
            // Thực hiện đăng nhập
            login(email, password);
        });
    }
    
    // Form đăng ký
    const registerForm = document.querySelector('#register-modal form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Reset lỗi
            clearValidationErrors(registerForm);
            
            // Kiểm tra tên
            if (!name || name.length < 3) {
                showValidationError('register-name', 'Tên phải có ít nhất 3 ký tự');
                return;
            }
            
            // Kiểm tra email
            if (!isValidEmail(email)) {
                showValidationError('register-email', 'Email không hợp lệ');
                return;
            }
            
            // Kiểm tra mật khẩu
            if (password.length < 6) {
                showValidationError('register-password', 'Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }
            
            // Kiểm tra mật khẩu khớp
            if (password !== confirmPassword) {
                showValidationError('register-confirm-password', 'Mật khẩu không khớp');
                return;
            }
            
            // Thực hiện đăng ký
            register(name, email, password);
        });
    }
    
    // Form khôi phục mật khẩu
    const resetForm = document.querySelector('#reset-password-form');
    if (resetForm) {
        resetForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('reset-email').value;
            
            // Reset lỗi
            clearValidationErrors(resetForm);
            
            // Kiểm tra email
            if (!isValidEmail(email)) {
                showValidationError('reset-email', 'Email không hợp lệ');
                return;
            }
            
            // Thực hiện khôi phục mật khẩu
            resetPassword(email);
        });
    }
    
    // Thêm sự kiện validation ngay khi nhập
    const allInputs = document.querySelectorAll('form input');
    allInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            // Xóa lỗi khi người dùng đang nhập
            const errorElement = this.parentElement.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
                this.classList.remove('input-error');
            }
        });
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateInput(input) {
    // Xóa lỗi cũ
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
        input.classList.remove('input-error');
    }
    
    // Kiểm tra theo id
    switch(input.id) {
        case 'login-email':
        case 'register-email':
        case 'reset-email':
            if (!isValidEmail(input.value) && input.value.trim() !== '') {
                showValidationError(input.id, 'Email không hợp lệ');
            }
            break;
            
        case 'login-password':
        case 'register-password':
            if (input.value.length < 6 && input.value.trim() !== '') {
                showValidationError(input.id, 'Mật khẩu phải có ít nhất 6 ký tự');
            }
            break;
            
        case 'register-name':
            if (input.value.length < 3 && input.value.trim() !== '') {
                showValidationError(input.id, 'Tên phải có ít nhất 3 ký tự');
            }
            break;
            
        case 'register-confirm-password':
            const password = document.getElementById('register-password').value;
            if (input.value !== password && input.value.trim() !== '') {
                showValidationError(input.id, 'Mật khẩu không khớp');
            }
            break;
    }
}

function showValidationError(inputId, message) {
    const input = document.getElementById(inputId);
    if (input) {
        // Kiểm tra nếu đã có lỗi hiển thị
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.textContent = message;
            return;
        }
        
        // Tạo phần tử lỗi
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '5px';
        
        // Đánh dấu input lỗi
        input.classList.add('input-error');
        
        // Thêm vào DOM
        input.parentElement.appendChild(errorElement);
        
        // Focus vào input lỗi
        input.focus();
    }
}

function clearValidationErrors(form) {
    const errorMessages = form.querySelectorAll('.error-message');
    const errorInputs = form.querySelectorAll('.input-error');
    
    errorMessages.forEach(error => error.remove());
    errorInputs.forEach(input => input.classList.remove('input-error'));
}

// ----------------------
// XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ
// ----------------------

function initUserAuth() {
    // Thêm CSS cho dropdown menu user
    const style = document.createElement('style');
    style.textContent = `
        .user-dropdown {
            position: relative;
        }
        
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid var(--primary-color);
            transition: transform 0.3s;
        }
        
        .avatar:hover {
            transform: scale(1.1);
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background-color: var(--bg-secondary);
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            width: 200px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s, visibility 0.3s;
            z-index: 1000;
            padding: 10px 0;
            margin-top: 10px;
        }
        
        .dropdown-menu.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .dropdown-menu-item {
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-color);
            text-decoration: none;
            transition: background-color 0.3s;
        }
        
        .dropdown-menu-item:hover {
            background-color: rgba(108, 92, 231, 0.1);
        }
        
        .dropdown-menu-item.danger {
            color: #ff5e57;
        }
        
        .dropdown-divider {
            height: 1px;
            background-color: rgba(255, 255, 255, 0.1);
            margin: 5px 0;
        }
        
        .user-info {
            padding: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 5px;
            text-align: center;
        }
        
        .user-info .name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .user-info .email {
            font-size: 0.8rem;
            opacity: 0.7;
        }
        
        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: var(--danger-color);
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
}

function login(email, password) {
    // Giả lập API gọi
    setTimeout(() => {
        // Giả lập đăng nhập thành công
        if (email === 'demo@example.com' && password === 'password') {
            // Giả lập dữ liệu user
            const userData = {
                id: 1,
                name: 'Người dùng demo',
                email: 'demo@example.com',
                avatar: CONFIG.defaultAvatar
            };
            
            // Lưu dữ liệu đăng nhập vào localStorage
            localStorage.setItem(CONFIG.userKey, JSON.stringify(userData));
            localStorage.setItem(CONFIG.tokenKey, 'fake-jwt-token-example');
            
            // Hiện thông báo thành công
            showNotification('Đăng nhập thành công!', 'success');
            
            // Đóng modal
            closeModal('login-modal');
            
            // Cập nhật UI
            updateAuthUI(userData);
        } else {
            // Hiện thông báo lỗi
            showNotification('Email hoặc mật khẩu không đúng!', 'error');
        }
    }, 1000);
}

function register(name, email, password) {
    // Giả lập API gọi
    setTimeout(() => {
        // Giả lập đăng ký thành công
        // Giả lập dữ liệu user
        const userData = {
            id: 2,
            name: name,
            email: email,
            avatar: CONFIG.defaultAvatar
        };
        
        // Lưu dữ liệu đăng nhập vào localStorage
        localStorage.setItem(CONFIG.userKey, JSON.stringify(userData));
        localStorage.setItem(CONFIG.tokenKey, 'fake-jwt-token-example');
        
        // Hiện thông báo thành công
        showNotification('Đăng ký thành công!', 'success');
        
        // Đóng modal
        closeModal('register-modal');
        
        // Cập nhật UI
        updateAuthUI(userData);
    }, 1500);
}

function resetPassword(email) {
    // Giả lập API gọi
    setTimeout(() => {
        // Hiện thông báo thành công
        showNotification('Hướng dẫn khôi phục mật khẩu đã được gửi đến email của bạn!', 'success');
        
        // Đóng modal
        closeModal('reset-password-modal');
    }, 1000);
}

function logout() {
    // Xóa dữ liệu đăng nhập từ localStorage
    localStorage.removeItem(CONFIG.userKey);
    localStorage.removeItem(CONFIG.tokenKey);
    
    // Hiện thông báo
    showNotification('Đã đăng xuất!', 'success');
    
    // Cập nhật UI
    updateAuthUI(null);
}

function checkAuthStatus() {
    // Kiểm tra dữ liệu đăng nhập từ localStorage
    const userData = JSON.parse(localStorage.getItem(CONFIG.userKey));
    const token = localStorage.getItem(CONFIG.tokenKey);
    
    if (userData && token) {
        // Đã đăng nhập
        updateAuthUI(userData);
    } else {
        // Chưa đăng nhập
        updateAuthUI(null);
    }
}

function updateAuthUI(user) {
    const userActions = document.querySelector('.user-actions');
    
    if (user) {
        // Đã đăng nhập - cập nhật UI
        
        // Xóa nút đăng nhập và đăng ký
        const loginBtn = userActions.querySelector('button.btn-outline');
        const registerBtn = userActions.querySelector('button.btn-primary');
        
        if (loginBtn && loginBtn.textContent.trim() === 'Đăng nhập') {
            loginBtn.remove();
        }
        
        if (registerBtn && registerBtn.textContent.trim() === 'Đăng ký') {
            registerBtn.remove();
        }
        
        // Thêm avatar và dropdown nếu chưa có
        if (!document.querySelector('.user-dropdown')) {
            const userDropdown = document.createElement('div');
            userDropdown.className = 'user-dropdown';
            
            // Avatar với số thông báo
            const avatar = document.createElement('div');
            avatar.className = 'avatar-container';
            avatar.innerHTML = `
                <img src="${user.avatar}" alt="${user.name}" class="avatar">
                <span class="notification-badge">3</span>
            `;
            avatar.onclick = toggleUserDropdown;
            
            // Menu dropdown
            const dropdownMenu = document.createElement('div');
            dropdownMenu.className = 'dropdown-menu';
            dropdownMenu.innerHTML = `
                <div class="user-info">
                    <div class="name">${user.name}</div>
                    <div class="email">${user.email}</div>
                </div>
                <a href="#" class="dropdown-menu-item">👤 Hồ sơ của tôi</a>
                <a href="#" class="dropdown-menu-item">📺 Phim đã xem</a>
                <a href="#" class="dropdown-menu-item">⭐ Phim yêu thích</a>
                <a href="#" class="dropdown-menu-item">🔔 Thông báo (3)</a>
                <a href="#" class="dropdown-menu-item">⚙️ Cài đặt</a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-menu-item danger" id="logout-btn">🚪 Đăng xuất</a>
            `;
            
            userDropdown.appendChild(avatar);
            userDropdown.appendChild(dropdownMenu);
            userActions.appendChild(userDropdown);
            
            // Xử lý đăng xuất
            document.getElementById('logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
            
            // Đóng dropdown khi click ra ngoài
            document.addEventListener('click', function(event) {
                if (!userDropdown.contains(event.target)) {
                    dropdownMenu.classList.remove('active');
                }
            });
        }
    } else {
        // Chưa đăng nhập - khôi phục UI mặc định
        
        // Xóa user dropdown nếu có
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown) {
            userDropdown.remove();
        }
        
        // Thêm lại nút đăng nhập và đăng ký nếu chưa có
        if (!userActions.querySelector('button.btn-outline')) {
            const loginBtn = document.createElement('button');
            loginBtn.className = 'btn btn-outline';
            loginBtn.textContent = 'Đăng nhập';
            loginBtn.onclick = function() { openModal('login-modal'); };
            userActions.appendChild(loginBtn);
        }
        
        if (!userActions.querySelector('button.btn-primary')) {
            const registerBtn = document.createElement('button');
            registerBtn.className = 'btn btn-primary';
            registerBtn.textContent = 'Đăng ký';
            registerBtn.onclick = function() { openModal('register-modal'); };
            userActions.appendChild(registerBtn);
        }
    }
}

function toggleUserDropdown() {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('active');
    }
}

// ----------------------
// THÔNG BÁO
// ----------------------

function showNotification(message, type = 'info', duration = 3000) {
    // Tạo container cho thông báo nếu chưa có
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${message}
        </div>
        <button class="notification-close">✕</button>
    `;
    
    // Thêm CSS inline
    notification.style.backgroundColor = type === 'success' ? '#00b894' : 
                                         type === 'error' ? '#ff5e57' : 
                                         type === 'warning' ? '#fdcb6e' : '#0984e3';
    notification.style.color = 'white';
    notification.style.padding = '12px 15px';
    notification.style.borderRadius = '8px';
    notification.style.margin = '0 0 10px 0';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(30px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Nút đóng
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '1rem';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.opacity = '0.7';
    closeBtn.style.transition = 'opacity 0.3s';
    
    closeBtn.addEventListener('mouseover', function() {
        this.style.opacity = '1';
    });
    
    closeBtn.addEventListener('mouseout', function() {
        this.style.opacity = '0.7';
    });
    
    // Xử lý đóng thông báo
    closeBtn.addEventListener('click', function() {
        hideNotification(notification);
    });
    
    // Thêm vào container
    notificationContainer.appendChild(notification);
    
    // Hiệu ứng hiện
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Tự động ẩn sau một khoảng thời gian
    setTimeout(() => {
        hideNotification(notification);
    }, duration);
}

function hideNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(30px)';
    
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// ----------------------
// TÌM KIẾM
// ----------------------

function initSearchFunctionality() {
    const searchBox = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    if (searchBox && searchButton) {
        // Tạo container kết quả tìm kiếm nếu chưa có
        let searchResults = document.querySelector('.search-results');
        if (!searchResults) {
            searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            searchResults.style.position = 'absolute';
            searchResults.style.top = '100%';
            searchResults.style.left = '0';
            searchResults.style.width = '100%';
            searchResults.style.backgroundColor = 'var(--bg-secondary)';
            searchResults.style.borderRadius = '0 0 8px 8px';
            searchResults.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            searchResults.style.maxHeight = '300px';
            searchResults.style.overflowY = 'auto';
            searchResults.style.zIndex = '999';
            searchResults.style.display = 'none';
            
            document.querySelector('.search-box').appendChild(searchResults);
        }
        
        // Xử lý sự kiện search
        searchBox.addEventListener('keyup', function(event) {
            const query = this.value.trim();
            
            if (query.length >= 2) {
                performSearch(query);
            } else {
                searchResults.style.display = 'none';
            }
            
            // Tìm kiếm khi nhấn Enter
            if (event.key === 'Enter' && query.length >= 2) {
                event.preventDefault();
                performSearch(query, true); // true = tìm kiếm toàn trang
            }
        });
        
        // Tìm kiếm khi click nút tìm kiếm
        searchButton.addEventListener('click', function() {
            const query = searchBox.value.trim();
            
            if (query.length >= 2) {
                performSearch(query, true); // true = tìm kiếm toàn trang
            }
        });
        
        // Đóng kết quả tìm kiếm khi click ra ngoài
        document.addEventListener('click', function(event) {
            if (!document.querySelector('.search-box').contains(event.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
}

function performSearch(query, fullSearch = false) {
    const searchResults = document.querySelector('.search-results');
    
    // Dữ liệu mẫu phim
    const animeData = [
        { id: 1, title: 'Demon Slayer', year: 2023, img: '/api/placeholder/200/280', rating: 9.2 },
        { id: 2, title: 'Attack on Titan', year: 2022, img: '/api/placeholder/200/280', rating: 9.5 },
        { id: 3, title: 'Jujutsu Kaisen', year: 2023, img: '/api/placeholder/200/280', rating: 9.0 },
        { id: 4, title: 'One Piece', year: 2023, img: '/api/placeholder/200/280', rating: 9.3 },
        { id: 5, title: 'My Hero Academia', year: 2022, img: '/api/placeholder/200/280', rating: 8.9 },
        { id: 6, title: 'Chainsaw Man', year: 2023, img: '/api/placeholder/200/280', rating: 8.8 },
        { id: 7, title: 'Spy x Family', year: 2023, img: '/api/placeholder/200/280', rating: 9.1 },
        { id: 8, title: 'Tokyo Revengers', year: 2023, img: '/api/placeholder/200/280', rating: 8.7 },
        { id: 9, title: 'Blue Lock', year: 2023, img: '/api/placeholder/200/280', rating: 8.6 },
        { id: 10, title: 'Bleach: Thousand-Year', year: 2023, img: '/api/placeholder/200/280', rating: 9.4 }
    ];
    
    // Lọc kết quả tìm kiếm
    const queryLower = query.toLowerCase();
    const results = animeData.filter(anime => anime.title.toLowerCase().includes(queryLower));
    
    if (fullSearch) {
        // Mở trang tìm kiếm đầy đủ (giả lập)
        alert(`Đang tìm kiếm "${query}"...\nTìm thấy ${results.length} kết quả.`);
        searchResults.style.display = 'none';
        return;
    }
    
    if (results.length > 0) {
        // Hiển thị kết quả
        searchResults.innerHTML = '';
        results.slice(0, 5).forEach(anime => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <img src="${anime.img}" alt="${anime.title}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div class="search-result-info">
                    <div class="search-result-title">${anime.title}</div>
                    <div class="search-result-meta">${anime.year} | ★ ${anime.rating}</div>
                </div>
            `;
            
            // CSS cho item
            resultItem.style.display = 'flex';
            resultItem.style.alignItems = 'center';
            resultItem.style.gap = '10px';
            resultItem.style.padding = '10px 15px';
            resultItem.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            resultItem.style.cursor = 'pointer';
            resultItem.style.transition = 'background-color 0.3s';
            
            // CSS cho info
            const infoDiv = resultItem.querySelector('.search-result-info');
            infoDiv.style.flex = '1';
            
            // CSS cho title
            const titleDiv = resultItem.querySelector('.search-result-title');
            titleDiv.style.fontWeight = '500';
            
            // CSS cho meta
            const metaDiv = resultItem.querySelector('.search-result-meta');
            metaDiv.style.fontSize = '0.8rem';
            metaDiv.style.opacity = '0.7';
            
            // Hiệu ứng hover
            resultItem.addEventListener('mouseover', function() {
                this.style.backgroundColor = 'rgba(108, 92, 231, 0.1)';
            });
            
            resultItem.addEventListener('mouseout', function() {
                this.style.backgroundColor = 'transparent';
            });
            
            // Xử lý khi click vào kết quả
            resultItem.addEventListener('click', function() {
                alert(`Bạn đã chọn phim: ${anime.title}`);
                searchResults.style.display = 'none';
            });
            
            searchResults.appendChild(resultItem);
        });
        
        // Hiển thị "Xem thêm" nếu có nhiều kết quả
        if (results.length > 5) {
            const viewMore = document.createElement('div');
            viewMore.className = 'search-view-more';
            viewMore.textContent = `Xem thêm ${results.length - 5} kết quả khác`;
            viewMore.style.padding = '10px 15px';
            viewMore.style.textAlign = 'center';
            viewMore.style.color = 'var(--primary-color)';
            viewMore.style.fontWeight = '500';
            viewMore.style.cursor = 'pointer';
            
            viewMore.addEventListener('click', function() {
                alert(`Đang tìm kiếm "${query}"...\nTìm thấy ${results.length} kết quả.`);
                searchResults.style.display = 'none';
            });
            
            searchResults.appendChild(viewMore);
        }
        
        searchResults.style.display = 'block';
    } else {
        // Không có kết quả
        searchResults.innerHTML = `
            <div style="padding: 15px; text-align: center;">
                Không tìm thấy kết quả cho "${query}"
            </div>
        `;
        searchResults.style.display = 'block';
    }
}

// ----------------------
// HIỆU ỨNG LỊCH
// ----------------------

function initCalendarEvents() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            // Lấy số ngày
            const dayNumber = this.querySelector('.day-number').textContent;
            
            // Tạo danh sách phim phát hành
            let releaseList = '';
            
            // Hiển thị thông tin chi tiết cho ngày có phát hành
            if (this.classList.contains('has-release')) {
                // Dữ liệu giả lập phát hành cho ngày
                const releases = [
                    { title: 'One Piece', episode: 'Tập 1077', time: '10:00' },
                    { title: 'Demon Slayer', episode: 'Tập 9', time: '12:30' },
                    { title: 'Jujutsu Kaisen', episode: 'Tập 15', time: '18:00' }
                ];
                
                releases.forEach(anime => {
                    releaseList += `
                        <div class="release-item" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                            <div>
                                <div style="font-weight: bold;">${anime.title}</div>
                                <div style="font-size: 0.8rem; opacity: 0.7;">${anime.episode}</div>
                            </div>
                            <div style="color: var(--primary-color);">${anime.time}</div>
                        </div>
                    `;
                });
                
                showCalendarModal(`Phim phát hành ngày ${dayNumber}/4/2025`, releaseList);
            } else {
                showCalendarModal(`Ngày ${dayNumber}/4/2025`, '<div style="text-align: center; padding: 20px;">Không có phim mới phát hành vào ngày này.</div>');
            }
        });
    });
}

function showCalendarModal(title, content) {
    // Kiểm tra và xóa modal cũ nếu có
    const existingModal = document.getElementById('calendar-detail-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Tạo modal mới
    const modal = document.createElement('div');
    modal.id = 'calendar-detail-modal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="close-btn" onclick="document.getElementById('calendar-detail-modal').remove();">✕</button>
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body" style="max-height: 300px; overflow-y: auto;">
                ${content}
            </div>
        </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(modal);
    
    // Đóng modal khi click ngoài
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

// ----------------------
// HIỆU ỨNG HOVER MOVIE
// ----------------------

function initMovieHover() {
    const movieCards = document.querySelectorAll('.movie-card');
    
    movieCards.forEach(card => {
        // Tối ưu hover bằng sự kiện mouseenter/mouseleave thay vì CSS hover
        card.addEventListener('mouseenter', function() {
            const overlay = this.querySelector('.movie-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
            
            // Hiệu ứng nâng lên
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.movie-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
            
            // Hiệu ứng trở lại
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
        });
        
        // Thêm sự kiện click
        card.addEventListener('click', function() {
            const title = this.querySelector('.movie-title').textContent;
            openMovieDetail(title);
        });
    });
}

function openMovieDetail(title) {
    // Giả lập dữ liệu chi tiết phim
    const movieData = {
        title: title,
        year: 2023,
        rating: 9.2,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget magna a dolor scelerisque semper. Duis dapibus dolor sit amet risus finibus, at gravida odio fermentum.',
        genres: ['Hành động', 'Phiêu lưu', 'Fantasy'],
        episodes: 24,
        studio: 'Ufotable',
        status: 'Đang phát hành',
        image: '/api/placeholder/500/280'
    };
    
    // Tạo modal chi tiết phim
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'movie-detail-modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; width: 90%;">
            <button class="close-btn" onclick="document.getElementById('movie-detail-modal').remove();">✕</button>
            <div class="modal-body" style="padding: 0;">
                <div class="movie-detail-header" style="position: relative; height: 280px; overflow: hidden;">
                    <img src="${movieData.image}" alt="${movieData.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 20px;">
                        <h2 style="margin: 0; color: white;">${movieData.title}</h2>
                        <div style="display: flex; gap: 10px; margin-top: 5px; color: white;">
                            <span>${movieData.year}</span>
                            <span>•</span>
                            <span>${movieData.episodes} tập</span>
                            <span>•</span>
                            <span>★ ${movieData.rating}</span>
                        </div>
                    </div>
                </div>
                
                <div class="movie-detail-content" style="padding: 20px;">
                    <div class="movie-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <h3 style="margin-top: 0;">Thông tin</h3>
                            <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px;">
                                <span style="font-weight: bold;">Studio:</span> <span>${movieData.studio}</span>
                                <span style="font-weight: bold;">Trạng thái:</span> <span>${movieData.status}</span>
                                <span style="font-weight: bold;">Số tập:</span> <span>${movieData.episodes}</span>
                                <span style="font-weight: bold;">Thể loại:</span> <span>${movieData.genres.join(', ')}</span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="margin-top: 0;">Đánh giá</h3>
                            <div class="rating-stars" style="font-size: 24px; color: gold; margin-bottom: 10px;">★★★★★</div>
                            <div>
                                <button class="btn btn-primary" style="margin-right: 10px;">Xem ngay</button>
                                <button class="btn btn-outline">+ Yêu thích</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="movie-description">
                        <h3>Nội dung</h3>
                        <p>${movieData.description}</p>
                    </div>
                    
                    <div class="movie-episodes">
                        <h3>Danh sách tập</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;">
                            ${Array(movieData.episodes).fill().map((_, i) => 
                                `<div style="background-color: var(--bg-secondary); padding: 10px; border-radius: 5px; text-align: center; cursor: pointer;">Tập ${i+1}</div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(modal);
    
    // Đóng modal khi click ngoài
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
    
    // Thêm CSS cho modal content
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.borderRadius = '10px';
    modalContent.style.overflow = 'hidden';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    
    // Hỗ trợ cuộn cho modal body
    const modalBody = modal.querySelector('.modal-body');
    modalBody.style.overflowY = 'auto';
    modalBody.style.flex = '1';
}

// ----------------------
// HIỆU ỨNG CUỘN
// ----------------------

function initScrollEffects() {
    // Hiệu ứng parallax cho hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            if (scrollPosition < 600) {
                hero.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
            }
        });
    }
    
    // Nút cuộn lên đầu trang
    createScrollTopButton();
    
    // Hiệu ứng xuất hiện cho các phần tử khi cuộn
    initScrollReveal();
}

function createScrollTopButton() {
    // Tạo nút cuộn lên đầu trang
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.position = 'fixed';
    scrollBtn.style.bottom = '20px';
    scrollBtn.style.right = '20px';
    scrollBtn.style.width = '50px';
    scrollBtn.style.height = '50px';
    scrollBtn.style.borderRadius = '50%';
    scrollBtn.style.backgroundColor = 'var(--primary-color)';
    scrollBtn.style.color = 'white';
    scrollBtn.style.border = 'none';
    scrollBtn.style.fontSize = '20px';
    scrollBtn.style.cursor = 'pointer';
    scrollBtn.style.display = 'none';
    scrollBtn.style.zIndex = '99';
    scrollBtn.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    scrollBtn.style.transition = 'all 0.3s';
    
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    scrollBtn.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    });
    
    scrollBtn.addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    });
    
    document.body.appendChild(scrollBtn);
    
    // Hiển thị nút khi cuộn xuống
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'block';
            scrollBtn.style.opacity = '1';
        } else {
            scrollBtn.style.opacity = '0';
            setTimeout(() => {
                if (window.scrollY <= 300) {
                    scrollBtn.style.display = 'none';
                }
            }, 300);
        }
    });
}

function initScrollReveal() {
    // Các section cần hiệu ứng xuất hiện
    const sections = [
        '.features',
        '.movies-section',
        '.categories',
        '.continue-watching',
        '.release-calendar',
        '.achievements',
        '.membership'
    ];
    
    // Lắng nghe sự kiện cuộn
    window.addEventListener('scroll', function() {
        sections.forEach(sectionSelector => {
            const section = document.querySelector(sectionSelector);
            if (section) {
                const sectionTop = section.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (sectionTop < windowHeight * 0.75) {
                    section.classList.add('revealed');
                    
                    // Thêm hiệu ứng cho các phần tử con
                    const childElements = section.querySelectorAll('.feature-card, .movie-card, .category-item, .watch-card, .achievement-card, .plan-card');
                    childElements.forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('revealed');
                        }, 100 * index);
                    });
                }
            }
        });
    });
    
    // Thêm CSS cho hiệu ứng
    const style = document.createElement('style');
    style.textContent = `
        .features, .movies-section, .categories, .continue-watching, .release-calendar, .achievements, .membership {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.5s, transform 0.5s;
        }
        
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .feature-card, .movie-card, .category-item, .watch-card, .achievement-card, .plan-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s, transform 0.5s;
        }
    `;
    document.head.appendChild(style);
    
    // Kích hoạt kiểm tra ban đầu
    window.dispatchEvent(new Event('scroll'));
}