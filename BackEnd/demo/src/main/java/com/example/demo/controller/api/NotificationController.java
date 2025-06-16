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
        Notification notification = notificationService.getById(id);
        if (notification == null) return ResponseEntity.badRequest().body("Không tìm thấy thông báo");
        notificationService.markAsRead(notification);
        return ResponseEntity.ok("Đã đánh dấu đã đọc");
    }
}
