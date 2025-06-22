package com.example.demo.controller.api;

import com.example.demo.entity.Achievement;
import com.example.demo.entity.UserAchievement;
import com.example.demo.entity.User;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.UserAchievementRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserAchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-achievements")
public class UserAchievementRestController {
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserAchievementService userAchievementService;

    public UserAchievementRestController(UserAchievementRepository userAchievementRepository,
            UserRepository userRepository) {
        this.userAchievementRepository = userAchievementRepository;
        this.userRepository = userRepository;
    }

    // Lấy tất cả thành tựu của 1 user theo userId
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @GetMapping("/user/{userId}")
    public List<UserAchievement> getAchievementsByUser(@PathVariable Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return List.of();
        return userAchievementRepository.findByUser(user);
    }

    // Lấy tất cả user-achievement
    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping
    public List<UserAchievement> getAllUserAchievements() {
        return userAchievementRepository.findAll();
    }

    // Thêm thành tựu cho user
    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping
    public UserAchievement addUserAchievement(@RequestBody UserAchievement userAchievement) {
        return userAchievementRepository.save(userAchievement);
    }

    // Xóa thành tựu của user
    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteUserAchievement(@PathVariable Integer id) {
        userAchievementRepository.deleteById(id);
    }

    // API lấy thành tựu chưa đạt của user
    @GetMapping("/user/{userId}/not-achieved")
    public List<Achievement> getNotAchieved(@PathVariable Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return List.of();
        List<UserAchievement> achieved = userAchievementRepository.findByUser(user);
        List<Integer> achievedIds = achieved.stream().map(ua -> ua.getAchievement().getId()).toList();
        return achievementRepository.findAll().stream()
                .filter(a -> !achievedIds.contains(a.getId()))
                .collect(Collectors.toList());
    }

    // API lấy tiến độ thành tựu "xem 10 phim" (có thể mở rộng cho các loại khác)
    @GetMapping("/user/{userId}/progress")
    public Map<String, Object> getProgress(@PathVariable Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return Map.of();
        // Giả sử id thành tựu "xem 10 phim" là 2
        int watched = 0;
        try {
            watched = (int) user.getAchievements().stream()
                    .filter(ua -> ua.getAchievement().getId() == 2).count();
        } catch (Exception ignored) {
        }
        Map<String, Object> progress = new HashMap<>();
        progress.put("achievementId", 2);
        progress.put("name", "Xem 10 phim");
        progress.put("current", watched);
        progress.put("target", 10);
        progress.put("completed", watched >= 10);
        return progress;
    }

    // API top user nhiều thành tựu nhất
    @GetMapping("/top-users")
    public List<Map<String, Object>> getTopUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (User user : users) {
            int count = userAchievementRepository.findByUser(user).size();
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getId());
            map.put("username", user.getUsername());
            map.put("achievementCount", count);
            result.add(map);
        }
        return result.stream()
                .sorted((a, b) -> ((Integer) b.get("achievementCount")).compareTo((Integer) a.get("achievementCount")))
                .limit(10)
                .collect(Collectors.toList());
    }

    // API lịch sử thành tựu của user
    @GetMapping("/user/{userId}/history")
    public List<Map<String, Object>> getAchievementHistory(@PathVariable Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return List.of();
        List<UserAchievement> list = userAchievementRepository.findByUser(user);
        List<Map<String, Object>> result = new ArrayList<>();
        for (UserAchievement ua : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("achievementId", ua.getAchievement().getId());
            map.put("name", ua.getAchievement().getName());
            map.put("description", ua.getAchievement().getDescription());
            map.put("achievedAt", "N/A"); // Nếu có trường thời gian đạt thì lấy ở đây
            result.add(map);
        }
        return result;
    }

    // API lấy tiến độ chi tiết thành tựu của user (mới)
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @GetMapping("/user/{userId}/detailed-progress")
    public List<Map<String, Object>> getDetailedProgress(@PathVariable Integer userId) {
        return userAchievementService.getUserAchievementProgress(userId);
    }

    // API kiểm tra và cấp thành tựu tự động
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @PostMapping("/user/{userId}/check-achievements")
    public Map<String, Object> checkAchievements(@PathVariable Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Map.of("success", false, "message", "User not found");
        }

        userAchievementService.checkAndGrantAchievements(user);
        return Map.of("success", true, "message", "Achievements checked and updated");
    }

    // Lấy tiến độ thành tựu theo username
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @GetMapping("/username/{username}/detailed-progress")
    public List<Map<String, Object>> getDetailedProgressByUsername(@PathVariable String username) {
        System.out.println("=== getDetailedProgressByUsername called with: " + username + " ===");
        User user = userRepository.findByUsername(username);
        if (user == null) {
            System.out.println("User not found: " + username);
            return new ArrayList<>();
        }
        System.out.println("Found user: " + user.getId() + " - " + user.getUsername());
        return userAchievementService.getUserAchievementProgress(user.getId());
    }

    // Kiểm tra thành tựu theo username
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @PostMapping("/username/{username}/check-achievements")
    public Map<String, Object> checkAchievementsByUsername(@PathVariable String username) {
        System.out.println("=== checkAchievementsByUsername called with: " + username + " ===");
        User user = userRepository.findByUsername(username);
        if (user == null) {
            System.out.println("User not found: " + username);
            return Map.of("success", false, "message", "User not found");
        }

        userAchievementService.checkAndGrantAchievements(user);
        return Map.of("success", true, "message", "Achievements checked and updated", "userId", user.getId());
    }
}
