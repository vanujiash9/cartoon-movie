// achievements-page/script.js

// API Configuration
const API_BASE = 'http://localhost:8080';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// API Helper Functions
async function apiCall(url, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (authToken) {
            options.headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(API_BASE + url, options);
        const data = await response.json();
        
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

async function getUserAchievements() {
    if (!currentUser?.id) {
        console.warn('No user logged in');
        return { success: false, error: 'User not logged in' };
    }
    
    const result = await apiCall(`/api/achievements/progress/${currentUser.id}`);
    return result;
}

async function triggerAchievementCheck() {
    if (!currentUser?.id) return;
    
    try {
        await apiCall(`/api/achievements/check/${currentUser.id}`, 'POST');
    } catch (error) {
        console.error('Error triggering achievement check:', error);
    }
}

// Social Sharing Function for integration with movie pages
async function shareMovie(cartoonId, platform = 'facebook') {
    if (!currentUser?.id) {
        alert('Vui lòng đăng nhập để chia sẻ!');
        return false;
    }
    
    try {
        const result = await apiCall('/api/social/share', 'POST', {
            userId: currentUser.id,
            cartoonId,
            platform
        });
        
        if (result.success) {
            // Trigger achievement check after successful share
            await triggerAchievementCheck();
            return true;
        } else {
            console.error('Share failed:', result);
            return false;
        }
    } catch (error) {
        console.error('Error sharing movie:', error);
        return false;
    }
}

// Make shareMovie globally available for other pages
window.shareMovie = shareMovie;

// --- Iframe and Theme Sync Logic (MUST BE AT THE TOP or accessible globally) ---
const mainPageBody = document.body;
const headerIframeEl = document.getElementById("header-iframe");
const footerIframeEl = document.getElementById("footer-iframe");
const pageContentWrapper = document.querySelector(".page-content"); // Assumes your <main> has this class

function syncThemeWithIframes(themeName) {
  const themeMessage = { type: "themeChange", theme: themeName };
  if (headerIframeEl && headerIframeEl.contentWindow) {
    try {
      headerIframeEl.contentWindow.postMessage(themeMessage, "*");
    } catch (e) {
      console.warn("Error posting theme to header iframe:", e);
    }
  }
  if (footerIframeEl && footerIframeEl.contentWindow) {
    try {
      footerIframeEl.contentWindow.postMessage(themeMessage, "*");
    } catch (e) {
      console.warn("Error posting theme to footer iframe:", e);
    }
  }
}

// Make handleIframeLoad globally available BEFORE DOMContentLoaded for iframes that load very fast
window.handleIframeLoad = function (iframeElement) {
  if (!iframeElement) {
    // console.warn("handleIframeLoad: null iframeElement");
    return;
  }
  const attemptLoad = () => {
    if (
      !iframeElement.contentWindow ||
      !iframeElement.contentWindow.document ||
      !iframeElement.contentWindow.document.body
    ) {
      // console.warn("iframe content not ready for", iframeElement.id, ". Retrying...");
      setTimeout(attemptLoad, 150); // Retry
      return;
    }
    try {
      const iframeDoc = iframeElement.contentWindow.document;
      const headerContentEl = iframeDoc.querySelector("header"); // For header iframe
      let newHeight = 70; // Default

      if (iframeElement.id === "header-iframe" && headerContentEl) {
        const styles =
          iframeElement.contentWindow.getComputedStyle(headerContentEl);
        const marginTop = parseFloat(styles.marginTop) || 0;
        const marginBottom = parseFloat(styles.marginBottom) || 0;
        newHeight = headerContentEl.offsetHeight + marginTop + marginBottom;
      } else {
        // For footer or header fallback
        newHeight = Math.max(
          iframeDoc.body.scrollHeight,
          iframeDoc.body.offsetHeight,
          iframeDoc.documentElement.clientHeight,
          iframeDoc.documentElement.scrollHeight,
          iframeDoc.documentElement.offsetHeight
        );
      }
      newHeight = Math.max(
        newHeight,
        iframeElement.id === "header-iframe" ? 50 : 150
      ); // Min heights
      iframeElement.style.height = newHeight + "px";

      const currentTheme = localStorage.getItem("theme") || "dark";
      iframeElement.contentWindow.postMessage(
        { type: "themeChange", theme: currentTheme },
        "*"
      );

      if (iframeElement.id === "header-iframe" && pageContentWrapper) {
        pageContentWrapper.style.paddingTop = newHeight + "px";
      }
    } catch (e) {
      console.error(
        "Error in handleIframeLoad (attemptLoad) for " + iframeElement.id + ":",
        e
      );
      if (iframeElement.id === "header-iframe" && pageContentWrapper) {
        iframeElement.style.height = "70px";
        pageContentWrapper.style.paddingTop = "70px";
      } else if (iframeElement.id === "footer-iframe") {
        iframeElement.style.height = "300px";
      }
    }
  };
  attemptLoad();
};

// Attach onload handlers early
if (headerIframeEl)
  headerIframeEl.onload = () => window.handleIframeLoad(headerIframeEl);
if (footerIframeEl)
  footerIframeEl.onload = () => window.handleIframeLoad(footerIframeEl);

window.addEventListener("message", (event) => {
  // SECURITY: Validate event.origin in production!
  // if (event.origin !== window.location.origin && !event.origin.startsWith('file://')) return;
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case "themeChange": // From header's toggle
        // XÓA ĐOẠN XỬ LÝ NÚT CHUYỂN ĐỔI GIAO DIỆN VÀ HÀM applyThemeToCurrentPage
        syncThemeWithIframes(event.data.theme); // Inform other iframes (e.g., footer)
        break;
      case "iframeLoaded":
        const loadedIframe = document.getElementById(event.data.iframeId);
        if (loadedIframe) window.handleIframeLoad(loadedIframe);
        break;
      case "requestHeightUpdate":
        const iframeToUpdate = document.getElementById(event.data.iframeId);
        if (iframeToUpdate) window.handleIframeLoad(iframeToUpdate);
        break;
      case "scrollToTop":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "openModal": // From header's login button
        // This page needs to define the 'login-modal' and its opening logic
        // For now, we'll just alert, but you'd call your modal function.
        console.log(
          "Parent page received openModal request for:",
          event.data.modalId
        );
        hienThiThongBao(`Yêu cầu mở modal: ${event.data.modalId}`, "thanhCong");
        // Example: if (event.data.modalId === 'login-modal-on-parent') openThisPagesLoginModal();
        break;
      case "search": // From header's search
        console.log("Parent page received search term:", event.data.term);
        hienThiThongBao(`Tìm kiếm: ${event.data.term}`, "thanhCong");
        // Implement search result display or navigation on this page
        break;
    }
  }
});

