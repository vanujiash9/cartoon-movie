// Mở và đóng modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Chuyển đổi giữa các modal (Đăng nhập và Đăng ký)
function switchModal(fromModalId, toModalId) {
    document.getElementById(fromModalId).style.display = 'none';
    document.getElementById(toModalId).style.display = 'flex';
}

// Tab functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        // Show content for active tab
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Play trailer button
document.querySelector('.play-trailer-btn').addEventListener('click', function() {
    openModal('trailer-modal');
});

// Episode cards
document.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', function() {
        openModal('video-player-modal');
    });
});

// "Xem ngay" button
document.querySelector('.btn-lg.btn-primary').addEventListener('click', function() {
    openModal('video-player-modal');
});
