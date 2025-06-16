package com.example.demo.service;

import com.example.demo.entity.Review;
import com.example.demo.entity.User;
import com.example.demo.entity.ReviewLike;
import com.example.demo.repository.ReviewLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ReviewLikeService {
    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

    public void likeOrDislikeReview(User user, Review review, boolean liked) {
        Optional<ReviewLike> existing = reviewLikeRepository.findByReviewAndUser(review, user);
        if (existing.isPresent()) {
            ReviewLike rl = existing.get();
            rl.setLiked(liked);
            rl.setCreatedAt(LocalDateTime.now());
            reviewLikeRepository.save(rl);
        } else {
            ReviewLike rl = new ReviewLike();
            rl.setUser(user);
            rl.setReview(review);
            rl.setLiked(liked);
            rl.setCreatedAt(LocalDateTime.now());
            reviewLikeRepository.save(rl);
        }
    }

    public int countLikes(Review review) {
        return reviewLikeRepository.countByReviewAndLiked(review, true);
    }

    public int countDislikes(Review review) {
        return reviewLikeRepository.countByReviewAndLiked(review, false);
    }
}
