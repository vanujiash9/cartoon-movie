package com.example.demo.repository;

import com.example.demo.entity.ReviewLike;
import com.example.demo.entity.Review;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Integer> {
    Optional<ReviewLike> findByReviewAndUser(Review review, User user);
    List<ReviewLike> findByReview(Review review);
    int countByReviewAndLiked(Review review, boolean liked);
}
