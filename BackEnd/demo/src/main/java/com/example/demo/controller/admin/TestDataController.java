package com.example.demo.controller.admin;

import com.example.demo.entity.Review;
import com.example.demo.entity.Cartoon;
import com.example.demo.service.ReviewService;
import com.example.demo.service.CartoonService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/admin/test-data")
public class TestDataController {
    
    private static final Logger logger = LoggerFactory.getLogger(TestDataController.class);
    private final ReviewService reviewService;
    private final CartoonService cartoonService;

    public TestDataController(ReviewService reviewService, CartoonService cartoonService) {
        this.reviewService = reviewService;
        this.cartoonService = cartoonService;
    }

    @PostMapping("/create-test-reviews")
    @ResponseBody
    public String createTestReviews() {
        try {
            // Get all cartoons first
            List<Cartoon> cartoons = cartoonService.getAll();
            logger.info("Found {} cartoons in database", cartoons.size());
            
            if (cartoons.isEmpty()) {
                return "No cartoons found in database. Please add cartoons first.";
            }
            
            int reviewsCreated = 0;
            
            // Create test reviews for each cartoon
            for (int i = 0; i < Math.min(3, cartoons.size()); i++) {
                Cartoon cartoon = cartoons.get(i);
                
                // Create 3 reviews per cartoon
                for (int j = 1; j <= 3; j++) {
                    Review review = new Review();
                    review.setUsername("TestUser" + j);
                    review.setContent("This is a test review #" + j + " for " + cartoon.getTitle() + ". Great movie!");
                    review.setRating(4 + (j % 2)); // Rating between 4-5
                    review.setCreated_at(LocalDateTime.now().minusDays(j));
                    review.setCartoon(cartoon);
                    
                    reviewService.create(review);
                    reviewsCreated++;
                    logger.info("Created review {} for cartoon {}", j, cartoon.getTitle());
                }
            }
            
            return "Successfully created " + reviewsCreated + " test reviews!";
            
        } catch (Exception e) {
            logger.error("Error creating test reviews", e);
            return "Error creating test reviews: " + e.getMessage();
        }
    }
    
    @GetMapping("/verify-data")
    @ResponseBody
    public String verifyData() {
        try {
            List<Review> reviews = reviewService.getAll();
            List<Cartoon> cartoons = cartoonService.getAll();
            
            StringBuilder result = new StringBuilder();
            result.append("Database Verification:\n");
            result.append("===================\n");
            result.append("Total Cartoons: ").append(cartoons.size()).append("\n");
            result.append("Total Reviews: ").append(reviews.size()).append("\n\n");
            
            if (!cartoons.isEmpty()) {
                result.append("Sample Cartoons:\n");
                for (int i = 0; i < Math.min(3, cartoons.size()); i++) {
                    Cartoon cartoon = cartoons.get(i);
                    result.append("- ID: ").append(cartoon.getId())
                          .append(", Title: ").append(cartoon.getTitle()).append("\n");
                }
                result.append("\n");
            }
            
            if (!reviews.isEmpty()) {
                result.append("Sample Reviews:\n");
                for (int i = 0; i < Math.min(5, reviews.size()); i++) {
                    Review review = reviews.get(i);
                    result.append("- ID: ").append(review.getId())
                          .append(", User: ").append(review.getUsername())
                          .append(", Rating: ").append(review.getRating())
                          .append(", Cartoon: ").append(review.getCartoon() != null ? review.getCartoon().getTitle() : "NULL")
                          .append("\n");
                }
            }
            
            return result.toString();
            
        } catch (Exception e) {
            logger.error("Error verifying data", e);
            return "Error verifying data: " + e.getMessage();
        }
    }
}
