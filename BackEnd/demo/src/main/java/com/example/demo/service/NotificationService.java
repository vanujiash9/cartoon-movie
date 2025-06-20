package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public void sendNotification(User user, String content) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setContent(content);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void markAsRead(Notification notification) {
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public Notification getById(Integer id) {
        return notificationRepository.findById(id).orElse(null);
    }

    public Long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findUnreadByUserOrderByCreatedAtDesc(user);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
}
