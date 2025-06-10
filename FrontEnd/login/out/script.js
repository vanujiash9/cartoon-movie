document.addEventListener('DOMContentLoaded', () => {
    // Xử lý menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuBtn.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Xử lý form đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
                return;
            }

            // Giả lập đăng nhập
            showNotification('Đăng nhập thành công!', 'success');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        });
    }

    // Xử lý form đăng ký
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (!name || !email || !password || !confirmPassword) {
                showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Mật khẩu xác nhận không khớp!', 'error');
                document.getElementById('register-confirm-password').classList.add('input-error');
                return;
            }

            // Giả lập đăng ký
            showNotification('Đăng ký thành công! Đang chuyển hướng...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // Hàm hiển thị thông báo
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.maxWidth = '300px';

        if (type === 'success') {
            notification.style.backgroundColor = 'var(--success-color)';
        } else if (type === 'error') {
            notification.style.backgroundColor = 'var(--danger-color)';
        }

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});