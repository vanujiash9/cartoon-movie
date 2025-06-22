package com.example.demo.repository;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Lấy thông báo của user, sắp xếp theo thời gian mới nhất
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    // Lấy thông báo chưa đọc của user
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    // Đếm số thông báo chưa đọc
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.isRead = false")
    Long countUnreadByUser(@Param("user") User user);

    // Lấy thông báo chưa đọc
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserOrderByCreatedAtDesc(@Param("user") User user);

    // Lấy thông báo theo user với limit
    @Query("SELECT n FROM Notification n WHERE n.user = :user ORDER BY n.createdAt DESC")
    List<Notification> findByUserWithLimit(@Param("user") User user, org.springframework.data.domain.Pageable pageable);

    // Lấy thông báo trong khoảng thời gian
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.createdAt >= :startDate ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndCreatedAtAfter(@Param("user") User user, @Param("startDate") LocalDateTime startDate);

    // Xóa thông báo cũ (ví dụ: cũ hơn 30 ngày)
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Đánh dấu tất cả thông báo của user là đã đọc
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user = :user AND n.isRead = false")
    void markAllAsReadForUser(@Param("user") User user, @Param("readAt") LocalDateTime readAt);
}
