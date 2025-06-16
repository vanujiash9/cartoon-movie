package com.example.demo.controller.api;

import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.UserMovieProgress;
import com.example.demo.service.UserMovieProgressService;
import com.example.demo.service.UserService;
import com.example.demo.service.CartoonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class UserMovieProgressController {
    @Autowired
    private UserMovieProgressService userMovieProgressService;
    @Autowired
    private UserService userService;
    @Autowired
    private CartoonService cartoonService;

    // Lưu/cập nhật vị trí xem phim
    @PostMapping("/save")
    public ResponseEntity<?> saveProgress(@RequestParam Integer cartoonId, @RequestParam Integer lastPosition) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để lưu tiến độ xem phim");
        }
        String username = auth.getName();
        User user = userService.findByUsername(username);
        Cartoon cartoon = cartoonService.getById(cartoonId).orElse(null);
        if (user == null || cartoon == null) return ResponseEntity.badRequest().body("Không tìm thấy user hoặc phim");
        userMovieProgressService.saveOrUpdateProgress(user, cartoon, lastPosition);
        return ResponseEntity.ok("Đã lưu tiến độ xem phim");
    }

    // Lấy vị trí xem phim gần nhất
    @GetMapping("/get")
    public ResponseEntity<?> getProgress(@RequestParam Integer cartoonId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để lấy tiến độ xem phim");
        }
        String username = auth.getName();
        User user = userService.findByUsername(username);
        Cartoon cartoon = cartoonService.getById(cartoonId).orElse(null);
        if (user == null || cartoon == null) return ResponseEntity.badRequest().body("Không tìm thấy user hoặc phim");
        Optional<UserMovieProgress> progress = userMovieProgressService.getProgress(user, cartoon);
        return ResponseEntity.ok(progress.map(UserMovieProgress::getLastPosition).orElse(0));
    }

    // Lấy danh sách phim đang xem dở của user
    @GetMapping("/list")
    public ResponseEntity<?> getAllProgress() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để lấy danh sách phim đang xem dở");
        }
        String username = auth.getName();
        User user = userService.findByUsername(username);
        List<UserMovieProgress> list = userMovieProgressService.getAllProgressByUser(user);
        return ResponseEntity.ok(list);
    }
}
