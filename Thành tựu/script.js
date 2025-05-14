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

    // Hiệu ứng động khi cuộn trang
    const quanSat = new IntersectionObserver((muc) => {
        muc.forEach(m => {
            if (m.isIntersecting) {
                m.target.classList.add('visible');
                quanSat.unobserve(m.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.achievement-card, .leaderboard-item, .reward-card').forEach(the => {
        quanSat.observe(the);
    });

    // Xử lý nút yêu cầu phần thưởng thành tựu
    document.querySelectorAll('.claim-btn').forEach(nut => {
        nut.addEventListener('click', () => {
            const tenThanhTuu = nut.dataset.achievement;
            if (!nut.disabled) {
                hienThiThongBao(`Yêu cầu phần thưởng cho "${tenThanhTuu}" thành công!`, 'thanhCong');
                if (window.openModal) {
                    window.openModal('login-modal');
                }
            } else {
                hienThiThongBao(`Vui lòng hoàn thành "${tenThanhTuu}" trước khi yêu cầu!`, 'canhBao');
            }
        });
    });

    // Xử lý nút xem hồ sơ trong bảng xếp hạng
    document.querySelectorAll('.view-profile-btn').forEach(nut => {
        nut.addEventListener('click', () => {
            const tenNguoiDung = nut.dataset.user;
            hienThiThongBao(`Đang xem hồ sơ của "${tenNguoiDung}"`, 'thanhCong');
            if (window.openModal) {
                window.openModal('login-modal');
            }
        });
    });

    // Xử lý nút xem chi tiết phần thưởng
    document.querySelectorAll('.unlock-btn').forEach(nut => {
        nut.addEventListener('click', () => {
            const tenPhanThuong = nut.dataset.reward;
            hienThiThongBao(`Xem chi tiết phần thưởng "${tenPhanThuong}"`, 'thanhCong');
            if (window.openModal) {
                window.openModal('login-modal');
            }
        });
    });
});