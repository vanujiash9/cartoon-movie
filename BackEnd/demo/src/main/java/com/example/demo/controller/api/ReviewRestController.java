package com.example.demo.controller.api;

import com.example.demo.entity.Review;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.demo.service.CustomUserDetails;
import com.example.demo.dto.ReviewDTO;
import com.example.demo.service.ReviewLikeService;
import com.example.demo.entity.ReviewLike;
import com.example.demo.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/all")
public class ReviewRestController {
    @Autowired
    private ReviewService reviewService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ReviewLikeService reviewLikeService;
    @Autowired
    private ReviewRepository reviewRepository;

    // Danh sách từ cấm (có thể mở rộng)
    private static final List<String> BAD_WORDS = Arrays.asList("đm", "cc", "vcl", "cl", "shit", "fuck");

    @GetMapping
    public List<ReviewDTO> getAll() {
        List<Review> reviews = reviewService.getAll();
        return reviews.stream().map(review -> {
            ReviewDTO dto = new ReviewDTO();
            dto.setId(review.getId());
            dto.setUsername(review.getUsername());
            // Lấy role user từ username
            User user = userRepository.findByUsername(review.getUsername());
            dto.setUserRole(user != null ? user.getRole() : null);
            dto.setContent(review.getContent());
            dto.setRating(review.getRating());
            dto.setCreatedAt(review.getCreated_at());
            if (review.getCartoon() != null) {
                dto.setCartoonId(review.getCartoon().getId());
                dto.setCartoonTitle(review.getCartoon().getTitle());
            }
            return dto;
        }).toList();
    }

    @PostMapping
    public Object createReview(@RequestBody Review review, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername());
        if (user == null) throw new RuntimeException("User not found");
        // Kiểm tra cấm bình luận
        if (user.getBanCommentUntil() != null && user.getBanCommentUntil().isAfter(LocalDateTime.now())) {
            return new org.springframework.http.ResponseEntity<>(
                "Bạn đã bị cấm bình luận đến " + user.getBanCommentUntil(),
                org.springframework.http.HttpStatus.FORBIDDEN
            );
        }
        // Kiểm tra từ bậy bạ
        String content = review.getContent().toLowerCase();
        for (String bad : BAD_WORDS) {
            if (content.contains(bad)) {
                user.setBanCommentUntil(LocalDateTime.now().plusHours(1));
                userRepository.save(user);
                return new org.springframework.http.ResponseEntity<>(
                    "Bình luận chứa từ ngữ không phù hợp. Bạn bị cấm bình luận 1 tiếng!",
                    org.springframework.http.HttpStatus.FORBIDDEN
                );
            }
        }
        review.setUsername(user.getUsername());
        review.setCreated_at(LocalDateTime.now());
        Review saved = reviewService.create(review);
        // Trả về ReviewDTO
        ReviewDTO dto = new ReviewDTO();
        dto.setId(saved.getId());
        dto.setUsername(saved.getUsername());
        dto.setUserRole(user.getRole());
        dto.setContent(saved.getContent());
        dto.setRating(saved.getRating());
        dto.setCreatedAt(saved.getCreated_at());
        if (saved.getCartoon() != null) {
            dto.setCartoonId(saved.getCartoon().getId());
            dto.setCartoonTitle(saved.getCartoon().getTitle());
        }
        return dto;
    }

    // API like/dislike review
    @PostMapping("/review/{reviewId}/like")
    public ResponseEntity<?> likeReview(@PathVariable Integer reviewId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để like review");
        }
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (user == null || review == null) return ResponseEntity.badRequest().body("Không tìm thấy user hoặc review");
        reviewLikeService.likeOrDislikeReview(user, review, true);
        return ResponseEntity.ok("Đã like review");
    }

    @PostMapping("/review/{reviewId}/dislike")
    public ResponseEntity<?> dislikeReview(@PathVariable Integer reviewId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Bạn cần đăng nhập để dislike review");
        }
        String username = auth.getName();
        User user = userRepository.findByUsername(username);
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (user == null || review == null) return ResponseEntity.badRequest().body("Không tìm thấy user hoặc review");
        reviewLikeService.likeOrDislikeReview(user, review, false);
        return ResponseEntity.ok("Đã dislike review");
    }

    // API lấy tổng số like/dislike của review
    @GetMapping("/review/{reviewId}/like-count")
    public ResponseEntity<?> getLikeCount(@PathVariable Integer reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) return ResponseEntity.badRequest().body("Không tìm thấy review");
        int likes = reviewLikeService.countLikes(review);
        int dislikes = reviewLikeService.countDislikes(review);
        return ResponseEntity.ok(java.util.Map.of("likes", likes, "dislikes", dislikes));
    }
}