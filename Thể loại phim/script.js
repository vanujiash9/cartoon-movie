document.addEventListener('DOMContentLoaded', () => {
    // Danh sách anime giả lập (thay thế bằng API trong ứng dụng thực tế)
    const danhSachAnime = Array.from(document.querySelectorAll('.category-card')).map(the => ({
        ten: the.querySelector('.category-name').textContent,
        theLoai: the.closest('.category-section').querySelector('.category-header h2').textContent.toLowerCase(),
        soTap: the.querySelector('.category-count').textContent,
        nam: Math.floor(Math.random() * (2025 - 2000) + 2000), // Giả lập năm
        trangThai: ['ongoing', 'completed', 'upcoming'][Math.floor(Math.random() * 3)] // Giả lập trạng thái
    }));

    // Tải danh sách yêu thích từ localStorage
    const danhSachYeuThich = JSON.parse(localStorage.getItem('danhSachYeuThich') || '[]');
    document.querySelectorAll('.favorite-btn').forEach(nut => {
        const tenAnime = nut.closest('.category-card').querySelector('.category-name').textContent;
        if (danhSachYeuThich.includes(tenAnime)) {
            nut.classList.add('active');
            nut.style.color = '#e74c3c';
        }
    });

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

    // Chức năng lọc động
    function locAnime() {
        const sapXepTheo = document.getElementById('sort-by').value;
        const locTheoNam = document.getElementById('year-filter').value;
        const locTheoTrangThai = document.getElementById('status-filter').value;
        const theLoaiPhu = Array.from(document.querySelectorAll('.tag-btn.active')).map(nut => nut.dataset.genre);

        document.querySelectorAll('.category-card').forEach(the => {
            const tenAnime = the.querySelector('.category-name').textContent;
            const anime = danhSachAnime.find(a => a.ten === tenAnime);
            let hienThi = true;

            if (locTheoNam !== 'all' && anime.nam.toString() !== locTheoNam && locTheoNam !== 'older') {
                hienThi = false;
            } else if (locTheoNam === 'older' && anime.nam > 2021) {
                hienThi = false;
            }

            if (locTheoTrangThai !== 'all' && anime.trangThai !== locTheoTrangThai) {
                hienThi = false;
            }

            if (theLoaiPhu.length > 0 && !theLoaiPhu.includes(anime.theLoai)) {
                hienThi = false;
            }

            the.style.display = hienThi ? 'block' : 'none';
        });

        // Sắp xếp (giả lập, cần điều chỉnh nếu có dữ liệu thực)
        if (sapXepTheo === 'a-z') {
            document.querySelectorAll('.category-section').forEach(section => {
                const cards = Array.from(section.querySelectorAll('.category-card')).sort((a, b) =>
                    a.querySelector('.category-name').textContent.localeCompare(b.querySelector('.category-name').textContent)
                );
                section.querySelector('.category-grid').innerHTML = '';
                cards.forEach(card => section.querySelector('.category-grid').appendChild(card));
            });
        }
    }

    document.querySelectorAll('select').forEach(chon => {
        chon.addEventListener('change', locAnime);
    });

    document.querySelectorAll('.tag-btn').forEach(nut => {
        nut.addEventListener('click', function() {
            this.classList.toggle('active');
            this.style.backgroundColor = this.classList.contains('active') ? 'var(--primary-color)' : 'var(--bg-color)';
            locAnime();
        });
    });

    // Chức năng tìm kiếm động và gợi ý
    const oNhapTimKiem = document.querySelector('.search-filter input');
    const nutTimKiem = document.querySelector('.search-filter button');
    const goiYTimKiem = document.createElement('div');
    goiYTimKiem.className = 'goi-y-tim-kiem';
    oNhapTimKiem.parentElement.appendChild(goiYTimKiem);

    function capNhatGoiY(tuKhoa) {
        goiYTimKiem.innerHTML = '';
        if (!tuKhoa) {
            goiYTimKiem.style.display = 'none';
            return;
        }
        const goiY = danhSachAnime.filter(a => a.ten.toLowerCase().includes(tuKhoa.toLowerCase())).slice(0, 5);
        goiY.forEach(anime => {
            const mucGoiY = document.createElement('div');
            mucGoiY.textContent = anime.ten;
            mucGoiY.addEventListener('click', () => {
                oNhapTimKiem.value = anime.ten;
                goiYTimKiem.style.display = 'none';
                thucHienTimKiem();
            });
            goiYTimKiem.appendChild(mucGoiY);
        });
        goiYTimKiem.style.display = goiY.length > 0 ? 'block' : 'none';
    }

    function thucHienTimKiem() {
        const tuKhoa = oNhapTimKiem.value.trim().toLowerCase();
        document.querySelectorAll('.category-card').forEach(the => {
            const tenAnime = the.querySelector('.category-name').textContent.toLowerCase();
            the.style.display = tuKhoa && !tenAnime.includes(tuKhoa) ? 'none' : 'block';
        });
        goiYTimKiem.style.display = 'none';
        if (tuKhoa) {
            hienThiThongBao(`Đã tìm kiếm: "${tuKhoa}"`, 'thanhCong');
        }
    }

    oNhapTimKiem.addEventListener('input', () => capNhatGoiY(oNhapTimKiem.value.trim()));
    nutTimKiem.addEventListener('click', thucHienTimKiem);
    oNhapTimKiem.addEventListener('keypress', e => {
        if (e.key === 'Enter') thucHienTimKiem();
    });

    // Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', e => {
        if (!oNhapTimKiem.contains(e.target) && !goiYTimKiem.contains(e.target)) {
            goiYTimKiem.style.display = 'none';
        }
    });

    // Chức năng thêm/xóa yêu thích
    document.querySelectorAll('.favorite-btn').forEach(nut => {
        nut.addEventListener('click', e => {
            e.stopPropagation();
            nut.classList.toggle('active');
            nut.style.color = nut.classList.contains('active') ? '#e74c3c' : 'white';
            const tenAnime = nut.closest('.category-card').querySelector('.category-name').textContent;
            let danhSachYeuThich = JSON.parse(localStorage.getItem('danhSachYeuThich') || '[]');
            if (nut.classList.contains('active')) {
                if (!danhSachYeuThich.includes(tenAnime)) danhSachYeuThich.push(tenAnime);
                hienThiThongBao(`Đã thêm "${tenAnime}" vào yêu thích!`, 'thanhCong');
            } else {
                danhSachYeuThich = danhSachYeuThich.filter(ten => ten !== tenAnime);
                hienThiThongBao(`Đã xóa "${tenAnime}" khỏi yêu thích!`, 'canhBao');
            }
            localStorage.setItem('danhSachYeuThich', JSON.stringify(danhSachYeuThich));
        });
    });

    // Nhấn vào thẻ anime
    document.querySelectorAll('.category-card').forEach(the => {
        the.addEventListener('click', function(e) {
            if (e.target.classList.contains('favorite-btn') || e.target.classList.contains('rating')) return;
            const tenTheLoai = this.querySelector('.category-name').textContent;
            window.location.href = `#${tenTheLoai.toLowerCase().replace(/\s+/g, '-')}`;
        });
    });

    // Phân trang
    document.querySelectorAll('.pagination-item').forEach(muc => {
        muc.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.pagination-item').forEach(i => i.classList.remove('active'));
            muc.classList.add('active');
            window.scrollTo({
                top: document.querySelector('.categories-main').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });

    // Điều khiển thanh trượt thể loại thịnh hành
    const thanhTruot = document.querySelector('.trending-slider');
    const nutTruoc = document.getElementById('prev-trending');
    const nutSau = document.getElementById('next-trending');

    nutTruoc.addEventListener('click', () => {
        thanhTruot.scrollBy({ left: -250, behavior: 'smooth' });
    });

    nutSau.addEventListener('click', () => {
        thanhTruot.scrollBy({ left: 250, behavior: 'smooth' });
    });

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

    document.querySelectorAll('.category-card, .genre-card, .trending-item, .staff-pick-card, .faq-item, .combination-card').forEach(the => {
        quanSat.observe(the);
    });

    // Chuyển đổi chế độ sáng/tối
    const nutChuyenDoiGiaoDien = document.getElementById('theme-toggle');
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

    // Chức năng xếp hạng (giả lập)
    document.querySelectorAll('.rating').forEach(xepHang => {
        xepHang.addEventListener('click', function(e) {
            e.stopPropagation();
            const tenAnime = this.closest('.category-card').querySelector('.category-name').textContent;
            hienThiThongBao(`Đánh giá cho "${tenAnime}"!`, 'thanhCong');
        });
    });

    // Phím tắt
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            oNhapTimKiem.focus();
        }
        if (e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
            document.querySelector('.pagination-item.active').nextElementSibling?.click();
        }
        if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
            document.querySelector('.pagination-item.active').previousElementSibling?.click();
        }
    });
});