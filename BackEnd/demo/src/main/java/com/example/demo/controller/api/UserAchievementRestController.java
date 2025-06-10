package com.example.demo.controller.api;

import com.example.demo.entity.UserAchievement;
import com.example.demo.entity.User;
import com.example.demo.repository.UserAchievementRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/user-achievements")
public class UserAchievementRestController {
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;

    public UserAchievementRestController(UserAchievementRepository userAchievementRepository, UserRepository userRepository) {
        this.userAchievementRepository = userAchievementRepository;
        this.userRepository = userRepository;
    }

    // Lấy tất cả thành tựu của 1 user theo userId
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @GetMapping("/user/{userId}")
    public List<UserAchievement> getAchievementsByUser(@PathVariable Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();
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
}
