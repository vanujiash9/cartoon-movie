package com.example.demo.controller.api;

import com.example.demo.entity.Review;
import com.example.demo.service.ReviewService;
import com.example.demo.service.CartoonService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private final ReviewService reviewService;
    private final CartoonService cartoonService;
    
    public ReviewController(ReviewService reviewService, CartoonService cartoonService) {
        this.reviewService = reviewService;
        this.cartoonService = cartoonService;
    }
    
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        List<Review> reviews = reviewService.getAll();
        return ResponseEntity.ok(reviews);
    }
    
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @GetMapping("/cartoon/{cartoonId}")
    public ResponseEntity<List<Review>> getReviewsByCartoonId(@PathVariable Integer cartoonId) {
        try {
            // Verify cartoon exists
            cartoonService.getById(cartoonId)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + cartoonId));
            
            List<Review> reviews = reviewService.getByCartoonId(cartoonId);
            return ResponseEntity.ok(reviews);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        try {
            // Set created time
            review.setCreated_at(LocalDateTime.now());
            
            Review savedReview = reviewService.create(review);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer id) {
        try {
            reviewService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/average-rating/cartoon/{cartoonId}")
    public ResponseEntity<Double> getAverageRatingByCartoon(@PathVariable Integer cartoonId) {
        try {
            // Verify cartoon exists
            cartoonService.getById(cartoonId)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + cartoonId));
            
            List<Review> reviews = reviewService.getByCartoonId(cartoonId);
            double averageRating = reviews.stream()
                    .mapToDouble(Review::getRating)
                    .average()
                    .orElse(0.0);
            
            return ResponseEntity.ok(averageRating);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        try {
            List<Review> reviews = reviewService.getAll();
            return ResponseEntity.ok("Database connection OK. Found " + reviews.size() + " reviews.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Database error: " + e.getMessage());
        }
    }
}
