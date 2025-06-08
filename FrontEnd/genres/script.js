// categories-page/script.js

// --- Iframe and Theme Sync Logic ---
const mainPageBody = document.body;
const headerIframeEl = document.getElementById("header-iframe");
const footerIframeEl = document.getElementById("footer-iframe");
const pageContentWrapper = document.querySelector(".page-content");

function applyThemeToCurrentPage(themeName) {
  mainPageBody.classList.remove("light-mode", "dark-mode");
  mainPageBody.classList.add(
    themeName === "light" ? "light-mode" : "dark-mode"
  );
  // localStorage.setItem('giaoDien', themeName); // Header handles its own localStorage for theme
  // Parent page also needs to store it for consistency on reload
  localStorage.setItem("theme", themeName); // Using 'theme' to match header/footer.html
}

function syncThemeWithIframes(themeName) {
  const themeMessage = { type: "themeChange", theme: themeName };
  // console.log("Parent sending theme to iframes:", themeMessage);
  if (headerIframeEl && headerIframeEl.contentWindow) {
    try {
      headerIframeEl.contentWindow.postMessage(themeMessage, "*");
    } catch (e) {
      console.warn("Error posting to header iframe:", e);
    }
  }
  if (footerIframeEl && footerIframeEl.contentWindow) {
    try {
      footerIframeEl.contentWindow.postMessage(themeMessage, "*");
    } catch (e) {
      console.warn("Error posting to footer iframe:", e);
    }
  }
}

window.handleIframeLoad = function (iframeElement) {
  if (!iframeElement) return;
  // console.log("handleIframeLoad called for:", iframeElement.id);

  const attemptLoad = () => {
    if (
      !iframeElement.contentWindow ||
      !iframeElement.contentWindow.document ||
      !iframeElement.contentWindow.document.body
    ) {
      // console.warn("iframe contentWindow or body not ready for", iframeElement.id, ". Retrying...");
      setTimeout(attemptLoad, 150); // Increased retry delay
      return;
    }
    try {
      const iframeDoc = iframeElement.contentWindow.document;
      const height = Math.max(
        iframeDoc.body.scrollHeight,
        iframeDoc.body.offsetHeight,
        iframeDoc.documentElement.clientHeight,
        iframeDoc.documentElement.scrollHeight,
        iframeDoc.documentElement.offsetHeight
      );
      iframeElement.style.height = (height > 20 ? height + 2 : 70) + "px"; // Min height + small buffer

      const currentTheme = localStorage.getItem("theme") || "dark"; // Use 'theme' consistently
      iframeElement.contentWindow.postMessage(
        { type: "themeChange", theme: currentTheme },
        "*"
      );

      if (iframeElement.id === "header-iframe" && pageContentWrapper) {
        const headerActualHeight = iframeDoc.body.offsetHeight; // Get height after content is there
        pageContentWrapper.style.paddingTop =
          (headerActualHeight > 20 ? headerActualHeight : 70) + "px";
        // console.log("Header padding set to:", pageContentWrapper.style.paddingTop);
      }
    } catch (e) {
      console.error(
        "Error in handleIframeLoad for " + iframeElement.id + ":",
        e
      );
      if (iframeElement.id === "header-iframe" && pageContentWrapper) {
        pageContentWrapper.style.paddingTop = "70px"; // Fallback
      }
    }
  };
  attemptLoad(); // Start the attempt
};

if (headerIframeEl)
  headerIframeEl.onload = () => window.handleIframeLoad(headerIframeEl);
if (footerIframeEl)
  footerIframeEl.onload = () => window.handleIframeLoad(footerIframeEl);

