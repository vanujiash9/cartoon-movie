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


    // --- SOCIAL SHARING & REFERRAL FUNCTIONS ---

    // Movie information (in a real app, this would come from the backend)
    const currentMovie = {
        id: 1, // This should be dynamic
        title: "Demon Slayer",
        url: window.location.href
    };

    // Current user (in a real app, this would come from authentication)
    const currentUser = {
        id: JSON.parse(localStorage.getItem('currentUser') || '{}').id || 1,
        username: JSON.parse(localStorage.getItem('currentUser') || '{}').username || 'user'
    };

    // Open share modal
    window.openShareModal = () => {
        const modal = document.getElementById('shareModal');
        modal.style.display = 'flex';
        generateReferralLink();
    };

    // Close share modal
    window.closeShareModal = () => {
        const modal = document.getElementById('shareModal');
        modal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('shareModal');
        if (event.target === modal) {
            closeShareModal();
        }
    }

    // Share to Facebook
    window.shareToFacebook = async () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentMovie.url)}&quote=${encodeURIComponent(`Tôi đang xem "${currentMovie.title}" trên MAXION! Cùng xem nhé!`)}`;
        
        // Record the share
        await recordShare('facebook');
        
        // Open share window
        window.open(shareUrl, 'facebook-share', 'width=600,height=400');
    };

    // Share to Twitter
    window.shareToTwitter = async () => {
        const shareText = `Tôi đang xem "${currentMovie.title}" trên MAXION! Cùng xem nhé! ${currentMovie.url} #MaxionMovies #AnimeLovers`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        
        // Record the share
        await recordShare('twitter');
        
        // Open share window
        window.open(shareUrl, 'twitter-share', 'width=600,height=400');
    };

    // Share to Telegram
    window.shareToTelegram = async () => {
        const shareText = `Tôi đang xem "${currentMovie.title}" trên MAXION! Cùng xem nhé!`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentMovie.url)}&text=${encodeURIComponent(shareText)}`;
        
        // Record the share
        await recordShare('telegram');
        
        // Open share window
        window.open(shareUrl, 'telegram-share', 'width=600,height=400');
    };

    // Copy share link
    window.copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(currentMovie.url);
            
            // Record the share
            await recordShare('link');
            
            // Show success message
            const button = document.querySelector('.copy-link');
            const originalText = button.innerHTML;
            button.innerHTML = '<span>✅</span> Đã sao chép!';
            button.style.background = '#00d4aa';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy link: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = currentMovie.url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            await recordShare('link');
            alert('Link đã được sao chép!');
        }
    };

    // Record share action to backend
    async function recordShare(platform) {
        try {
            const response = await fetch('/api/social/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    cartoonId: currentMovie.id,
                    platform: platform
                })
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('Share recorded successfully');
                // Could show a notification about achievement if earned
                checkForNewAchievements();
            }
        } catch (error) {
            console.error('Failed to record share:', error);
        }
    }

    // Generate referral link
    async function generateReferralLink() {
        try {
            const response = await fetch('/api/referral/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id
                })
            });
            
            const result = await response.json();
            if (result.success) {
                document.getElementById('referralLink').value = result.referralUrl;
            }
        } catch (error) {
            console.error('Failed to generate referral link:', error);
            document.getElementById('referralLink').value = 'https://maxion-movie.com/register?ref=ERROR';
        }
    }

    // Copy referral link
    window.copyReferralLink = async () => {
        const referralLink = document.getElementById('referralLink').value;
        
        try {
            await navigator.clipboard.writeText(referralLink);
            
            // Show success message
            const button = document.querySelector('.referral-link-container button');
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Đã sao chép!';
            button.style.background = '#00d4aa';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = referralLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            alert('Link mời bạn bè đã được sao chép!');
        }
    }

    // Check for new achievements
    async function checkForNewAchievements() {
        try {
            const response = await fetch(`/api/achievements/progress/${currentUser.id}`);
            const achievements = await response.json();
            
            // Check if user just earned social sharing or referral achievements
            const socialAchievement = achievements.find(a => a.id === 8 && a.completed);
            const referralAchievement = achievements.find(a => a.id === 10 && a.completed);
            
            if (socialAchievement) {
                showAchievementNotification("🎉 Thành tựu mở khóa: Chia sẻ phim lên mạng xã hội!");
            }
            
            if (referralAchievement) {
                showAchievementNotification("🎉 Thành tựu mở khóa: Mời bạn bè đăng ký!");
            }
        } catch (error) {
            console.error('Failed to check achievements:', error);
        }
    }

    // Show achievement notification
    function showAchievementNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
            animation: slideIn 0.5s ease-out;
        `;
        notification.innerHTML = message;
        
        // Add animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.5s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }
}); // End DOMContentLoaded

