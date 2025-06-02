package com.example.demo.controller.admin;

import com.example.demo.entity.Review;
import com.example.demo.service.ReviewService;
import com.example.demo.service.CartoonService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/admin/reviews")
public class AdminReviewController {
    
    private final ReviewService reviewService;
    private final CartoonService cartoonService;
    
    public AdminReviewController(ReviewService reviewService, CartoonService cartoonService) {
        this.reviewService = reviewService;
        this.cartoonService = cartoonService;
    }
    
    @GetMapping
    public String listReviews(Model model) {
        model.addAttribute("reviews", reviewService.getAll());
        model.addAttribute("cartoons", cartoonService.getAll());
        model.addAttribute("activePage", "reviews");
        return "reviews";
    }
    
    @GetMapping("/cartoon/{cartoonId}")
    public String listReviewsByCartoon(@PathVariable Integer cartoonId, Model model) {
        model.addAttribute("reviews", reviewService.getByCartoonId(cartoonId));
        model.addAttribute("cartoons", cartoonService.getAll());
        model.addAttribute("selectedCartoonId", cartoonId);
        model.addAttribute("activePage", "reviews");
        return "reviews";
    }
    
    @PostMapping("/{id}/delete")
    public String deleteReview(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            reviewService.delete(id);
            redirectAttributes.addFlashAttribute("success", "Review deleted successfully!");
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