window.addEventListener("message", (event) => {
  // IMPORTANT: ALWAYS VALIDATE event.origin in a production environment!
  // For local testing with file://, this check might be too restrictive.
  // if (event.origin !== window.location.origin && !event.origin.startsWith('file://')) {
  //     console.warn("Blocked message from origin:", event.origin);
  //     return;
  // }

  if (event.data && event.data.type) {
    // console.log("Parent received message:", event.data);
    switch (event.data.type) {
      case "themeChange": // Message from header's toggle to sync parent
        // The header iframe has already changed its theme and updated localStorage.
        // The parent page needs to reflect this change.
        applyThemeToCurrentPage(event.data.theme);
        // Sync with footer (header already knows, it sent the message)
        if (footerIframeEl && footerIframeEl.contentWindow) {
          try {
            footerIframeEl.contentWindow.postMessage(
              { type: "themeChange", theme: event.data.theme },
              "*"
            );
          } catch (e) {
            console.warn("Error posting theme to footer from parent:", e);
          }
        }
        break;
      case "iframeLoaded": // If iframe sends this after its internal setup
        const loadedIframe = document.getElementById(event.data.iframeId);
        if (loadedIframe) window.handleIframeLoad(loadedIframe);
        break;
      case "requestHeightUpdate": // If iframe content changes dynamically
        const iframeToUpdate = document.getElementById(event.data.iframeId);
        if (iframeToUpdate) window.handleIframeLoad(iframeToUpdate);
        break;
      case "scrollToTop": // From footer's back-to-top button
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "openModal": // Message from header to open a modal on this page
        // You would need to have modal HTML on THIS page if header triggers it.
        // For example, a login modal.
        // console.log("Parent received openModal request for:", event.data.modalId);
        // Example: if(document.getElementById(event.data.modalId)) openMainPageModal(event.data.modalId);
        break;
      case "search": // Message from header's search bar
        const searchInputOnPage = document.getElementById("search-input");
        if (searchInputOnPage && event.data.term) {
          searchInputOnPage.value = event.data.term;
          // Trigger the search/filter function on this page
          filterAndDisplayAnime();
          console.log("Parent received search term:", event.data.term);
        }
        break;
    }
  }
});

// Initial theme application for this page from its own localStorage
const initialParentTheme = localStorage.getItem("theme") || "dark";
applyThemeToCurrentPage(initialParentTheme);

