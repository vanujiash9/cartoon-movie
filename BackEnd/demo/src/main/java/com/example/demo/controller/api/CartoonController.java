package com.example.demo.controller.api;

import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.Episode;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.service.UserWatchHistoryService;
import com.example.demo.service.UserAchievementService;
import com.example.demo.service.UserService;
import com.example.demo.service.CartoonService;
import com.example.demo.service.EpisodeService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController("cartoonControllerApi")
@RequestMapping("/api/cartoons")
public class CartoonController {
    
    private final CartoonService cartoonService;
    private final EpisodeService episodeService;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private UserWatchHistoryService userWatchHistoryService;
    @Autowired
    private UserAchievementService userAchievementService;
    @Autowired
    private UserService userService;
    
    public CartoonController(CartoonService cartoonService, EpisodeService episodeService) {
        this.cartoonService = cartoonService;
        this.episodeService = episodeService;
    }
    
    // Chỉ USER, VIP, ADMIN đều xem được danh sách phim thường
    // @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')") // Tạm thời comment để public API
    @GetMapping
    public ResponseEntity<List<Cartoon>> getAllCartoons() {
        List<Cartoon> cartoons = cartoonService.getAll();
        return ResponseEntity.ok(cartoons);
    }
    
    @GetMapping("/summary")
    public ResponseEntity<List<Cartoon>> getAllCartoonsSummary() {
        List<Cartoon> cartoons = cartoonService.getAll();
        return ResponseEntity.ok(cartoons);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Cartoon> getCartoonById(@PathVariable Integer id) {
        try {
            Cartoon cartoon = cartoonService.getById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + id));
            // Ghi nhận lượt xem nếu user đã đăng nhập
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                User user = userService.findByUsername(username);
                if (user != null) {
                    userWatchHistoryService.recordWatch(user, cartoon);
                    int watched = userWatchHistoryService.countUniqueWatched(user);
                    // Giả sử id thành tựu "xem 10 phim" là 2
                    if (watched >= 10) {
                        userAchievementService.grantAchievementIfNotExists(user, 2);
                    }
                }
            }
            return ResponseEntity.ok(cartoon);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
public ResponseEntity<Cartoon> createCartoon(@RequestBody Cartoon cartoon) {
    try {
        // Kiểm tra dữ liệu đầu vào
        if (cartoon.getTitle() == null || cartoon.getTitle().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        cartoon.setCreatedAt(LocalDateTime.now()); // Sử dụng setCreatedAt
        Cartoon savedCartoon = cartoonService.create(cartoon);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCartoon);
    } catch (Exception e) {
        e.printStackTrace(); // Log lỗi chi tiết
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
    
    @PutMapping("/{id}")
    public ResponseEntity<Cartoon> updateCartoon(@PathVariable Integer id, @RequestBody Cartoon cartoon) {
        try {
            Cartoon updatedCartoon = cartoonService.update(id, cartoon);
            return ResponseEntity.ok(updatedCartoon);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartoon(@PathVariable Integer id) {
        try {
            cartoonService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Cartoon>> searchCartoons(@RequestParam String title) {
        try {
            List<Cartoon> cartoons = cartoonService.getAll().stream()
                    .filter(cartoon -> cartoon.getTitle().toLowerCase().contains(title.toLowerCase()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(cartoons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
      // Chỉ VIP và ADMIN mới xem được phim VIP
    // @PreAuthorize("hasAnyRole('VIP','ADMIN')") // Tạm thời comment để public API
    @GetMapping("/vip-content")
    public ResponseEntity<List<Cartoon>> getVipCartoons() {        System.out.println("===> getVipCartoons() called!"); // Log để kiểm tra
        List<Cartoon> vipCartoons = cartoonService.getAll().stream()
            .filter(c -> "VIP".equalsIgnoreCase(c.getStatus()))
            .toList();
        return ResponseEntity.ok(vipCartoons);
    }    // API để lấy rating statistics cho một phim
    @GetMapping("/{id}/rating")
    public ResponseEntity<Map<String, Object>> getCartoonRating(@PathVariable Integer id) {
        Map<String, Object> rating = new HashMap<>();
        
        try {
            // Kiểm tra cartoon có tồn tại không
            cartoonService.getById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + id));
            
            // Lấy rating từ database
            Object[] result = reviewRepository.findAverageRatingAndCountByCartoonId(id);
            
            System.out.println("Rating result: " + java.util.Arrays.toString(result));
            
            if (result != null && result.length >= 2) {
                Object avgObj = result[0];
                Object countObj = result[1];
                
                Double avgRating = 0.0;
                Integer totalReviews = 0;
                
                if (avgObj != null) {
                    avgRating = Double.valueOf(avgObj.toString());
                }
                
                if (countObj != null) {
                    totalReviews = Integer.valueOf(countObj.toString());
                }
                
                rating.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
                rating.put("totalReviews", totalReviews);
            } else {
                rating.put("averageRating", 0.0);
                rating.put("totalReviews", 0);
            }
            
            return ResponseEntity.ok(rating);
            
        } catch (EntityNotFoundException e) {
            rating.put("error", "Cartoon not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(rating);
        } catch (Exception e) {
            e.printStackTrace();
            rating.put("error", "Server error: " + e.getMessage());
            rating.put("averageRating", 0.0);
            rating.put("totalReviews", 0);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(rating);
        }
    }
    
    // API để lấy danh sách episodes của một cartoon
    @GetMapping("/{id}/episodes")
    public ResponseEntity<List<Episode>> getCartoonEpisodes(@PathVariable Integer id) {
        try {
            // Kiểm tra cartoon có tồn tại không
            cartoonService.getById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + id));
            
            // Lấy danh sách episodes
            List<Episode> episodes = episodeService.getByCartoonId(id);
            return ResponseEntity.ok(episodes);
            
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}