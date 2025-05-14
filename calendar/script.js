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

    document.querySelectorAll('.calendar-container, .release-card, .faq-item').forEach(the => {
        quanSat.observe(the);
    });

    // Xử lý lịch phát hành
    const calendarDays = document.querySelector('.calendar-days');
    const calendarTitle = document.querySelector('.calendar-title');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let currentDate = new Date(2025, 3, 1); // Tháng 4/2025 (tháng 3 trong JS)

    // Danh sách ngày phát hành giả lập
    const releaseDates = [
        { date: new Date(2025, 3, 27), anime: 'Demon Slayer: Season 5' },
        { date: new Date(2025, 3, 28), anime: 'Jujutsu Kaisen: Season 3' },
        { date: new Date(2025, 3, 30), anime: 'One Piece: Egghead Arc' }
    ];

    function renderCalendar() {
        calendarDays.innerHTML = '';
        calendarTitle.textContent = `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = firstDayOfMonth.getDay();
        const today = new Date(2025, 3, 26); // Giả lập ngày hiện tại: 26/04/2025

        // Thêm các ngày trống đầu tháng
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarDays.appendChild(emptyDay);
        }

        // Thêm các ngày trong tháng
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const calendarDay = document.createElement('div');
            calendarDay.className = 'calendar-day';
            calendarDay.innerHTML = `<div class="day-number">${day}</div>`;

            // Đánh dấu ngày hiện tại
            if (day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
                calendarDay.classList.add('today');
            }

            // Đánh dấu ngày có phát hành
            const release = releaseDates.find(r => r.date.getDate() === day && r.date.getMonth() === currentDate.getMonth() && r.date.getFullYear() === currentDate.getFullYear());
            if (release) {
                calendarDay.classList.add('has-release');
                calendarDay.addEventListener('click', () => {
                    hienThiThongBao(`Ngày ${day}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}: ${release.anime}`, 'thanhCong');
                });
            }

            calendarDays.appendChild(calendarDay);
        }
    }

    // Khởi tạo lịch
    renderCalendar();

    // Điều hướng tháng
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Xử lý nút "Thêm vào danh sách"
    document.querySelectorAll('.release-card .btn-primary').forEach(nut => {
        nut.addEventListener('click', () => {
            const tenAnime = nut.closest('.release-card').querySelector('.release-title').textContent;
            hienThiThongBao(`Đã thêm "${tenAnime}" vào danh sách theo dõi!`, 'thanhCong');
            if (window.openModal) {
                window.openModal('login-modal');
            }
        });
    });
});