document.addEventListener("DOMContentLoaded", () => {
  // --- Page Specific JS (Categories Page) ---
  const ANIME_DATA_SOURCE = [
    /* ... your anime data ... (same as before) */
    {
      id: "demon-slayer",
      ten: "Demon Slayer",
      theLoai: ["hành động", "fantasy"],
      soTap: "S1: 26, S2: 18",
      nam: 2019,
      trangThai: "completed",
      danhGia: 4.8,
      hinhAnh:
        "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=Demon+Slayer",
    },
    {
      id: "attack-on-titan",
      ten: "Attack on Titan",
      theLoai: ["hành động", "drama"],
      soTap: "87 tập",
      nam: 2013,
      trangThai: "completed",
      danhGia: 4.9,
      hinhAnh: "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=AoT",
    },
    {
      id: "jujutsu-kaisen",
      ten: "Jujutsu Kaisen",
      theLoai: ["hành động", "siêu nhiên"],
      soTap: "S1: 24, S2: 23",
      nam: 2020,
      trangThai: "ongoing",
      danhGia: 4.7,
      hinhAnh: "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=JJK",
    },
    {
      id: "one-piece",
      ten: "One Piece",
      theLoai: ["phiêu lưu", "hành động", "fantasy"],
      soTap: "1000+ tập",
      nam: 1999,
      trangThai: "ongoing",
      danhGia: 4.9,
      hinhAnh:
        "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=One+Piece",
    },
    {
      id: "hunter-x-hunter",
      ten: "Hunter x Hunter (2011)",
      theLoai: ["phiêu lưu", "hành động"],
      soTap: "148 tập",
      nam: 2011,
      trangThai: "completed",
      danhGia: 4.8,
      hinhAnh: "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=HxH",
    },
    {
      id: "your-name",
      ten: "Your Name",
      theLoai: ["tình cảm", "drama", "siêu nhiên"],
      soTap: "Movie",
      nam: 2016,
      trangThai: "completed",
      danhGia: 4.9,
      hinhAnh:
        "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=Your+Name",
    },
    {
      id: "horimiya",
      ten: "Horimiya",
      theLoai: ["tình cảm", "học đường"],
      soTap: "13 tập",
      nam: 2021,
      trangThai: "completed",
      danhGia: 4.6,
      hinhAnh:
        "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=Horimiya",
    },
    {
      id: "spy-x-family",
      ten: "Spy x Family",
      theLoai: ["hài hước", "hành động", "gia đình"],
      soTap: "S1: 25, S2: 12",
      nam: 2022,
      trangThai: "ongoing",
      danhGia: 4.7,
      hinhAnh:
        "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=Spy+x+Family",
    },
    {
      id: "gintama",
      ten: "Gintama",
      theLoai: ["hài hước", "hành động", "sci-fi"],
      soTap: "367+ tập",
      nam: 2006,
      trangThai: "completed",
      danhGia: 4.9,
      hinhAnh: "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=Gintama",
    },
    {
      id: "re-zero",
      ten: "Re:Zero",
      theLoai: ["fantasy", "isekai", "drama"],
      soTap: "50 tập",
      nam: 2016,
      trangThai: "completed",
      danhGia: 4.6,
      hinhAnh: "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=ReZero",
    },
    {
      id: "mushoku-tensei",
      ten: "Mushoku Tensei",
      theLoai: ["fantasy", "isekai", "phiêu lưu"],
      soTap: "S1: 23, S2: 12",
      nam: 2021,
      trangThai: "ongoing",
      danhGia: 4.7,
      hinhAnh: "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=Mushoku",
    },
    {
      id: "konosuba",
      ten: "Konosuba",
      theLoai: ["hài hước", "isekai", "fantasy"],
      soTap: "20t + Movie",
      nam: 2016,
      trangThai: "completed",
      danhGia: 4.5,
      hinhAnh:
        "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=Konosuba",
    },
    {
      id: "overlord",
      ten: "Overlord",
      theLoai: ["fantasy", "isekai", "hành động"],
      soTap: "S1-S4: 52t",
      nam: 2015,
      trangThai: "completed",
      danhGia: 4.4,
      hinhAnh:
        "https://via.placeholder.com/220x250/1e1e1e/ffffff?text=Overlord",
    },
  ];

  let allAnimeMasterList = [...ANIME_DATA_SOURCE];
  let currentlyDisplayedAnime = [...allAnimeMasterList];

  const ITEMS_PER_PAGE_DISPLAY = 12;
  let currentDisplayPage = 1;

  const animeCardTemplate = document.getElementById("anime-card-template");
  const animeGridPlaceholder = document.getElementById(
    "anime-grid-placeholder"
  );
  const noResultsMessageEl = document.getElementById("no-results");
  let globalFavoritesList = JSON.parse(
    localStorage.getItem("danhSachYeuThich") || "[]"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );

  function createAnimeCardElement(anime) {
    if (!animeCardTemplate) {
      console.error("Template not found!");
      return null;
    }
    const cardClone = animeCardTemplate.content
      .cloneNode(true)
      .querySelector(".category-card");

    cardClone.dataset.id = anime.id;
    cardClone.querySelector(".category-card-img").src = anime.hinhAnh;
    cardClone.querySelector(".category-card-img").alt = anime.ten;
    cardClone.querySelector(".category-name").textContent = anime.ten;
    cardClone.querySelector(".category-count-display").textContent =
      anime.soTap;

    const ratingValue = parseFloat(anime.danhGia);
    const starsTotal = 5;
    let starsHTML = "";
    for (let i = 1; i <= starsTotal; i++) {
      if (i <= ratingValue) starsHTML += "★";
      else if (i - 0.5 <= ratingValue) starsHTML += "✯";
      else starsHTML += "☆";
    }
    cardClone.querySelector(".stars-display").innerHTML = starsHTML;
    cardClone.querySelector(".rating-value").textContent =
      anime.danhGia || "N/A";

    const favBtn = cardClone.querySelector(".favorite-btn");
    if (globalFavoritesList.includes(anime.ten)) {
      favBtn.classList.add("active");
    }
    // Event listeners will be added when cards are appended to the DOM or via delegation

    observer.observe(cardClone);
    return cardClone;
  }

  function renderAnimeGrid(animeListToPaginate) {
    animeGridPlaceholder.innerHTML = "";
    if (!animeListToPaginate || animeListToPaginate.length === 0) {
      if (noResultsMessageEl) noResultsMessageEl.style.display = "block";
      updatePaginationControlsUI(0, 1, 0);
      return;
    }
    if (noResultsMessageEl) noResultsMessageEl.style.display = "none";

    const startIndex = (currentDisplayPage - 1) * ITEMS_PER_PAGE_DISPLAY;
    const endIndex = startIndex + ITEMS_PER_PAGE_DISPLAY;
    const paginatedItems = animeListToPaginate.slice(startIndex, endIndex);

    const sectionsData = {};
    paginatedItems.forEach((anime) => {
      (anime.theLoai || ["unknown"]).forEach((genre) => {
        if (!sectionsData[genre]) sectionsData[genre] = [];
        sectionsData[genre].push(anime);
      });
    });

    const sortedGenreKeys = Object.keys(sectionsData).sort();

    sortedGenreKeys.forEach((genreKey) => {
      let sectionEl = animeGridPlaceholder.querySelector(
        `.category-section[data-main-genre="${genreKey}"]`
      );
      if (!sectionEl) {
        sectionEl = document.createElement("div");
        sectionEl.className = "category-section";
        sectionEl.dataset.mainGenre = genreKey;
        const sectionTitle =
          genreKey.charAt(0).toUpperCase() + genreKey.slice(1);
        sectionEl.innerHTML = `
                    <div class="category-header">
                        <h2>${sectionTitle}</h2>
                        <a href="#${genreKey.replace(
                          /\s+/g,
                          "-"
                        )}" class="view-all-link">Xem tất cả <span>▶</span></a>
                    </div>
                    <div class="category-grid"></div>`;
        animeGridPlaceholder.appendChild(sectionEl);
      } else {
        // Clear existing grid if section already exists
        sectionEl.querySelector(".category-grid").innerHTML = "";
      }

      const gridEl = sectionEl.querySelector(".category-grid");
      sectionsData[genreKey].forEach((anime) => {
        const cardEl = createAnimeCardElement(anime);
        if (cardEl) gridEl.appendChild(cardEl);
      });
    });
    updatePaginationControlsUI(
      animeListToPaginate.length,
      currentDisplayPage,
      ITEMS_PER_PAGE_DISPLAY
    );
  }

  function updatePaginationControlsUI(
    totalItems,
    currentPageNum,
    itemsPerPage
  ) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageInfoEl = document.getElementById("page-info");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");

    if (pageInfoEl)
      pageInfoEl.textContent = `Trang ${currentPageNum} / ${
        totalPages > 0 ? totalPages : 1
      }`;
    if (prevPageBtn) prevPageBtn.disabled = currentPageNum === 1;
    if (nextPageBtn)
      nextPageBtn.disabled = currentPageNum === totalPages || totalPages === 0;
  }

  function filterAndDisplayAnime() {
    const sortBy = document.getElementById("sort-by")?.value || "popular";
    const filterYear = document.getElementById("year-filter")?.value || "all";
    const filterStatus =
      document.getElementById("status-filter")?.value || "all";
    const selectedGenres = Array.from(
      document.querySelectorAll(".filter-tags .tag-btn.active")
    )
      .map((btn) => btn.dataset.genre)
      .filter((genre) => genre !== "all");
    const searchTerm =
      document.getElementById("search-input")?.value.trim().toLowerCase() || "";

    let filteredResults = allAnimeMasterList.filter((anime) => {
      let matchesYear = true;
      if (filterYear !== "all") {
        if (filterYear === "older") matchesYear = anime.nam <= 2021;
        else matchesYear = anime.nam.toString() === filterYear;
      }
      const matchesStatus =
        filterStatus === "all" || anime.trangThai === filterStatus;
      const animeGenres = Array.isArray(anime.theLoai)
        ? anime.theLoai.map((g) => g.toLowerCase())
        : [];
      const matchesGenre =
        selectedGenres.length === 0 ||
        selectedGenres.some((sg) => animeGenres.includes(sg.toLowerCase()));
      const matchesSearch =
        searchTerm === "" || anime.ten.toLowerCase().includes(searchTerm);
      return matchesYear && matchesStatus && matchesGenre && matchesSearch;
    });

    if (sortBy === "a-z")
      filteredResults.sort((a, b) => a.ten.localeCompare(b.ten));
    else if (sortBy === "newest") filteredResults.sort((a, b) => b.nam - a.nam);
    else if (sortBy === "highest-rated")
      filteredResults.sort(
        (a, b) => parseFloat(b.danhGia) - parseFloat(a.danhGia)
      );

    currentlyDisplayedAnime = filteredResults;
    currentDisplayPage = 1;
    renderAnimeGrid(currentlyDisplayedAnime); // Initial render of the first page of filtered results
  }

  function handleFavoriteClick(event, animeName, buttonElement) {
    event.stopPropagation();
    buttonElement.classList.toggle("active");
    const isFavorited = buttonElement.classList.contains("active");
    if (isFavorited) {
      if (!globalFavoritesList.includes(animeName))
        globalFavoritesList.push(animeName);
      hienThiThongBao(`Đã thêm "${animeName}" vào yêu thích!`, "thanhCong");
    } else {
      globalFavoritesList = globalFavoritesList.filter(
        (name) => name !== animeName
      );
      hienThiThongBao(`Đã xóa "${animeName}" khỏi yêu thích!`, "canhBao");
    }
    localStorage.setItem(
      "danhSachYeuThich",
      JSON.stringify(globalFavoritesList)
    );
  }
  function handleCardClick(event, animeName) {
    const card = event.target.closest(".category-card");
    // Ensure click is not on fav button or rating
    if (
      event.target.closest(".favorite-btn") ||
      event.target.closest(".rating")
    )
      return;
    if (card) {
      console.log(`Card clicked: ${animeName}`);
      hienThiThongBao(`Xem chi tiết: ${animeName}`);
      // Example: window.location.href = `/anime-details/${anime.id}`;
    }
  }

  // Event Delegation for dynamically created cards
  animeGridPlaceholder.addEventListener("click", function (event) {
    const favButton = event.target.closest(".favorite-btn");
    const cardElement = event.target.closest(".category-card");

    if (favButton && cardElement) {
      const animeName =
        cardElement.querySelector(".category-name")?.textContent;
      if (animeName) handleFavoriteClick(event, animeName, favButton);
    } else if (cardElement) {
      const animeName =
        cardElement.querySelector(".category-name")?.textContent;
      if (animeName) handleCardClick(event, animeName);
    }
  });

  document
    .querySelectorAll("#sort-by, #year-filter, #status-filter")
    .forEach((selectEl) => {
      selectEl.addEventListener("change", filterAndDisplayAnime);
    });
  document.querySelectorAll(".filter-tags .tag-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (this.dataset.genre === "all") {
        document
          .querySelectorAll(".filter-tags .tag-btn.active")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
      } else {
        document
          .querySelector('.filter-tags .tag-btn[data-genre="all"]')
          ?.classList.remove("active");
        this.classList.toggle("active");
      }
      if (
        document.querySelectorAll(
          '.filter-tags .tag-btn.active:not([data-genre="all"])'
        ).length === 0
      ) {
        document
          .querySelector('.filter-tags .tag-btn[data-genre="all"]')
          ?.classList.add("active");
      }
      filterAndDisplayAnime();
    });
  });

  const searchInputEl = document.getElementById("search-input");
  const searchButtonEl = document.getElementById("search-button");
  let searchSuggestionsEl = document.querySelector(".goi-y-tim-kiem");
  if (searchInputEl && !searchSuggestionsEl) {
    searchSuggestionsEl = document.createElement("div");
    searchSuggestionsEl.className = "goi-y-tim-kiem";
    searchInputEl.parentElement.style.position = "relative";
    searchInputEl.parentElement.appendChild(searchSuggestionsEl);
  }
  function updateSearchSuggestions(keyword) {
    if (!searchSuggestionsEl || !keyword) {
      if (searchSuggestionsEl) searchSuggestionsEl.style.display = "none";
      return;
    }
    const suggestions = allAnimeMasterList
      .filter((a) => a.ten.toLowerCase().includes(keyword.toLowerCase()))
      .slice(0, 5);
    searchSuggestionsEl.innerHTML = "";
    suggestions.forEach((anime) => {
      const itemEl = document.createElement("div");
      itemEl.textContent = anime.ten;
      itemEl.addEventListener("click", () => {
        searchInputEl.value = anime.ten;
        searchSuggestionsEl.style.display = "none";
        filterAndDisplayAnime();
      });
      searchSuggestionsEl.appendChild(itemEl);
    });
    searchSuggestionsEl.style.display =
      suggestions.length > 0 ? "block" : "none";
  }
  if (searchInputEl) {
    searchInputEl.addEventListener("input", () =>
      updateSearchSuggestions(searchInputEl.value.trim())
    );
    searchInputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (searchSuggestionsEl) searchSuggestionsEl.style.display = "none";
        filterAndDisplayAnime();
      }
    });
  }
  if (searchButtonEl)
    searchButtonEl.addEventListener("click", () => {
      if (searchSuggestionsEl) searchSuggestionsEl.style.display = "none";
      filterAndDisplayAnime();
    });
  document.addEventListener("click", (e) => {
    if (
      searchSuggestionsEl &&
      searchInputEl &&
      !searchInputEl.contains(e.target) &&
      !searchSuggestionsEl.contains(e.target)
    )
      searchSuggestionsEl.style.display = "none";
  });

  const prevPageBtnEl = document.getElementById("prev-page");
  const nextPageBtnEl = document.getElementById("next-page");
  if (prevPageBtnEl)
    prevPageBtnEl.addEventListener("click", () => {
      if (currentDisplayPage > 1) {
        currentDisplayPage--;
        renderAnimeGrid(currentlyDisplayedAnime); // Re-render with new page slice
        if (pageContentWrapper)
          window.scrollTo({
            top:
              document.querySelector(".categories-main").offsetTop -
              (parseInt(pageContentWrapper.style.paddingTop) || 70),
            behavior: "smooth",
          });
      }
    });
  if (nextPageBtnEl)
    nextPageBtnEl.addEventListener("click", () => {
      const totalItems = currentlyDisplayedAnime.length;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE_DISPLAY);
      if (currentDisplayPage < totalPages) {
        currentDisplayPage++;
        renderAnimeGrid(currentlyDisplayedAnime);
        if (pageContentWrapper)
          window.scrollTo({
            top:
              document.querySelector(".categories-main").offsetTop -
              (parseInt(pageContentWrapper.style.paddingTop) || 70),
            behavior: "smooth",
          });
      }
    });

  const trendingSliderEl = document.querySelector(".trending-slider");
  const prevTrendingBtnEl = document.getElementById("prev-trending");
  const nextTrendingBtnEl = document.getElementById("next-trending");
  if (trendingSliderEl && prevTrendingBtnEl && nextTrendingBtnEl) {
    const scrollAmount =
      (trendingSliderEl.querySelector(".trending-item")?.offsetWidth || 270) +
      20;
    prevTrendingBtnEl.addEventListener("click", () =>
      trendingSliderEl.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    );
    nextTrendingBtnEl.addEventListener("click", () =>
      trendingSliderEl.scrollBy({ left: scrollAmount, behavior: "smooth" })
    );
    function updateTrendingSliderControls() {
      if (!trendingSliderEl || !prevTrendingBtnEl || !nextTrendingBtnEl) return;
      prevTrendingBtnEl.disabled = trendingSliderEl.scrollLeft <= 5; // 5px buffer
      nextTrendingBtnEl.disabled =
        trendingSliderEl.scrollLeft >=
        trendingSliderEl.scrollWidth - trendingSliderEl.clientWidth - 5;
    }
    trendingSliderEl.addEventListener("scroll", updateTrendingSliderControls, {
      passive: true,
    });
    setTimeout(updateTrendingSliderControls, 250); // Initial check after layout
    window.addEventListener("resize", updateTrendingSliderControls); // Update on resize
  }

  document.querySelectorAll(".faq-question").forEach((questionBtn) => {
    questionBtn.addEventListener("click", () => {
      const answerEl = questionBtn.nextElementSibling;
      const iconEl = questionBtn.querySelector(".faq-icon");
      const isOpening = questionBtn.getAttribute("aria-expanded") === "false";
      questionBtn.setAttribute("aria-expanded", isOpening);
      if (iconEl) iconEl.textContent = isOpening ? "−" : "+";
      if (isOpening) {
        answerEl.style.display = "block";
        requestAnimationFrame(() => {
          answerEl.style.maxHeight = answerEl.scrollHeight + "px";
          answerEl.style.opacity = "1";
          answerEl.style.paddingBottom = "20px";
        });
      } else {
        answerEl.style.maxHeight = "0px";
        answerEl.style.opacity = "0";
        answerEl.style.paddingBottom = "0px";
      }
    });
  });

  document
    .querySelectorAll(".trending-item, .staff-pick-card, .faq-item")
    .forEach((el) => {
      observer.observe(el);
    });

  document.addEventListener("keydown", (e) => {
    const activeEl = document.activeElement;
    if (
      e.key === "/" &&
      activeEl &&
      activeEl.tagName !== "INPUT" &&
      activeEl.tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
      if (searchInputEl) searchInputEl.focus();
    }
    if (
      activeEl &&
      activeEl.tagName !== "INPUT" &&
      activeEl.tagName !== "TEXTAREA"
    ) {
      if (e.key === "ArrowRight" && nextPageBtnEl && !nextPageBtnEl.disabled)
        nextPageBtnEl.click();
      else if (
        e.key === "ArrowLeft" &&
        prevPageBtnEl &&
        !prevPageBtnEl.disabled
      )
        prevPageBtnEl.click();
    }
  });

  function hienThiThongBao(noiDung, loai = "thanhCong") {
    const thongBao = document.createElement("div");
    thongBao.className = `thong-bao thong-bao-${loai}`;
    thongBao.textContent = noiDung;
    document.body.appendChild(thongBao);
    requestAnimationFrame(() => {
      thongBao.classList.add("show");
    });
    setTimeout(() => {
      thongBao.classList.remove("show");
      setTimeout(() => thongBao.remove(), 300);
    }, 3000);
  }

  // Initial Render
  filterAndDisplayAnime();

  // Fallback for iframe height adjustment if onload didn't catch it due to timing
  setTimeout(() => {
    if (
      headerIframeEl &&
      (!headerIframeEl.style.height || headerIframeEl.style.height === "0px")
    ) {
      window.handleIframeLoad(headerIframeEl);
    }
    if (
      footerIframeEl &&
      (!footerIframeEl.style.height || footerIframeEl.style.height === "0px")
    ) {
      window.handleIframeLoad(footerIframeEl);
    }
  }, 700); // Slightly longer delay for this fallback
}); // End DOMContentLoaded
