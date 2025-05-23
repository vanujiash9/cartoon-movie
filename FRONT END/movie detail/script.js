// script.js
document.addEventListener('DOMContentLoaded', () => {
    const headerIframe = document.getElementById('header-iframe');
    const footerIframe = document.getElementById('footer-iframe');
    const body = document.body;

    // --- THEME MANAGEMENT ---
    const applyTheme = (themeName) => {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(themeName + '-mode');
        localStorage.setItem('theme', themeName);
        syncThemeWithIframes(themeName);
    };

    const syncThemeWithIframes = (themeName) => {
        const themeMessage = { type: 'themeChange', theme: themeName };
        if (headerIframe && headerIframe.contentWindow) {
            headerIframe.contentWindow.postMessage(themeMessage, '*');
        }
        if (footerIframe && footerIframe.contentWindow) {
            footerIframe.contentWindow.postMessage(themeMessage, '*');
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    applyTheme(savedTheme);


    // --- IFRAME MANAGEMENT ---
    const adjustIframeHeight = (iframeElement) => {
        if (!iframeElement || !iframeElement.contentWindow) return;
        try {
            const iframeBody = iframeElement.contentWindow.document.body;
            const iframeHtml = iframeElement.contentWindow.document.documentElement;
            const height = Math.max(
                iframeBody.scrollHeight, iframeBody.offsetHeight,
                iframeHtml.clientHeight, iframeHtml.scrollHeight, iframeHtml.offsetHeight
            );
            iframeElement.style.height = height + 'px';

            // Send theme to iframe upon load, as it might have missed the initial sync
            const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
            iframeElement.contentWindow.postMessage({ type: 'themeChange', theme: currentTheme }, '*');

        } catch (e) {
            console.warn("Could not adjust iframe height or sync theme for: " + iframeElement.id, e);
        }
    };
    
    // Make adjustIframeHeight globally accessible for iframe onload
    window.adjustIframeHeight = adjustIframeHeight;


    const adjustContentForFixedHeader = () => {
        if (headerIframe && headerIframe.contentWindow) {
            try {
                const headerHeight = headerIframe.contentWindow.document.body.offsetHeight;
                const movieHero = document.querySelector('.movie-detail-hero'); // Target specific element
                if (movieHero) {
                    movieHero.style.marginTop = headerHeight + 'px';
                } else { // Fallback for other pages if needed
                    body.style.paddingTop = headerHeight + 'px'; // Or use a class like .fixed-header-padding
                }
            } catch (e) {
                const fallbackHeight = '70px';
                const movieHero = document.querySelector('.movie-detail-hero');
                if (movieHero) movieHero.style.marginTop = fallbackHeight;
                else body.style.paddingTop = fallbackHeight;
                console.warn("Could not get header height for margin adjustment.", e);
            }
        }
    };

    if (headerIframe) {
        headerIframe.addEventListener('load', () => {
            adjustIframeHeight(headerIframe); // Ensure height is set
            adjustContentForFixedHeader();   // Then adjust margin
        });
    }
    if (footerIframe) {
        footerIframe.addEventListener('load', () => {
            adjustIframeHeight(footerIframe);
        });
    }


    // --- MODAL MANAGEMENT ---
    const modals = document.querySelectorAll('.modal');

    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            body.style.overflow = 'hidden';
            // Add specific class for video modal content for styling
            if (modalId === 'video-player-modal' || modalId === 'trailer-modal') {
                modal.querySelector('.modal-content').classList.add('video-modal-padding');
            }
        }
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            body.style.overflow = '';

            // Remove specific class
            modal.querySelector('.modal-content').classList.remove('video-modal-padding');

            const iframe = modal.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                // Best way to stop YouTube video is to reset src or use postMessage API
                const originalSrc = iframe.src;
                iframe.src = ''; // Detach to stop
                setTimeout(() => { iframe.src = originalSrc; }, 50); // Reattach if needed later (optional)
                // iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); // For YouTube API
            }
            const videoElement = modal.querySelector('video');
            if (videoElement) {
                videoElement.pause();
            }
        }
    };

    modals.forEach(modal => {
        // Close on backdrop click
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
        // Close button inside modal
        const closeButton = modal.querySelector('.close-btn');
        if (closeButton) {
            closeButton.addEventListener('click', () => closeModal(modal.id));
        }
    });

    // Close on Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal(modal.id);
                }
            });
        }
    });


    // --- TAB FUNCTIONALITY ---
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and content
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab and corresponding content
            tab.classList.add('active');
            const targetContentId = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(targetContentId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });


    // --- MODAL TRIGGERS (Specific to this page) ---
    const playTrailerButton = document.querySelector('.play-trailer-btn');
    if (playTrailerButton) {
        playTrailerButton.addEventListener('click', () => openModal('trailer-modal'));
    }

    const episodeCards = document.querySelectorAll('.episode-card');
    episodeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Potentially pass data to modal before opening
            // For now, just opens the generic video player modal
            openModal('video-player-modal');
        });
    });

    const watchNowButton = document.querySelector('.action-buttons .btn-primary');
    if (watchNowButton) {
        watchNowButton.addEventListener('click', () => {
            // Logic to determine which episode to play or open player
            openModal('video-player-modal');
        });
    }
    
    // --- COMMUNITY FILTER TABS (Example, if dynamic content loading is not needed) ---
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Add logic here to filter community topics if they are not loaded dynamically
            // console.log('Filtering by:', tab.textContent);
        });
    });


    // --- MESSAGE LISTENER (from iframes) ---
    window.addEventListener('message', (event) => {
        // IMPORTANT: Check event.origin for security in a production environment!
        // Example: if (event.origin !== 'https://yourdomain.com') return;

        if (event.data && event.data.type) {
            switch (event.data.type) {
                case 'themeToggle': // Assuming header sends this
                    const newTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
                    applyTheme(newTheme);
                    break;
                case 'requestHeightUpdate': // If an iframe's content changes dynamically
                    const iframeToUpdate = document.getElementById(event.data.iframeId);
                    if (iframeToUpdate) {
                        adjustIframeHeight(iframeToUpdate);
                    }
                    break;
                case 'scrollToTop': // If footer back-to-top sends this
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                 case 'iframeLoaded': // Custom message from iframe after its own JS runs
                    if (event.data.iframeId === 'header-iframe') {
                        adjustContentForFixedHeader();
                    }
                    adjustIframeHeight(document.getElementById(event.data.iframeId));
                    break;
            }
        }
    });

}); // End DOMContentLoaded