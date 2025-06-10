package com.example.demo.controller.api;

import com.example.demo.entity.Reply;
import com.example.demo.entity.User;
import com.example.demo.entity.Review;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.service.ReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.demo.service.CustomUserDetails;
import com.example.demo.dto.ReplyDTO;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/replies")
public class ReplyRestController {
    @Autowired
    private ReplyService replyService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/review/{reviewId}")
    public List<ReplyDTO> getByReview(@PathVariable Integer reviewId) {
        List<Reply> replies = replyService.getByReviewId(reviewId);
        return replies.stream().map(reply -> {
            ReplyDTO dto = new ReplyDTO();
            dto.setId(reply.getId());
            dto.setUsername(reply.getUser() != null ? reply.getUser().getUsername() : null);
            dto.setUserRole(reply.getUser() != null ? reply.getUser().getRole() : null);
            dto.setContent(reply.getContent());
            dto.setCreatedAt(reply.getCreatedAt());
            dto.setReviewId(reply.getReview() != null ? reply.getReview().getId() : null);
            return dto;
        }).toList();
    }

    @PostMapping
    public ReplyDTO createReply(@RequestBody Reply reply, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername());
        if (user == null) throw new RuntimeException("User not found");
        reply.setUser(user);
        reply.setCreatedAt(LocalDateTime.now());
        // Đảm bảo review tồn tại
        Review review = reviewRepository.findById(reply.getReview().getId()).orElseThrow();
        reply.setReview(review);
        Reply saved = replyService.create(reply);
        // Trả về ReplyDTO
        ReplyDTO dto = new ReplyDTO();
        dto.setId(saved.getId());
        dto.setUsername(user.getUsername());
        dto.setUserRole(user.getRole());
        dto.setContent(saved.getContent());
        dto.setCreatedAt(saved.getCreatedAt());
        dto.setReviewId(review.getId());
        return dto;
    }
}
