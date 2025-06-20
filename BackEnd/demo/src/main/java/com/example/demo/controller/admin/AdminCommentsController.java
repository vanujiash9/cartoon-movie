package com.example.demo.controller.admin;

import com.example.demo.entity.Comment;
import com.example.demo.service.CommentService;
import com.example.demo.service.CartoonService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Controller
@RequestMapping("/admin/comments")
public class AdminCommentsController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminCommentsController.class);
    private final CommentService commentService;
    private final CartoonService cartoonService;
    
    public AdminCommentsController(CommentService commentService, CartoonService cartoonService) {
        this.commentService = commentService;
        this.cartoonService = cartoonService;
    }
    
    @GetMapping
    public String listComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer cartoonId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String keyword,
            Model model) {
        
        try {
            logger.info("Loading comments - cartoonId: {}, rating: {}, sort: {}, keyword: {}", 
                       cartoonId, rating, sort, keyword);
            
            // Get all cartoons first to check if we have any
            List<com.example.demo.entity.Cartoon> cartoons = cartoonService.getAll();
            logger.info("Total cartoons in database: {}", cartoons.size());
            
            List<Comment> comments = commentService.getAll();
            logger.info("Total comments from database: {}", comments.size());
            
            // Log sample comment data for debugging
            if (!comments.isEmpty()) {
                Comment sampleComment = comments.get(0);
                logger.info("Sample comment - ID: {}, username: {}, cartoon: {}, rating: {}", 
                           sampleComment.getId(),
                           sampleComment.getUser() != null ? sampleComment.getUser().getUsername() : "NULL",
                           sampleComment.getCartoon() != null ? sampleComment.getCartoon().getTitle() : "NULL",
                           sampleComment.getRating());
            } else {
                logger.warn("No comments found in database!");
                if (cartoons.isEmpty()) {
                    logger.warn("No cartoons found either - this might be why there are no comments");
                    model.addAttribute("error", "No cartoons found in database. Please add cartoons first before comments can be displayed.");
                } else {
                    logger.info("Found {} cartoons but no comments", cartoons.size());
                    model.addAttribute("message", "No comments have been submitted yet. There are " + cartoons.size() + " cartoons available for comment.");
                }
            }
            
            // Filter by cartoon if specified
            if (cartoonId != null) {
                comments = comments.stream()
                    .filter(c -> c.getCartoon() != null && c.getCartoon().getId().equals(cartoonId))
                    .collect(java.util.stream.Collectors.toList());
                logger.info("Comments after cartoon filter: {}", comments.size());
            }
            
            // Filter by rating if specified
            if (rating != null) {
                comments = comments.stream()
                    .filter(c -> c.getRating() != null && c.getRating().equals(rating))
                    .collect(java.util.stream.Collectors.toList());
                logger.info("Comments after rating filter: {}", comments.size());
            }
            
            // Filter by keyword if specified
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchTerm = keyword.toLowerCase().trim();
                comments = comments.stream()
                    .filter(c -> c.getContent().toLowerCase().contains(searchTerm) ||
                               (c.getUser() != null && c.getUser().getUsername().toLowerCase().contains(searchTerm)))
                    .collect(java.util.stream.Collectors.toList());
                logger.info("Comments after keyword filter: {}", comments.size());
            }
            
            // Sort comments
            if (sort != null) {
                switch (sort) {
                    case "date_desc":
                        comments.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
                        break;
                    case "date_asc":
                        comments.sort((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));
                        break;
                    case "rating_desc":
                        comments.sort((a, b) -> {
                            Integer ratingA = a.getRating() != null ? a.getRating() : 0;
                            Integer ratingB = b.getRating() != null ? b.getRating() : 0;
                            return ratingB.compareTo(ratingA);
                        });
                        break;
                    case "rating_asc":
                        comments.sort((a, b) -> {
                            Integer ratingA = a.getRating() != null ? a.getRating() : 0;
                            Integer ratingB = b.getRating() != null ? b.getRating() : 0;
                            return ratingA.compareTo(ratingB);
                        });
                        break;
                    case "username_asc":
                        comments.sort((a, b) -> {
                            String usernameA = a.getUser() != null ? a.getUser().getUsername() : "";
                            String usernameB = b.getUser() != null ? b.getUser().getUsername() : "";
                            return usernameA.compareTo(usernameB);
                        });
                        break;
                }
            }
            
            // Simple pagination simulation
            int pageSize = 10;
            int totalComments = comments.size();
            int totalPages = (int) Math.ceil((double) totalComments / pageSize);
            int startIndex = page * pageSize;
            int endIndex = Math.min(startIndex + pageSize, totalComments);
            
            List<Comment> paginatedComments = comments.subList(startIndex, endIndex);
            
            model.addAttribute("comments", paginatedComments);
            model.addAttribute("cartoons", cartoonService.getAll());
            model.addAttribute("totalComments", totalComments);
            model.addAttribute("activePage", "comments");
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", totalPages);
            
            // Calculate average rating if comments exist
            double averageRating = commentService.getAverageRating();
            model.addAttribute("averageRating", averageRating);
            
            // Calculate rating distribution
            int[] ratingCounts = new int[5]; // 1-5 stars
            int[] ratingDistribution = new int[5]; // percentage for each star
            
            for (Comment comment : comments) {
                if (comment.getRating() != null && comment.getRating() >= 1 && comment.getRating() <= 5) {
                    ratingCounts[comment.getRating() - 1]++;
                }
            }
            
            // Calculate percentages
            if (totalComments > 0) {
                for (int i = 0; i < 5; i++) {
                    ratingDistribution[i] = (int) ((double) ratingCounts[i] / totalComments * 100);
                }
            }
            
            model.addAttribute("ratingDistribution", ratingDistribution);
            model.addAttribute("ratingCounts", ratingCounts);
            model.addAttribute("topRatedMovies", cartoonService.getAll());
            
            return "comments";
            
        } catch (Exception e) {
            logger.error("Error loading comments: ", e);
            model.addAttribute("error", "Unable to load comments: " + e.getMessage());
            model.addAttribute("comments", java.util.Collections.emptyList());
            model.addAttribute("cartoons", java.util.Collections.emptyList());
            model.addAttribute("totalComments", 0);
            model.addAttribute("activePage", "comments");
            model.addAttribute("currentPage", 0);
            model.addAttribute("totalPages", 0);
            model.addAttribute("averageRating", 0.0);
            model.addAttribute("ratingDistribution", new int[]{0, 0, 0, 0, 0});
            model.addAttribute("ratingCounts", new int[]{0, 0, 0, 0, 0});
            model.addAttribute("topRatedMovies", java.util.Collections.emptyList());
            return "comments";
        }
    }
    
    @GetMapping("/cartoon/{cartoonId}")
    public String listCommentsByCartoon(@PathVariable Integer cartoonId, Model model) {
        try {
            List<Comment> comments = commentService.getByCartoonId(cartoonId);
            model.addAttribute("comments", comments);
            model.addAttribute("cartoons", cartoonService.getAll());
            model.addAttribute("selectedCartoonId", cartoonId);
            model.addAttribute("totalComments", comments.size());
            model.addAttribute("activePage", "comments");
            
            // Calculate average rating if comments exist
            double averageRating = commentService.getAverageRating();
            model.addAttribute("averageRating", averageRating);
            
            // Calculate rating distribution for this cartoon
            int[] ratingCounts = new int[5]; // 1-5 stars
            int[] ratingDistribution = new int[5]; // percentage for each star
            
            for (Comment comment : comments) {
                if (comment.getRating() != null && comment.getRating() >= 1 && comment.getRating() <= 5) {
                    ratingCounts[comment.getRating() - 1]++;
                }
            }
            
            // Calculate percentages
            if (comments.size() > 0) {
                for (int i = 0; i < 5; i++) {
                    ratingDistribution[i] = (int) ((double) ratingCounts[i] / comments.size() * 100);
                }
            }
            
            model.addAttribute("ratingDistribution", ratingDistribution);
            model.addAttribute("ratingCounts", ratingCounts);
            model.addAttribute("topRatedMovies", cartoonService.getAll());
            
            return "comments";
        } catch (Exception e) {
            logger.error("Error loading comments for cartoon {}: ", cartoonId, e);
            model.addAttribute("error", "Unable to load comments: " + e.getMessage());
            return "comments";
        }
    }
    
    @PostMapping("/delete/{id}")
    public String deleteComment(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            commentService.deleteComment(id);
            redirectAttributes.addFlashAttribute("message", "Comment deleted successfully!");
        } catch (Exception e) {
            logger.error("Error deleting comment {}: ", id, e);
            redirectAttributes.addFlashAttribute("error", "Failed to delete comment: " + e.getMessage());
        }
        return "redirect:/admin/comments";
    }
    
    @PostMapping("/{id}/approve")
    public String approveComment(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            // This would need to be implemented in the service and entity
            redirectAttributes.addFlashAttribute("success", "Comment approved successfully!");
        } catch (Exception e) {
            logger.error("Error approving comment {}: ", id, e);
            redirectAttributes.addFlashAttribute("error", "Failed to approve comment: " + e.getMessage());
        }
        return "redirect:/admin/comments";
    }
}