// API Configuration
const API_BASE = 'http://localhost:8080';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Get current movie ID from URL or set default
const urlParams = new URLSearchParams(window.location.search);
const currentMovieId = urlParams.get('id') || 2; // Default to 2 if no ID in URL

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

// Social Sharing Functions
async function shareToFacebook() {
    if (await shareMovie(currentMovieId, 'facebook')) {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        showShareSuccess('Facebook');
    }
}

async function shareToTwitter() {
    if (await shareMovie(currentMovieId, 'twitter')) {
        const text = `Tôi đang xem phim này trên Maxion! Cùng xem nhé!`;
        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        showShareSuccess('Twitter');
    }
}

async function shareToTelegram() {
    if (await shareMovie(currentMovieId, 'telegram')) {
        const text = `Tôi đang xem phim này trên Maxion! Cùng xem nhé! ${window.location.href}`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        showShareSuccess('Telegram');
    }
}

async function copyShareLink() {
    if (await shareMovie(currentMovieId, 'link')) {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showShareSuccess('Đã sao chép link');
        } catch (err) {
            console.error('Failed to copy link:', err);
            alert('Không thể sao chép link. Vui lòng thử lại.');
        }
    }
}

async function shareMovie(cartoonId, platform) {
    if (!currentUser?.id) {
        alert('Vui lòng đăng nhập để chia sẻ và nhận thành tựu!');
        return false;
    }
    
    try {
        const result = await apiCall('/api/social/share', 'POST', {
            userId: currentUser.id,
            cartoonId: parseInt(cartoonId),
            platform
        });
        
        if (result.success) {
            console.log('✅ Share recorded successfully, achievements check triggered');
            return true;
        } else {
            console.error('❌ Share failed:', result);
            alert('Không thể ghi nhận chia sẻ. Vui lòng thử lại.');
            return false;
        }
    } catch (error) {
        console.error('Error sharing movie:', error);
        alert('Lỗi khi chia sẻ. Vui lòng thử lại.');
        return false;
    }
}

function showShareSuccess(platform) {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = `✅ Đã chia sẻ thành công trên ${platform}! Kiểm tra thành tựu mới.`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Referral Functions
async function generateReferralLink() {
    if (!currentUser?.id) {
        alert('Vui lòng đăng nhập để tạo link mời bạn bè!');
        return;
    }
    
    try {
        const result = await apiCall('/api/referral/generate', 'POST', {
            userId: currentUser.id
        });
        
        if (result.success && result.data.referralCode) {
            const referralLink = `${window.location.origin}?ref=${result.data.referralCode}`;
            document.getElementById('referralLink').value = referralLink;
            return referralLink;
        } else {
            console.error('Failed to generate referral:', result);
            document.getElementById('referralLink').placeholder = 'Không thể tạo link mời';
        }
    } catch (error) {
        console.error('Error generating referral:', error);
        document.getElementById('referralLink').placeholder = 'Lỗi khi tạo link mời';
    }
}

async function copyReferralLink() {
    const linkInput = document.getElementById('referralLink');
    if (!linkInput.value || linkInput.value === 'Đang tạo link mời...') {
        await generateReferralLink();
    }
    
    if (linkInput.value) {
        try {
            await navigator.clipboard.writeText(linkInput.value);
            showShareSuccess('Đã sao chép link mời bạn bè');
        } catch (err) {
            console.error('Failed to copy referral link:', err);
            alert('Không thể sao chép link. Vui lòng thử lại.');
        }
    }
}

// Modal Functions
function openShareModal() {
    document.getElementById('shareModal').style.display = 'block';
    // Generate referral link when modal opens
    generateReferralLink();
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}