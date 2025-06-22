package com.example.demo.controller.api;

import com.example.demo.entity.Achievement;
import com.example.demo.entity.UserAchievement;
import com.example.demo.entity.User;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.service.UserAchievementService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "*")
public class AchievementRestController {
    private final AchievementRepository achievementRepository;
    
    @Autowired
    private UserAchievementService userAchievementService;
    
    @Autowired
    private UserService userService;

    public AchievementRestController(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    @GetMapping
    public List<Achievement> getAll() {
        return achievementRepository.findAll();
    }

    @GetMapping("/{id}")
    public Achievement getById(@PathVariable Integer id) {
        return achievementRepository.findById(id).orElse(null);
    }

    /**
     * Get user achievements with progress
     * GET /api/achievements/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAchievements(@PathVariable Integer userId) {
        try {
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            List<UserAchievement> userAchievements = userAchievementService.getUserAchievements(userOpt.get());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", userAchievements
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get user achievements: " + e.getMessage()
            ));
        }
    }

    /**
     * Trigger achievement check for user
     * POST /api/achievements/check/{userId}
     */
    @PostMapping("/check/{userId}")
    public ResponseEntity<?> checkUserAchievements(@PathVariable Integer userId) {
        try {
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            userAchievementService.checkAndGrantAchievements(userOpt.get());
            List<UserAchievement> userAchievements = userAchievementService.getUserAchievements(userOpt.get());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Achievement check completed",
                "data", userAchievements
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to check achievements: " + e.getMessage()
            ));
        }
    }

    /**
     * Get user achievements with detailed progress
     * GET /api/achievements/progress/{userId}
     */
    @GetMapping("/progress/{userId}")
    public ResponseEntity<?> getUserAchievementsWithProgress(@PathVariable Integer userId) {
        try {
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            List<Map<String, Object>> achievements = userAchievementService.getUserAchievementsWithProgress(userOpt.get());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", achievements
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get user achievements: " + e.getMessage()
            ));
        }
    }

    @PostMapping
    public Achievement create(@RequestBody Achievement achievement) {
        return achievementRepository.save(achievement);
    }

    @PutMapping("/{id}")
    public Achievement update(@PathVariable Integer id, @RequestBody Achievement achievement) {
        achievement.setId(id);
        return achievementRepository.save(achievement);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        achievementRepository.deleteById(id);
    }
}
