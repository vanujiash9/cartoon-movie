-- Tạo bảng cartoon_likes để lưu trữ like/dislike của user cho phim
CREATE TABLE cartoon_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cartoon_id INT NOT NULL,
    user_id INT NOT NULL,
    is_liked BOOLEAN NOT NULL COMMENT 'true = like, false = dislike',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ràng buộc khóa ngoại
    FOREIGN KEY (cartoon_id) REFERENCES cartoons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ràng buộc unique để 1 user chỉ có thể like/dislike 1 phim 1 lần
    UNIQUE KEY unique_user_cartoon (cartoon_id, user_id),
    
    -- Index để tăng hiệu suất truy vấn
    INDEX idx_cartoon_id (cartoon_id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_liked (is_liked)
);
