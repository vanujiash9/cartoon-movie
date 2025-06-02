package com.example.demo.service;

import com.example.demo.entity.Review;
import com.example.demo.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getAll() {
        return reviewRepository.findAll();
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
