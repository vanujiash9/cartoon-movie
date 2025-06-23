package com.example.demo.service;

import com.example.demo.entity.Achievement;
import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Lấy tất cả thông báo của user
    public List<Notification> getNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // Lấy thông báo của user với limit
    public List<Notification> getUserNotifications(User user, int limit) {
        return notificationRepository.findByUserWithLimit(user, PageRequest.of(0, limit));
    }

    // Đếm số thông báo chưa đọc
    public Long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    // Đánh dấu thông báo theo ID là đã đọc
    @Transactional
    public void markAsRead(Integer notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notification.setReadAt(LocalDateTime.now());
                notificationRepository.save(notification);
            }
        });
    }

    // Đánh dấu tất cả thông báo của user là đã đọc
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user, LocalDateTime.now());
    }

    // === HELPER METHODS FOR SPECIFIC NOTIFICATION TYPES ===

    public Notification createNotification(User user, String title, String content, 
        Notification.NotificationType type, Integer relatedId, String relatedType) {
        Notification notification = new Notification(user, title, content, type, relatedId, relatedType);
        return notificationRepository.save(notification);
    }

    // Thông báo khi có người like comment
    public void notifyCommentLiked(User commentOwner, User liker, Integer commentId) {
        if (!commentOwner.getId().equals(liker.getId())) { // Không thông báo cho chính mình
            String title = "Có người thích bình luận của bạn";
            String content = liker.getUsername() + " đã thích bình luận của bạn.";
            createNotification(commentOwner, title, content, Notification.NotificationType.LIKE, commentId, "COMMENT");
        }
    }

    // Thông báo khi có người trả lời comment
    public void notifyCommentReply(User commentOwner, User replier, Integer commentId) {
        if (!commentOwner.getId().equals(replier.getId())) {
            String title = "Bình luận của bạn có trả lời mới";
            String content = replier.getUsername() + " đã trả lời bình luận của bạn.";
            createNotification(commentOwner, title, content, Notification.NotificationType.REPLY, commentId, "COMMENT");
        }
    }

    // Thông báo khi có người theo dõi mới
    public void notifyNewFollower(User followedUser, User follower) {
        if (!followedUser.getId().equals(follower.getId())) {
            String title = "Bạn có người theo dõi mới";
            String content = follower.getUsername() + " đã bắt đầu theo dõi bạn.";
            createNotification(followedUser, title, content, Notification.NotificationType.SOCIAL, follower.getId(), "USER");
        }
    }

    // Thông báo khi người dùng đạt được thành tựu mới
    public void createAchievementNotification(User user, Achievement achievement) {
        String title = "Thành tựu mới đã được mở khóa!";
        String content = "Chúc mừng! Bạn đã đạt được thành tựu: " + achievement.getName();
        createNotification(user, title, content, Notification.NotificationType.ACHIEVEMENT, achievement.getId(), "ACHIEVEMENT");
    }

    // Thông báo khi người dùng cập nhật hồ sơ
    public void notifyProfileUpdated(User user) {
        String title = "Hồ sơ đã được cập nhật";
        String content = "Thông tin hồ sơ của bạn đã được cập nhật thành công.";
        createNotification(user, title, content, Notification.NotificationType.PROFILE_UPDATE, user.getId(), "USER");
    }
}