package com.example.demo.controller.admin;

import com.example.demo.service.CartoonService;
import com.example.demo.service.CommentService;
import com.example.demo.service.EpisodeService;
import com.example.demo.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminDashboardController {
    
    private final CartoonService cartoonService;
    private final CommentService commentService;
    private final EpisodeService episodeService;
    private final UserService userService;
    
    public AdminDashboardController(CartoonService cartoonService, CommentService commentService, EpisodeService episodeService, UserService userService) {
        this.cartoonService = cartoonService;
        this.commentService = commentService;
        this.episodeService = episodeService;
        this.userService = userService;
    }
    
    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("activePage", "dashboard");
        model.addAttribute("totalMovies", cartoonService.getAll().size());
        model.addAttribute("totalReviews", commentService.getAll().size()); // tổng comment
        model.addAttribute("totalEpisodes", episodeService.getAll().size());
        model.addAttribute("averageRating", commentService.getAverageRating());
        model.addAttribute("activeMoviesCount", cartoonService.countActiveMovies());
        model.addAttribute("comingSoonMoviesCount", cartoonService.countComingSoonMovies());
        model.addAttribute("inactiveMoviesCount", cartoonService.countInactiveMovies());
        model.addAttribute("latestReviews", commentService.getLatestComments(3));
        model.addAttribute("reviewsThisMonth", commentService.countCommentsInCurrentMonth());
        model.addAttribute("totalUsers", userService.getAll().size());
        model.addAttribute("latestUsers", userService.getLatestUsers(3));
        return "admin"; // Tên file template admin.html
    }
}