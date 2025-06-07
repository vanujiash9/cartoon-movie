package com.example.demo.service;

import com.example.demo.entity.Review;
import com.example.demo.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);
    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getAll() {
        logger.info("ReviewService.getAll() called");
        List<Review> reviews = reviewRepository.findAllWithCartoon();
        logger.info("ReviewService.getAll() returned {} reviews", reviews.size());
        
        // Log first few reviews for debugging
        for (int i = 0; i < Math.min(3, reviews.size()); i++) {
            Review review = reviews.get(i);
            logger.info("Review {}: ID={}, user={}, cartoon={}", 
                       i, review.getId(), review.getUsername(), 
                       review.getCartoon() != null ? review.getCartoon().getTitle() : "NULL");
        }
        
        return reviews;
    }

    public Optional<Review> getById(Integer id) {
        return reviewRepository.findById(id);
    }

    public List<Review> getByCartoonId(Integer cartoonId) {
        return reviewRepository.findByCartoonId(cartoonId);
    }

    public Review create(Review review) {
        return reviewRepository.save(review);
    }

    public Review update(Integer id, Review review) {
        review.setId(id);
        return reviewRepository.save(review);
    }

    public void delete(Integer id) {
        reviewRepository.deleteById(id);
    }

    public double getAverageRating() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);
    }
}
