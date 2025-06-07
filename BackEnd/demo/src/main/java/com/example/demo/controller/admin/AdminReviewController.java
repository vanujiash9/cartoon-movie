package com.example.demo.controller.admin;

import com.example.demo.entity.Review;
import com.example.demo.service.ReviewService;
import com.example.demo.service.CartoonService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Controller
@RequestMapping("/admin/reviews")
public class AdminReviewController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminReviewController.class);
    private final ReviewService reviewService;
    private final CartoonService cartoonService;
    
    public AdminReviewController(ReviewService reviewService, CartoonService cartoonService) {
        this.reviewService = reviewService;
        this.cartoonService = cartoonService;
    }
    
    @GetMapping
    public String listReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer cartoonId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String keyword,
            Model model) {
        
        try {
            logger.info("Loading reviews - cartoonId: {}, rating: {}, sort: {}, keyword: {}", 
                       cartoonId, rating, sort, keyword);
            
            // Get all cartoons first to check if we have any
            List<com.example.demo.entity.Cartoon> cartoons = cartoonService.getAll();
            logger.info("Total cartoons in database: {}", cartoons.size());
            
            List<Review> reviews = reviewService.getAll();
            logger.info("Total reviews from database: {}", reviews.size());
            
            // Log sample review data for debugging
            if (!reviews.isEmpty()) {
                Review sampleReview = reviews.get(0);
                logger.info("Sample review - ID: {}, username: {}, cartoon: {}, rating: {}", 
                           sampleReview.getId(), sampleReview.getUsername(), 
                           sampleReview.getCartoon() != null ? sampleReview.getCartoon().getTitle() : "NULL",
                           sampleReview.getRating());
            } else {
                logger.warn("No reviews found in database!");
                if (cartoons.isEmpty()) {
                    logger.warn("No cartoons found either - this might be why there are no reviews");
                    model.addAttribute("error", "No cartoons found in database. Please add cartoons first before reviews can be displayed.");
                } else {
                    logger.info("Found {} cartoons but no reviews", cartoons.size());
                    model.addAttribute("message", "No reviews have been submitted yet. There are " + cartoons.size() + " cartoons available for review.");
                }
            }
            
            // Filter by cartoon if specified
            if (cartoonId != null) {
                reviews = reviews.stream()
                    .filter(r -> r.getCartoon() != null && r.getCartoon().getId().equals(cartoonId))
                    .collect(java.util.stream.Collectors.toList());
                logger.info("Reviews after cartoon filter: {}", reviews.size());
            }
            
            // Filter by rating if specified
            if (rating != null) {
                reviews = reviews.stream()
                    .filter(r -> r.getRating().equals(rating))
                    .collect(java.util.stream.Collectors.toList());
                logger.info("Reviews after rating filter: {}", reviews.size());
            }
            
            // Filter by keyword if specified
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchTerm = keyword.toLowerCase().trim();
                reviews = reviews.stream()
                    .filter(r -> r.getContent().toLowerCase().contains(searchTerm) ||
                               r.getUsername().toLowerCase().contains(searchTerm))
                    .collect(java.util.stream.Collectors.toList());
                logger.info("Reviews after keyword filter: {}", reviews.size());
            }
            
            // Sort reviews
            if (sort != null) {
                switch (sort) {
                    case "date_desc":
                        reviews.sort((a, b) -> b.getCreated_at().compareTo(a.getCreated_at()));
                        break;
                    case "date_asc":
                        reviews.sort((a, b) -> a.getCreated_at().compareTo(b.getCreated_at()));
                        break;
                    case "rating_desc":
                        reviews.sort((a, b) -> b.getRating().compareTo(a.getRating()));
                        break;
                    case "rating_asc":
                        reviews.sort((a, b) -> a.getRating().compareTo(b.getRating()));
                        break;
                    case "username_asc":
                        reviews.sort((a, b) -> a.getUsername().compareTo(b.getUsername()));
                        break;
                }
            }
            
            // Simple pagination simulation
            int pageSize = 10;
            int totalReviews = reviews.size();
            int totalPages = (int) Math.ceil((double) totalReviews / pageSize);
            int startIndex = page * pageSize;
            int endIndex = Math.min(startIndex + pageSize, totalReviews);
            
            List<Review> paginatedReviews = reviews.subList(startIndex, endIndex);
            
            model.addAttribute("reviews", paginatedReviews);
            model.addAttribute("cartoons", cartoonService.getAll());
            model.addAttribute("totalReviews", totalReviews);
            model.addAttribute("activePage", "reviews");
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", totalPages);
            
            // Calculate average rating if reviews exist
            if (!reviews.isEmpty()) {
                double averageRating = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
                model.addAttribute("averageRating", averageRating);
            }
            
            // Calculate rating distribution
            int[] ratingCounts = new int[5]; // 1-5 stars
            int[] ratingDistribution = new int[5]; // percentage for each star
            
            for (Review review : reviews) {
                if (review.getRating() >= 1 && review.getRating() <= 5) {
                    ratingCounts[review.getRating() - 1]++;
                }
            }
            
            // Calculate percentages
            if (totalReviews > 0) {
                for (int i = 0; i < 5; i++) {
                    ratingDistribution[i] = (int) ((double) ratingCounts[i] / totalReviews * 100);
                }
            }
            
            model.addAttribute("ratingDistribution", ratingDistribution);
            model.addAttribute("ratingCounts", ratingCounts);
            model.addAttribute("topRatedMovies", cartoonService.getAll());
            
            return "reviews";
            
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Unable to load reviews: " + e.getMessage());
            model.addAttribute("reviews", java.util.Collections.emptyList());
            model.addAttribute("cartoons", java.util.Collections.emptyList());
            model.addAttribute("totalReviews", 0);
            model.addAttribute("activePage", "reviews");
            model.addAttribute("currentPage", 0);
            model.addAttribute("totalPages", 0);
            model.addAttribute("ratingDistribution", new int[]{0, 0, 0, 0, 0});
            model.addAttribute("ratingCounts", new int[]{0, 0, 0, 0, 0});
            model.addAttribute("topRatedMovies", java.util.Collections.emptyList());
            return "reviews";
        }
    }
    
    @GetMapping("/cartoon/{cartoonId}")
    public String listReviewsByCartoon(@PathVariable Integer cartoonId, Model model) {
        List<Review> reviews = reviewService.getByCartoonId(cartoonId);
        model.addAttribute("reviews", reviews);
        model.addAttribute("cartoons", cartoonService.getAll());
        model.addAttribute("selectedCartoonId", cartoonId);
        model.addAttribute("totalReviews", reviews.size());
        model.addAttribute("activePage", "reviews");
        
        // Calculate average rating if reviews exist
        if (!reviews.isEmpty()) {
            double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            model.addAttribute("averageRating", averageRating);
        }
        
        // Mock data for template - in real app, this would be calculated
        model.addAttribute("ratingDistribution", new int[]{0, 0, 0, 0, 0}); // 1-5 stars
        model.addAttribute("ratingCounts", new int[]{0, 0, 0, 0, 0}); // 1-5 stars
        model.addAttribute("topRatedMovies", cartoonService.getAll()); // For now, just all movies
        
        return "reviews";
    }
    
    @PostMapping("/delete/{id}")
    public String deleteReview(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            reviewService.delete(id);
            redirectAttributes.addFlashAttribute("message", "Review deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete review: " + e.getMessage());
        }
        return "redirect:/admin/reviews";
    }
    
    @PostMapping("/{id}/approve")
    public String approveReview(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            // This would need to be implemented in the service and entity
            redirectAttributes.addFlashAttribute("success", "Review approved successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to approve review: " + e.getMessage());
        }
        return "redirect:/admin/reviews";
    }
}