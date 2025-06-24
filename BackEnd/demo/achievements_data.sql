-- Insert sample achievements with specific targets
-- Xóa dữ liệu cũ nếu có
DELETE FROM achievements WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

-- Thành tựu xem phim
INSERT INTO achievements (id, name, description, action_type, target_count, icon, category) VALUES
(1, 'Khán giả mới', 'Xem phim đầu tiên của bạn', 'WATCH_MOVIE', 1, '🎬', 'WATCHING'),
(2, 'Người xem thường xuyên', 'Xem 5 phim', 'WATCH_MOVIE', 5, '🍿', 'WATCHING'),
(3, 'Nhà thám hiểm điện ảnh', 'Xem 5 phim khác nhau', 'WATCH_DIFFERENT_MOVIES', 5, '🎭', 'WATCHING'),
(4, 'Tín đồ phim hoạt hình', 'Xem 10 phim', 'WATCH_MOVIE', 10, '🎪', 'WATCHING'),

-- Thành tựu tương tác
(5, 'Nhà phê bình tập sự', 'Viết bình luận đầu tiên', 'REVIEW', 1, '📝', 'SOCIAL'),
(6, 'Nhà phê bình chuyên nghiệp', 'Viết 10 bình luận', 'REVIEW', 10, '✍️', 'SOCIAL'),
(7, 'Người được yêu thích', 'Nhận 10 lượt thích', 'RECEIVE_LIKE', 10, '👍', 'SOCIAL'),
(8, 'Ngôi sao cộng đồng', 'Nhận 100 lượt thích', 'RECEIVE_LIKE', 100, '⭐', 'SOCIAL'),

-- Thành tựu chia sẻ và giới thiệu
(9, 'Người chia sẻ', 'Chia sẻ phim đầu tiên', 'SHARE', 1, '📤', 'SHARING'),
(10, 'Đại sứ thương hiệu', 'Giới thiệu 3 người bạn', 'REFERRAL', 3, '🎖️', 'REFERRAL');

-- Reset progress cho tất cả user (để test lại từ đầu)
DELETE FROM user_achievements;
