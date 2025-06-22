package com.example.demo.controller.api;

import com.example.demo.entity.Referral;
import com.example.demo.service.ReferralService;
import com.example.demo.service.UserService;
import com.example.demo.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/referral")
@CrossOrigin(origins = "*")
public class ReferralController {

    @Autowired
    private ReferralService referralService;
    
    @Autowired
    private UserService userService;

    /**
     * Tạo referral code cho user
     * POST /api/referral/generate
     * Body: { "userId": 1 }
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateReferralCode(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing userId"
                ));
            }
            
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            String referralCode = referralService.generateReferralCode(userOpt.get());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "referralCode", referralCode,
                "referralUrl", "https://maxion-movie.com/register?ref=" + referralCode
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to generate referral code: " + e.getMessage()
            ));
        }
    }

    /**
     * Đăng ký user với referral code
     * POST /api/referral/register
     * Body: { 
     *   "userId": 123, 
     *   "referralCode": "ABC123"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerWithReferral(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            String referralCode = (String) request.get("referralCode");
            
            if (userId == null || referralCode == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing userId or referralCode"
                ));
            }
            
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            boolean success = referralService.processReferral(referralCode, userOpt.get());
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Referral processed successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid referral code or already used"
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to process referral: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy thống kê referral của user
     * GET /api/referral/stats/{userId}
     */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getReferralStats(@PathVariable Integer userId) {
        try {
            Optional<User> userOpt = userService.getById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            long successfulReferrals = referralService.getSuccessfulReferralsCount(userOpt.get());
            String referralCode = referralService.getReferralCode(userOpt.get());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "successfulReferrals", successfulReferrals,
                "referralCode", referralCode != null ? referralCode : "",
                "referralUrl", referralCode != null ? 
                    "https://maxion-movie.com/register?ref=" + referralCode : ""
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to get referral stats: " + e.getMessage()
            ));
        }
    }

    /**
     * Kiểm tra xem referral code có hợp lệ không
     * GET /api/referral/validate/{code}
     */
    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validateReferralCode(@PathVariable String code) {
        try {
            boolean isValid = referralService.isValidReferralCode(code);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "isValid", isValid
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to validate referral code: " + e.getMessage()
            ));
        }
    }
}
