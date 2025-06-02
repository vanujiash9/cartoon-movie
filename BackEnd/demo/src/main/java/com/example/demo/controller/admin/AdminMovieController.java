package com.example.demo.controller.admin;

import com.example.demo.entity.Cartoon;
import com.example.demo.service.CartoonService;
import com.example.demo.service.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/admin/movies")
public class AdminMovieController {

    private final ReviewService reviewService;
    
    private static final Logger logger = LoggerFactory.getLogger(AdminMovieController.class);
    private final CartoonService cartoonService;
    
    public AdminMovieController(CartoonService cartoonService, ReviewService reviewService) {
        this.cartoonService = cartoonService;
        this.reviewService = reviewService;
    }
    
    @GetMapping
    public String listMovies(Model model) {
        try {
            List<Cartoon> cartoons = cartoonService.getAll();
            model.addAttribute("cartoons", cartoons);
            model.addAttribute("activePage", "movies");
            return "movies";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Unable to load movies: " + e.getMessage());
            return "error";
        }
    }
    
    @GetMapping("/new")
    public String showCreateForm(Model model) {
        model.addAttribute("cartoon", new Cartoon());
        model.addAttribute("isEdit", false);
        model.addAttribute("activePage", "movies");
        return "movie-form";
    }
    
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Integer id, Model model, RedirectAttributes redirectAttributes) {
        try {
            Cartoon cartoon = cartoonService.getById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + id));
            model.addAttribute("cartoon", cartoon);
            model.addAttribute("isEdit", true);
            model.addAttribute("activePage", "movies");
            return "movie-form";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", "Movie not found!");
            return "redirect:/admin/movies";
        }
    }
    
    @PostMapping
    public String createMovie(@ModelAttribute Cartoon cartoon, RedirectAttributes redirectAttributes) {
        try {
            cartoon.setCreatedAt(LocalDateTime.now());
            cartoonService.create(cartoon);
            redirectAttributes.addFlashAttribute("success", "Movie added successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to add movie: " + e.getMessage());
        }
        return "redirect:/admin/movies";
    }
    
    @PostMapping("/{id}")
    public String updateMovie(@PathVariable Integer id, @ModelAttribute Cartoon cartoon, RedirectAttributes redirectAttributes) {
        try {
            cartoonService.update(id, cartoon);
            redirectAttributes.addFlashAttribute("success", "Movie updated successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to update movie: " + e.getMessage());
        }
        return "redirect:/admin/movies";
    }
    
    @PostMapping("/{id}/delete")
    public String deleteMovie(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            cartoonService.delete(id);
            redirectAttributes.addFlashAttribute("success", "Movie deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete movie: " + e.getMessage());
        }
        return "redirect:/admin/movies";
    }
    
    @GetMapping("/episodes/{id}")
    public String manageEpisodes(@PathVariable Integer id, Model model, RedirectAttributes redirectAttributes) {
        try {
            Cartoon cartoon = cartoonService.getById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + id));
            model.addAttribute("cartoon", cartoon);
            model.addAttribute("activePage", "episodes");
            return "episodes";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", "Movie not found!");
            return "redirect:/admin/movies";
        }
    }
    
    @GetMapping("/reviews")
    public String viewReviews(@RequestParam Integer cartoonId, Model model, RedirectAttributes redirectAttributes) {
        try {
            Cartoon cartoon = cartoonService.getById(cartoonId)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + cartoonId));
            model.addAttribute("cartoon", cartoon);
            model.addAttribute("reviews", reviewService.getByCartoonId(cartoonId));
            model.addAttribute("activePage", "reviews");
            return "reviews";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", "Movie not found!");
            return "redirect:/admin/movies";
        }
    }
}