-- V2__Create_Comments_Tables.sql
-- Migration để tạo bảng comments và comment_likes

-- Tạo bảng comments
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    user_id BIGINT NOT NULL,
    cartoon_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cartoon_id) REFERENCES cartoons(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    
    INDEX idx_comments_cartoon_id (cartoon_id),
    INDEX idx_comments_user_id (user_id),
    INDEX idx_comments_parent_id (parent_id),
    INDEX idx_comments_created_at (created_at)
);

-- Tạo bảng comment_likes
CREATE TABLE IF NOT EXISTS comment_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_liked BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_comment_likes_user_comment (comment_id, user_id),
    INDEX idx_comment_likes_comment_id (comment_id),
    INDEX idx_comment_likes_user_id (user_id)
);

-- Thêm dữ liệu mẫu cho comments
INSERT INTO comments (content, rating, user_id, cartoon_id, created_at) VALUES
('Phim rất hay! Đồ họa đẹp và câu chuyện hấp dẫn.', 5, 1, 3, '2024-06-15 10:30:00'),
('Tập này khá bình thường, hy vọng tập sau sẽ hay hơn.', 3, 2, 3, '2024-06-15 14:20:00'),
('Naruto luôn là số 1! Không thể bỏ lỡ.', 5, 1, 4, '2024-06-16 09:15:00'),
('Phim dành cho trẻ em nhưng người lớn xem cũng thích.', 4, 2, 4, '2024-06-16 16:45:00');

-- Thêm replies mẫu
INSERT INTO comments (content, rating, user_id, cartoon_id, parent_id, created_at) VALUES
('Đồng ý! Tôi cũng nghĩ vậy.', 0, 2, 3, 1, '2024-06-15 11:00:00'),
('Bạn nói đúng, tập sau chắc sẽ hay hơn.', 0, 1, 3, 2, '2024-06-15 15:30:00');

-- Thêm likes mẫu
INSERT INTO comment_likes (comment_id, user_id, is_liked) VALUES
(1, 2, true),
(2, 1, false),
(3, 2, true),
(4, 1, true);
