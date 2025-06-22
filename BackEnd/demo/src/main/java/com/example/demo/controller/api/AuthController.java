package com.example.demo.controller.api;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.User;
import com.example.demo.service.UserAchievementService;
import com.example.demo.service.UserService;
import com.example.demo.service.ReferralService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserAchievementService userAchievementService;
    @Autowired
    private ReferralService referralService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userService.findByUsername(request.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setAvatar(request.getAvatar());
        user.setRole("USER");
        user.setEnabled(true);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());
        
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
            try {
                user.setDateOfBirth(java.time.LocalDateTime.parse(request.getDateOfBirth()));
            } catch (Exception e) {}
        }
        
        // Save user first
        User savedUser = userService.save(user);
        
        // Gán thành tựu "Đăng ký tài khoản" (id = 1)
        userAchievementService.grantAchievementIfNotExists(savedUser, 1);
        
        // Process referral code if provided
        if (request.getReferralCode() != null && !request.getReferralCode().trim().isEmpty()) {
            try {
                // Extract referrer username from referral code (format: REF_USERNAME_XXXX)
                String referralCode = request.getReferralCode().trim();
                String[] parts = referralCode.split("_");
                
                if (parts.length >= 2 && "REF".equals(parts[0])) {
                    String referrerUsername = parts[1];
                    User referrer = userService.findByUsername(referrerUsername);
                    
                    if (referrer != null) {
                        // Record the referral
                        referralService.recordReferral(referrer, savedUser, referralCode);
                        
                        // Complete the referral (since user successfully registered)
                        referralService.completeReferral(savedUser);
                        
                        // This will trigger achievement check for the referrer
                        userAchievementService.checkAndGrantAchievements(referrer);
                    }
                }
            } catch (Exception e) {
                // Log error but don't fail registration
                System.err.println("Failed to process referral: " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok("Register success");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userService.findByUsername(request.getUsername());
            if (user == null) {
                return ResponseEntity.status(404)
                        .body(java.util.Map.of("error", "Không tìm thấy thông tin người dùng"));
            }
            
            // Gán thành tựu "Đăng nhập lần đầu" (giả sử id = 5)
            userAchievementService.grantAchievementIfNotExists(user, 5);
            
            // Create response with user info
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login success");
            
            // Generate simple token (for this demo, just use user id + timestamp)
            String token = "token_" + user.getId() + "_" + System.currentTimeMillis();
            response.put("token", token);
            
            // Add user data
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("fullName", user.getFullName() != null ? user.getFullName() : user.getUsername());
            userData.put("email", user.getEmail() != null ? user.getEmail() : "");
            userData.put("role", user.getRole() != null ? user.getRole().toString() : "USER");
            userData.put("avatar", user.getFullName() != null ? 
                user.getFullName().substring(0, 1).toUpperCase() : 
                user.getUsername().substring(0, 1).toUpperCase());
            
            response.put("user", userData);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(java.util.Map.of("error", "Tên đăng nhập hoặc mật khẩu không đúng"));
        }
    }

    // Get current authenticated user info
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(401)
                        .body(java.util.Map.of("error", "Không có phiên đăng nhập"));
            }

            User currentUser = userService.findByUsername(auth.getName());
            if (currentUser == null) {
                return ResponseEntity.status(404)
                        .body(java.util.Map.of("error", "Không tìm thấy thông tin người dùng"));
            }

            // Return safe user data (no password)
            java.util.Map<String, Object> userData = new java.util.HashMap<>();
            userData.put("id", currentUser.getId());
            userData.put("username", currentUser.getUsername());
            userData.put("fullName", currentUser.getFullName());
            userData.put("email", currentUser.getEmail());
            userData.put("role", currentUser.getRole().toString());
            userData.put("avatar", currentUser.getFullName() != null ? 
                currentUser.getFullName().substring(0, 1).toUpperCase() : "U");

            return ResponseEntity.ok(userData);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Debug endpoint to check session
    @GetMapping("/debug")
    public ResponseEntity<?> debugAuth(HttpServletRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("authName", auth != null ? auth.getName() : "null");
            debugInfo.put("authClass", auth != null ? auth.getClass().getSimpleName() : "null");
            debugInfo.put("authenticated", auth != null ? auth.isAuthenticated() : false);
            debugInfo.put("sessionId", request.getSession().getId());
            debugInfo.put("principal", auth != null ? auth.getPrincipal().toString() : "null");
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Debug error: " + e.getMessage()));
        }
    }
}
