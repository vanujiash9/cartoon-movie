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
    public String listMovies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String sort,
            Model model) {
        try {
            List<Cartoon> cartoons = cartoonService.searchAndFilter(keyword, year, genre, sort);
            model.addAttribute("cartoons", cartoons);
            model.addAttribute("param", new org.springframework.util.LinkedMultiValueMap<String, String>() {{
                add("keyword", keyword);
                add("year", year);
                add("genre", genre);
                add("sort", sort);
            }});
            model.addAttribute("activePage", "movies");
            model.addAttribute("years", cartoonService.getAllYears());
            model.addAttribute("genres", cartoonService.getAllGenres());
            model.addAttribute("totalMovies", cartoons.size());
            return "movies";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Unable to load movies: " + e.getMessage());
            return "error";
        }
    }
    
    @GetMapping("/new")
    public String showCreateForm(RedirectAttributes redirectAttributes) {
        // Since we're using modal in movies.html, redirect to movies page
        return "redirect:/admin/movies";
    }
    
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            // Verify movie exists
            Cartoon cartoon = cartoonService.getById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + id));
            // Since we're using modal in movies.html, redirect to movies page
            return "redirect:/admin/movies";
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
    
    @PutMapping("/{id}")
    public String updateMoviePut(@PathVariable Integer id, @ModelAttribute Cartoon cartoon, RedirectAttributes redirectAttributes) {
        return updateMovie(id, cartoon, redirectAttributes);
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
            
            // Add necessary attributes for episodes template
            model.addAttribute("cartoon", cartoon);
            model.addAttribute("cartoonId", id);
            model.addAttribute("cartoonTitle", cartoon.getTitle());
            model.addAttribute("episodes", cartoon.getEpisodes());
            model.addAttribute("episode", new com.example.demo.entity.Episode()); // For the form
            model.addAttribute("activePage", "episodes");
            
            return "episodes";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", "Movie not found!");
            return "redirect:/admin/movies";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error loading episodes: " + e.getMessage());
            return "redirect:/admin/movies";
        }
    }
    
    @GetMapping("/reviews")
    public String viewReviews(@RequestParam Integer cartoonId, RedirectAttributes redirectAttributes) {
        // Redirect to the dedicated review controller with cartoon filter
        return "redirect:/admin/reviews/cartoon/" + cartoonId;
    }
}