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
}