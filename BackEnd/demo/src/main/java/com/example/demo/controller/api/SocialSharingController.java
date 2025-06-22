package com.example.demo.controller.api;

import com.example.demo.entity.UserShare;
import com.example.demo.service.SocialSharingService;
import com.example.demo.service.UserService;
import com.example.demo.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/social")
@CrossOrigin(origins = "*")
public class SocialSharingController {

    @Autowired
    private SocialSharingService socialSharingService;
    
    @Autowired
    private UserService userService;

    /**
     * Ghi nhận việc user chia sẻ phim lên mạng xã hội
     * POST /api/social/share
     * Body: {
     *   "userId": 1,
     *   "cartoonId": 5,
     *   "platform": "facebook"
     * }
     */
    @PostMapping("/share")
    public ResponseEntity<?> shareMovie(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            Integer cartoonId = Integer.valueOf(request.get("cartoonId").toString());
            String platform = (String) request.get("platform");
            
            if (userId == null || cartoonId == null || platform == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing required fields: userId, cartoonId, platform"
                ));
            }
            
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            // Ghi nhận việc chia sẻ và tự động check achievements
            UserShare share = socialSharingService.recordShare(userOpt.get(), cartoonId, platform);
            
            if (share != null) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Share recorded successfully",
                    "shareId", share.getId()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cartoon with ID " + cartoonId + " not found. Please use a valid cartoon ID from your database."
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to record share: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy số lượng shares của user
     * GET /api/social/shares/{userId}
     */
    @GetMapping("/shares/{userId}")
    public ResponseEntity<?> getUserShareCount(@PathVariable Integer userId) {
        try {
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            long shareCount = socialSharingService.getUserShareCount(userOpt.get());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "shareCount", shareCount
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get share count: " + e.getMessage()
            ));
        }
    }

    /**
     * Kiểm tra xem user đã chia sẻ phim này chưa
     * GET /api/social/shared/{userId}/{cartoonId}
     */
    @GetMapping("/shared/{userId}/{cartoonId}")
    public ResponseEntity<?> hasUserSharedMovie(
            @PathVariable Integer userId, 
            @PathVariable Integer cartoonId) {
        try {
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            boolean hasShared = socialSharingService.hasSharedCartoon(userOpt.get(), cartoonId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "hasShared", hasShared
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to check share status: " + e.getMessage()
            ));
        }
    }
}
