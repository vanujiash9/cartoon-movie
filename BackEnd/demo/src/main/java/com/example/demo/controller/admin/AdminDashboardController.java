package com.example.demo.controller.admin;

import com.example.demo.service.CartoonService;
import com.example.demo.service.ReviewService;
import com.example.demo.service.EpisodeService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminDashboardController {
    
    private final CartoonService cartoonService;
    private final ReviewService reviewService;
    private final EpisodeService episodeService;
    
    public AdminDashboardController(CartoonService cartoonService, ReviewService reviewService, EpisodeService episodeService) {
        this.cartoonService = cartoonService;
        this.reviewService = reviewService;
        this.episodeService = episodeService;
    }
    
    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("activePage", "dashboard");
        model.addAttribute("totalMovies", cartoonService.getAll().size());
        model.addAttribute("totalReviews", reviewService.getAll().size());
        model.addAttribute("totalEpisodes", episodeService.getAll().size());
        model.addAttribute("averageRating", reviewService.getAverageRating());
        return "admin"; // Tên file template admin.html
    }
}