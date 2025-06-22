package com.example.demo.controller.admin;

import com.example.demo.entity.Episode;
import com.example.demo.entity.Cartoon;
import com.example.demo.service.EpisodeService;
import com.example.demo.service.CartoonService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/admin")
public class AdminEpisodeController {
    
    private final EpisodeService episodeService;
    private final CartoonService cartoonService;
    
    public AdminEpisodeController(EpisodeService episodeService, CartoonService cartoonService) {
        this.episodeService = episodeService;
        this.cartoonService = cartoonService;
    }
    
    @GetMapping("/episodes-overview")
    public String episodesOverview(Model model) {
        try {
            List<Cartoon> cartoons = cartoonService.getAll();
            List<Episode> episodes = episodeService.getAll();
            
            model.addAttribute("cartoons", cartoons);
            model.addAttribute("episodes", episodes);
            model.addAttribute("episode", new Episode());
            model.addAttribute("activePage", "episodes");
            model.addAttribute("cartoonTitle", "All Cartoons");
            model.addAttribute("cartoonId", "");
            
            return "episodes"; // Sử dụng template episodes.html
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Error loading episodes: " + e.getMessage());
            model.addAttribute("cartoons", new ArrayList<>());
            model.addAttribute("episodes", new ArrayList<>());
            model.addAttribute("episode", new Episode());
            model.addAttribute("activePage", "episodes");
            model.addAttribute("cartoonTitle", "All Cartoons");
            model.addAttribute("cartoonId", "");
            return "episodes";
        }
    }
    
    @GetMapping("/episodes")
    public String listEpisodes(Model model) {
        return episodesOverview(model); // Sử dụng cùng logic
    }
    
    @GetMapping("/episodes/add/{cartoonId}")
    public String addEpisodeForm(@PathVariable Integer cartoonId, Model model) {
        try {
            Optional<Cartoon> cartoonOpt = cartoonService.getById(cartoonId);
            if (!cartoonOpt.isPresent()) {
                model.addAttribute("error", "Cartoon not found with ID: " + cartoonId);
                return "redirect:/admin/episodes-overview";
            }
            
            Cartoon cartoon = cartoonOpt.get();
            List<Episode> episodes = episodeService.getByCartoonId(cartoonId);
            
            model.addAttribute("cartoonId", cartoonId);
            model.addAttribute("cartoonTitle", cartoon.getTitle());
            model.addAttribute("episode", new Episode());
            model.addAttribute("episodes", episodes);
            model.addAttribute("cartoons", cartoonService.getAll());
            model.addAttribute("activePage", "episodes");
            
            return "episodes";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Error loading episode form: " + e.getMessage());
            return "redirect:/admin/episodes-overview";
        }
    }

    @PostMapping("/episodes/add/{cartoonId}")
    public String addEpisode(@PathVariable Integer cartoonId, @ModelAttribute Episode episode, RedirectAttributes redirectAttributes) {
        try {
            Optional<Cartoon> cartoonOpt = cartoonService.getById(cartoonId);
            if (!cartoonOpt.isPresent()) {
                redirectAttributes.addFlashAttribute("error", "Cartoon not found with ID: " + cartoonId);
                return "redirect:/admin/episodes-overview";
            }
            
            episode.setCartoon(cartoonOpt.get());
            episode.setCreated_at(LocalDateTime.now());
            episodeService.create(episode);
            
            redirectAttributes.addFlashAttribute("message", "Episode added successfully!");
            return "redirect:/admin/episodes/add/" + cartoonId;
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to add episode: " + e.getMessage());
            return "redirect:/admin/episodes/add/" + cartoonId;
        }
    }

    @GetMapping("/episodes/edit/{cartoonId}/{id}")
    public String editEpisodeForm(@PathVariable Integer cartoonId, @PathVariable Integer id, Model model) {
        try {
            Optional<Episode> episodeOpt = episodeService.getById(id);
            Optional<Cartoon> cartoonOpt = cartoonService.getById(cartoonId);
            
            if (!episodeOpt.isPresent() || !cartoonOpt.isPresent()) {
                model.addAttribute("error", "Episode or Cartoon not found");
                return "redirect:/admin/episodes-overview";
            }
            
            Episode episode = episodeOpt.get();
            Cartoon cartoon = cartoonOpt.get();
            
            model.addAttribute("episode", episode);
            model.addAttribute("cartoonId", cartoonId);
            model.addAttribute("cartoonTitle", cartoon.getTitle());
            model.addAttribute("episodes", episodeService.getByCartoonId(cartoonId));
            model.addAttribute("cartoons", cartoonService.getAll());
            model.addAttribute("activePage", "episodes");
            
            return "episodes";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Error loading episode: " + e.getMessage());
            return "redirect:/admin/episodes-overview";
        }
    }

    @PostMapping("/episodes/edit/{cartoonId}/{id}")
    public String editEpisode(@PathVariable Integer cartoonId, @PathVariable Integer id, @ModelAttribute Episode episode, RedirectAttributes redirectAttributes) {
        try {
            Optional<Cartoon> cartoonOpt = cartoonService.getById(cartoonId);
            if (!cartoonOpt.isPresent()) {
                redirectAttributes.addFlashAttribute("error", "Cartoon not found");
                return "redirect:/admin/episodes-overview";
            }
            
            episode.setId(id);
            episode.setCartoon(cartoonOpt.get());
            episodeService.update(id, episode);
            
            redirectAttributes.addFlashAttribute("message", "Episode updated successfully!");
            return "redirect:/admin/episodes/add/" + cartoonId;
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to update episode: " + e.getMessage());
            return "redirect:/admin/episodes/add/" + cartoonId;
        }
    }

    @GetMapping("/episodes/delete/{cartoonId}/{id}")
    public String deleteEpisode(@PathVariable Integer cartoonId, @PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            episodeService.delete(id);
            redirectAttributes.addFlashAttribute("message", "Episode deleted successfully!");
            return "redirect:/admin/episodes/add/" + cartoonId;
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to delete episode: " + e.getMessage());
            return "redirect:/admin/episodes/add/" + cartoonId;
        }
    }

    @PostMapping("/episodes/delete/{cartoonId}/{id}")
    public String deleteEpisodePost(@PathVariable Integer cartoonId, @PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            episodeService.delete(id);
            redirectAttributes.addFlashAttribute("message", "Episode deleted successfully!");
            return "redirect:/admin/episodes/add/" + cartoonId;
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to delete episode: " + e.getMessage());
            return "redirect:/admin/episodes/add/" + cartoonId;
        }
    }
}