// --- Your Existing Achievements Page JS ---

// Achievements page script
class AchievementsPage {
  constructor() {
    this.baseUrl = 'http://localhost:8080/api';
    this.userId = null;
    this.achievements = [];
    this.currentFilter = 'all';
    this.currentAchievement = null;
  }

  // Khởi tạo
  init() {
    this.userId = this.getCurrentUserId();
    if (this.userId) {
      this.loadAchievements();
      this.setupEventListeners();
    } else {
      this.showLoginMessage();
    }
  }

  // Lấy user ID từ localStorage
  getCurrentUserId() {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.id;
      } catch (e) {
        console.error('Error parsing userInfo:', e);
      }
    }
    return localStorage.getItem('userId');
  }

  // Hiển thị thông báo đăng nhập
  showLoginMessage() {
    const grid = document.getElementById('achievementsGrid');
    if (grid) {
      grid.innerHTML = `
                <div class="login-message">
                    <h3>Vui lòng đăng nhập để xem thành tựu</h3>
                    <a href="../login_register/login.html" class="login-btn">Đăng nhập ngay</a>
                </div>
            `;
    }
  }
  // Tải danh sách thành tựu
  async loadAchievements() {
    try {
      // Use our new API function
      const result = await getUserAchievements();
      
      if (result.success && result.data) {
        this.achievements = result.data;
        this.renderAchievements();
        this.updateStats();
      } else {
        console.error('Failed to load achievements:', result.error);
        this.showError('Không thể tải thành tựu. Vui lòng đăng nhập hoặc thử lại.');
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      this.showError('Lỗi kết nối. Vui lòng kiểm tra internet.');
    }
  }

  // Hiển thị lỗi
  showError(message) {
    const grid = document.getElementById('achievementsGrid');
    if (grid) {
      grid.innerHTML = `
                <div class="error-message">
                    <h3>❌ ${message}</h3>
                    <button onclick="location.reload()" class="retry-btn">Thử lại</button>
                </div>
            `;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Filter tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderAchievements();
      });
    });

    // Close modal when clicking outside
    const modal = document.getElementById('achievementModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.id === 'achievementModal') {
          this.closeModal();
        }
      });
    }
  }

  // Render thành tựu
  renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    let filteredAchievements = this.achievements;

    // Apply filter
    switch (this.currentFilter) {
      case 'completed':
        filteredAchievements = this.achievements.filter(a => a.completed);
        break;
      case 'in-progress':
        filteredAchievements = this.achievements.filter(a => !a.completed && a.progressPercent > 0);
        break;
      case 'locked':
        filteredAchievements = this.achievements.filter(a => !a.completed && a.progressPercent === 0);
        break;
    }

    if (filteredAchievements.length === 0) {
      grid.innerHTML = `
                <div class="no-achievements">
                    <h3>Không có thành tựu nào</h3>
                    <p>Hãy tiếp tục xem phim để mở khóa thành tựu!</p>
                </div>
            `;
      return;
    }

    grid.innerHTML = filteredAchievements.map(achievement => {
      const progressPercent = achievement.progressPercent || 0;
      const current = achievement.current || 0;
      const target = achievement.target || 1;
      const icon = achievement.icon || '🏆';

      let cardClass = 'achievement-card';
      let badgeText = '';

      if (achievement.completed) {
        cardClass += ' completed';
        badgeText = '✅ Hoàn thành';
      } else if (progressPercent > 0) {
        cardClass += ' in-progress';
        badgeText = `${progressPercent}% hoàn thành`;
      } else {
        cardClass += ' locked';
        badgeText = '🔒 Chưa bắt đầu';
      }

      return `
                <div class="${cardClass}" onclick="achievementsPage.openModal(${achievement.id})">
                    <div class="achievement-icon">${icon}</div>
                    <h3 class="achievement-title">${achievement.name}</h3>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-progress">
                        <span>${current}/${target}</span>
                        <span>${progressPercent}%</span>
                    </div>
                    <div class="achievement-badge">${badgeText}</div>
                </div>
            `;
    }).join('');
  }

  // Cập nhật thống kê
  updateStats() {
    const completed = this.achievements.filter(a => a.completed).length;
    const total = this.achievements.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const completedCountEl = document.getElementById('completedCount');
    const totalCountEl = document.getElementById('totalCount');
    const progressPercentEl = document.getElementById('progressPercent');

    if (completedCountEl) completedCountEl.textContent = completed;
    if (totalCountEl) totalCountEl.textContent = total;
    if (progressPercentEl) progressPercentEl.textContent = progressPercent + '%';
  }

  // Mở modal chi tiết thành tựu
  openModal(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    this.currentAchievement = achievement;

    // Populate modal data
    document.getElementById('modalTitle').textContent = 'Chi tiết thành tựu';
    document.getElementById('modalIcon').textContent = achievement.icon || '🏆';
    document.getElementById('modalName').textContent = achievement.name;
    document.getElementById('modalDescription').textContent = achievement.description;

    const progressPercent = achievement.progressPercent || 0;
    const current = achievement.current || 0;
    const target = achievement.target || 1;

    document.getElementById('modalProgress').style.width = progressPercent + '%';
    document.getElementById('modalProgressText').textContent = `${current}/${target}`;

    // Status
    const statusEl = document.getElementById('modalStatus');
    if (achievement.completed) {
      statusEl.textContent = '🎉 Đã hoàn thành';
      statusEl.className = 'detail-status completed';
    } else if (progressPercent > 0) {
      statusEl.textContent = `🔄 Đang thực hiện (${progressPercent}%)`;
      statusEl.className = 'detail-status in-progress';
    } else {
      statusEl.textContent = '🔒 Chưa bắt đầu';
      statusEl.className = 'detail-status locked';
    }

    // Tips
    this.populateTips(achievement);

    // Show modal
    document.getElementById('achievementModal').style.display = 'block';
  }

  // Điền tips cho thành tựu
  populateTips(achievement) {
    const tipsList = document.getElementById('tipsList');
    const tips = this.getAchievementTips(achievement.id);

    if (tips.length > 0) {
      tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
      document.querySelector('.achievement-tips').style.display = 'block';
    } else {
      document.querySelector('.achievement-tips').style.display = 'none';
    }
  }

  // Lấy tips cho từng thành tựu
  getAchievementTips(achievementId) {
    const tipsMap = {
      1: ['Chúc mừng! Bạn đã hoàn thành bước đầu tiên.'],
      2: [
        'Xem đủ 10 bộ phim bất kỳ để mở khóa thành tựu này',
        'Có thể là phim lẻ hoặc phim bộ',
        'Xem hết ít nhất 80% thời lượng phim mới được tính'
      ],
      3: [
        'Viết đánh giá đầu tiên cho bất kỳ bộ phim nào',
        'Đánh giá phải có ít nhất 50 ký tự',
        'Chia sẻ cảm nhận thật lòng về bộ phim'
      ],
      4: [
        'Xem phim thường xuyên trong 1 tháng',
        'Ít nhất 15 lần xem trong 30 ngày',
        'Bao gồm cả xem lại phim cũ'
      ],
      5: ['Chúc mừng! Bạn đã hoàn thành khi đăng nhập lần đầu.'],
      6: [
        'Xem phim mỗi ngày trong 7 ngày liên tiếp',
        'Ít nhất 1 phim mỗi ngày',
        'Không được bỏ lỡ ngày nào'
      ],
      7: [
        'Xem hết tất cả tập của một bộ phim nhiều tập',
        'Phim phải có ít nhất 3 tập',
        'Xem hết 100% thời lượng mỗi tập'
      ],
      8: [
        'Chia sẻ bộ phim yêu thích lên mạng xã hội',
        'Sử dụng nút chia sẻ trên trang phim',
        'Có thể chia sẻ lên Facebook, Twitter hoặc Zalo'
      ],
      9: [
        'Viết những đánh giá chất lượng để nhận like',
        'Đánh giá chi tiết, hữu ích',
        'Tương tác với đánh giá của người khác'
      ],
      10: [
        'Mời bạn bè tham gia bằng link giới thiệu',
        'Bạn bè phải đăng ký thành công',
        'Có thể tìm link giới thiệu trong trang cá nhân'
      ]
    };

    return tipsMap[achievementId] || [];
  }

  // Đóng modal
  closeModal() {
    document.getElementById('achievementModal').style.display = 'none';
    this.currentAchievement = null;
  }
}

