document.addEventListener('DOMContentLoaded', () => {
    // Hàm hiển thị thông báo tùy chỉnh
    function hienThiThongBao(noiDung, loai = 'thanhCong') {
        const thongBao = document.createElement('div');
        thongBao.className = `thong-bao thong-bao-${loai}`;
        thongBao.textContent = noiDung;
        document.body.appendChild(thongBao);
        setTimeout(() => {
            thongBao.style.opacity = '0';
            setTimeout(() => thongBao.remove(), 300);
        }, 3000);
    }

    // Chuyển đổi chế độ sáng/tối (nếu có nút theme-toggle trong Header)
    const nutChuyenDoiGiaoDien = document.getElementById('theme-toggle');
    if (nutChuyenDoiGiaoDien) {
        nutChuyenDoiGiaoDien.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            document.body.classList.toggle('dark-mode');
            nutChuyenDoiGiaoDien.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
            localStorage.setItem('giaoDien', document.body.classList.contains('dark-mode') ? 'toi' : 'sang');
        });

        // Khôi phục chế độ giao diện từ localStorage
        const giaoDienDaLuu = localStorage.getItem('giaoDien');
        if (giaoDienDaLuu === 'sang') {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            nutChuyenDoiGiaoDien.textContent = '☀️';
        }
    }

    // Chuyển đổi hiển thị FAQ
    document.querySelectorAll('.faq-question').forEach(cauHoi => {
        cauHoi.addEventListener('click', () => {
            const cauTraLoi = cauHoi.nextElementSibling;
            const dauHieu = cauHoi.querySelector('span:last-child');
            cauTraLoi.style.display = cauTraLoi.style.display === 'block' ? 'none' : 'block';
            dauHieu.textContent = cauTraLoi.style.display === 'block' ? '−' : '+';
        });
    });

    // Hiệu ứng động khi cuộn trang
    const quanSat = new IntersectionObserver((muc) => {
        muc.forEach(m => {
            if (m.isIntersecting) {
                m.target.classList.add('visible');
                quanSat.unobserve(m.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.plan-card, .faq-item').forEach(the => {
        quanSat.observe(the);
    });

    // Xử lý nút đăng ký gói
    document.querySelectorAll('.subscribe-btn').forEach(nut => {
        nut.addEventListener('click', () => {
            const goi = nut.dataset.plan;
            hienThiThongBao(`Bạn đã chọn đăng ký gói ${goi}! Vui lòng đăng nhập để tiếp tục.`, 'thanhCong');
            if (window.openModal) {
                window.openModal('login-modal');
            }
        });
    });
});