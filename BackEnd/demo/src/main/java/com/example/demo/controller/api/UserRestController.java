package com.example.demo.controller.api;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import com.example.demo.dto.UserDTO;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserRestController {
    private final UserService userService;

    public UserRestController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping
    public List<User> getAll() {
        return userService.getAll();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/{id}")
    public User getById(@PathVariable Integer id) {
        return userService.getById(id).orElse(null);
    } // Endpoint để lấy thông tin user hiện tại @GetMapping("/me")

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        System.out.println("=== /api/users/me called ===");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication: " + auth);
        System.out.println("Is authenticated: " + (auth != null ? auth.isAuthenticated() : false));
        System.out.println("Username: " + (auth != null ? auth.getName() : "null"));

        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            String username = auth.getName();
            System.out.println("Finding user by username: " + username);
            User user = userService.findByUsername(username);
            System.out.println("Found user: " + user);
            if (user != null) {
                // Map User entity to UserDTO
                UserDTO dto = new UserDTO();
                dto.setId(user.getId());
                dto.setUsername(user.getUsername());
                dto.setEmail(user.getEmail());
                dto.setFullName(user.getFullName());
                dto.setRole(user.getRole());
                dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
                return ResponseEntity.ok(dto);
            } else {
                System.out.println("User not found in database");
                return ResponseEntity.notFound().build();
            }
        }
        System.out.println("Authentication failed or user is anonymous");
        return ResponseEntity.status(401).build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping
    public User create(@RequestBody User user) {
        return userService.save(user);
    }    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{id}")
    public User update(@PathVariable Integer id, @RequestBody User user) {
        user.setId(id);
        return userService.save(user);
    }
    
    // Endpoint để user cập nhật profile của mình
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UserDTO userDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để cập nhật thông tin");
        }
        
        String username = auth.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Update allowed fields
        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        
        // Save will trigger notification via UserService
        User updatedUser = userService.save(user);
        
        // Return updated DTO
        UserDTO responseDTO = new UserDTO();
        responseDTO.setId(updatedUser.getId());
        responseDTO.setUsername(updatedUser.getUsername());
        responseDTO.setEmail(updatedUser.getEmail());
        responseDTO.setFullName(updatedUser.getFullName());
        responseDTO.setRole(updatedUser.getRole());
        responseDTO.setCreatedAt(updatedUser.getCreatedAt() != null ? updatedUser.getCreatedAt().toString() : null);
        
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        userService.delete(id);
    }
}
