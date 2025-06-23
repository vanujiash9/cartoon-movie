package com.example.demo.controller.api;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.service.NotificationService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private UserService userService;

    // Lấy danh sách thông báo của user
    @GetMapping
    public ResponseEntity<?> getNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để xem thông báo");
        }
        String username = auth.getName();
        User user = userService.findByUsername(username);
        List<Notification> list = notificationService.getNotifications(user);
        return ResponseEntity.ok(list);
    }

    // Đánh dấu đã đọc thông báo
    @PostMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Đã đánh dấu đã đọc");
    }

    // Đếm số thông báo chưa đọc
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để xem thông báo");
        }
        String username = auth.getName();
        User user = userService.findByUsername(username);
        Long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(count);
    }

    // Đánh dấu tất cả thông báo đã đọc
    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để thực hiện hành động này");
        }
        String username = auth.getName();
        User user = userService.findByUsername(username);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok("Đã đánh dấu tất cả thông báo đã đọc");
    }

    // Test endpoint để tạo thông báo
    @PostMapping("/test")
    public ResponseEntity<?> createTestNotification(@RequestBody java.util.Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để tạo thông báo");
        }
        String username = auth.getName();
        User user = userService.findByUsername(username);
        
        String title = body.getOrDefault("title", "Thông báo test");
        String content = body.getOrDefault("content", "Đây là thông báo test");
        String typeStr = body.getOrDefault("type", "SYSTEM");
        
        Notification.NotificationType type;
        try {
            type = Notification.NotificationType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            type = Notification.NotificationType.SYSTEM;
        }
        
        notificationService.createNotification(user, title, content, type, null, null);
        return ResponseEntity.ok("Đã tạo thông báo test thành công");
    }
}