// Close modal function for global use
function closeModal() {
  if (window.achievementsPage) {
    window.achievementsPage.closeModal();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  window.achievementsPage = new AchievementsPage();
  window.achievementsPage.init();
});
document.addEventListener("DOMContentLoaded", () => {
  // Hàm hiển thị thông báo tùy chỉnh (already defined in your script)
  function hienThiThongBao(noiDung, loai = "thanhCong") {
    const thongBao = document.createElement("div");
    thongBao.className = `thong-bao thong-bao-${loai}`;
    thongBao.textContent = noiDung;
    document.body.appendChild(thongBao);
    requestAnimationFrame(() => {
      thongBao.classList.add("show");
    }); // For CSS transition
    setTimeout(() => {
      thongBao.classList.remove("show");
      setTimeout(() => thongBao.remove(), 300);
    }, 3000);
  }

  const quanSat = new IntersectionObserver(
    (muc) => {
      muc.forEach((m) => {
        if (m.isIntersecting) {
          m.target.classList.add("visible");
          quanSat.unobserve(m.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll(".achievement-card, .leaderboard-item, .reward-card")
    .forEach((the) => {
      quanSat.observe(the);
    });

  document.querySelectorAll(".claim-btn").forEach((nut) => {
    nut.addEventListener("click", () => {
      const tenThanhTuu = nut.dataset.achievement;
      if (!nut.disabled) {
        hienThiThongBao(
          `Yêu cầu phần thưởng cho "${tenThanhTuu}" thành công!`,
          "thanhCong"
        );
        // Example: If claim opens a modal that is defined on THIS page:
        // if (document.getElementById('reward-claim-modal')) openModalOnThisPage('reward-claim-modal');
      } else {
        hienThiThongBao(
          `Vui lòng hoàn thành "${tenThanhTuu}" trước khi yêu cầu!`,
          "canhBao"
        );
      }
    });
  });

  document.querySelectorAll(".view-profile-btn").forEach((nut) => {
    nut.addEventListener("click", () => {
      const tenNguoiDung = nut.dataset.user;
      hienThiThongBao(`Đang xem hồ sơ của "${tenNguoiDung}"`, "thanhCong");
      // Example: Navigate to user profile page
      // window.location.href = `/profile/${tenNguoiDung}`;
    });
  });

  document.querySelectorAll(".unlock-btn").forEach((nut) => {
    nut.addEventListener("click", () => {
      const tenPhanThuong = nut.dataset.reward;
      hienThiThongBao(
        `Xem chi tiết phần thưởng "${tenPhanThuong}"`,
        "thanhCong"
      );
    });
  });

  // Fallback for iframe height adjustment if onload events were missed or fired too early
  setTimeout(() => {
    if (
      headerIframeEl &&
      (!headerIframeEl.style.height ||
        headerIframeEl.style.height === "0px" ||
        parseInt(headerIframeEl.style.height) < 50)
    ) {
      // console.log("Retrying header iframe height adjustment post-DOMContentLoad for achievements page");
      window.handleIframeLoad(headerIframeEl);
    }
    if (
      footerIframeEl &&
      (!footerIframeEl.style.height ||
        footerIframeEl.style.height === "0px" ||
        parseInt(footerIframeEl.style.height) < 150)
    ) {
      // console.log("Retrying footer iframe height adjustment post-DOMContentLoad for achievements page");
      window.handleIframeLoad(footerIframeEl);
    }
  }, 600); // Increased delay for this fallback
}); // End DOMContentLoaded
