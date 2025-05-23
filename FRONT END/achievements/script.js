// achievements-page/script.js

// --- Iframe and Theme Sync Logic (MUST BE AT THE TOP or accessible globally) ---
const mainPageBody = document.body;
const headerIframeEl = document.getElementById("header-iframe");
const footerIframeEl = document.getElementById("footer-iframe");
const pageContentWrapper = document.querySelector(".page-content"); // Assumes your <main> has this class

function applyThemeToCurrentPage(themeName) {
  mainPageBody.classList.remove("light-mode", "dark-mode");
  mainPageBody.classList.add(
    themeName === "light" ? "light-mode" : "dark-mode"
  );
  localStorage.setItem("theme", themeName); // Use 'theme' to match header/footer.html
}

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
        applyThemeToCurrentPage(event.data.theme);
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

// Apply initial theme to this page
const initialParentTheme = localStorage.getItem("theme") || "dark";
applyThemeToCurrentPage(initialParentTheme);
// Initial sync is largely handled by iframe onload, but this ensures if parent loads first.
// syncThemeWithIframes(initialParentTheme);

// --- Your Existing Achievements Page JS ---
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

  // Theme toggle button on THIS page (if you had one, ID 'theme-toggle')
  // Your header iframe now handles the primary theme toggle.
  // This section can be removed if the toggle is exclusively in header.html
  /*
    const nutChuyenDoiGiaoDienThisPage = document.getElementById('theme-toggle');
    if (nutChuyenDoiGiaoDienThisPage) {
        // Initial state based on localStorage
        const currentTheme = localStorage.getItem('theme') || 'dark';
        nutChuyenDoiGiaoDienThisPage.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

        nutChuyenDoiGiaoDienThisPage.addEventListener('click', () => {
            const newTheme = mainPageBody.classList.contains('light-mode') ? 'dark' : 'light';
            applyThemeToCurrentPage(newTheme); // Apply to this page
            syncThemeWithIframes(newTheme);    // Tell iframes
        });
    }
    */

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
