package com.example.demo.controller;

import com.example.demo.entity.Cartoon;
import com.example.demo.entity.Review;
import com.example.demo.repository.CartoonRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.ReviewLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cartoons")
public class CartoonController {
    @Autowired
    private CartoonRepository cartoonRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ReviewLikeRepository reviewLikeRepository;



    // Lấy danh sách bình luận theo id phim
    @GetMapping("/{id}/reviews")
    public List<Review> getReviews(@PathVariable Integer id) {
        return reviewRepository.findByCartoonId(id);
    }

    // Lấy tổng số lượt thích của tất cả review thuộc phim
    @GetMapping("/{id}/likes")
    public int getLikes(@PathVariable Integer id) {
        List<Review> reviews = reviewRepository.findByCartoonId(id);
        int totalLikes = 0;
        for (Review review : reviews) {
            totalLikes += reviewLikeRepository.countByReviewAndLiked(review, true);
        }
        return totalLikes;
    }
}
