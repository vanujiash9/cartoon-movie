package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // Tạo thông báo mới
    public Notification createNotification(User user, String title, String content, Notification.NotificationType type) {
        Notification notification = new Notification(user, title, content, type);
        return notificationRepository.save(notification);
    }

    // Tạo thông báo với đối tượng liên quan
    public Notification createNotification(User user, String title, String content, 
                                         Notification.NotificationType type, Integer relatedId, String relatedType) {
        Notification notification = new Notification(user, title, content, type, relatedId, relatedType);
        return notificationRepository.save(notification);
    }

    // Legacy method để tương thích
    public void sendNotification(User user, String content) {
        createNotification(user, "Thông báo", content, Notification.NotificationType.SYSTEM);
    }

    // Lấy tất cả thông báo của user
    public List<Notification> getNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // Lấy thông báo của user với limit
    public List<Notification> getUserNotifications(User user, int limit) {
        return notificationRepository.findByUserWithLimit(user, PageRequest.of(0, limit));
    }

    // Lấy thông báo chưa đọc
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    // Đếm số thông báo chưa đọc
    public Long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    // Đánh dấu thông báo là đã đọc
    public void markAsRead(Notification notification) {
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    // Đánh dấu thông báo theo ID là đã đọc
    public void markAsRead(Integer notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    // Đánh dấu tất cả thông báo của user là đã đọc
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user, LocalDateTime.now());
    }

    // Lấy thông báo theo ID
    public Notification getById(Integer id) {
        return notificationRepository.findById(id).orElse(null);
    }

    // Xóa thông báo
    public void deleteNotification(Integer notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    // === HELPER METHODS FOR SPECIFIC NOTIFICATION TYPES ===

    // Thông báo khi có người like comment
    public void notifyCommentLiked(User commentOwner, User liker, Integer commentId) {
        if (!commentOwner.getId().equals(liker.getId())) { // Không thông báo cho chính mình
            String title = "Có người thích bình luận của bạn";
            String content = liker.getUsername() + " đã thích bình luận của bạn";
            createNotification(commentOwner, title, content, Notification.NotificationType.LIKE, commentId, "COMMENT");
        }
    }

    // Thông báo khi có reply comment
    public void notifyCommentReplied(User commentOwner, User replier, Integer commentId) {
        if (!commentOwner.getId().equals(replier.getId())) {
            String title = "Có người trả lời bình luận của bạn";
            String content = replier.getUsername() + " đã trả lời bình luận của bạn";
            createNotification(commentOwner, title, content, Notification.NotificationType.REPLY, commentId, "COMMENT");
        }
    }

    // Thông báo khi đạt thành tựu
    public void notifyAchievementUnlocked(User user, String achievementName) {
        String title = "🎉 Bạn đã mở khóa thành tựu mới!";
        String content = "Chúc mừng! Bạn đã đạt được thành tựu: " + achievementName;
        createNotification(user, title, content, Notification.NotificationType.ACHIEVEMENT);
    }

    // Thông báo cập nhật profile
    public void notifyProfileUpdated(User user) {
        String title = "Thông tin cá nhân đã được cập nhật";
        String content = "Thông tin cá nhân của bạn đã được cập nhật thành công";
        createNotification(user, title, content, Notification.NotificationType.PROFILE_UPDATE);
    }

    // Thông báo thành công
    public void notifySuccess(User user, String title, String content) {
        createNotification(user, title, content, Notification.NotificationType.SUCCESS);
    }

    // Lấy user theo ID
    public User getUserById(Integer userId) {
        return userRepository.findById(userId).orElse(null);
    }
}
