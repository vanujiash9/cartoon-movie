package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/admin/episodes")
public class EpisodeController {
    private final EpisodeRepository episodeRepository;
    private final CartoonRepository cartoonRepository;

    public EpisodeController(EpisodeRepository episodeRepository, CartoonRepository cartoonRepository) {
        this.episodeRepository = episodeRepository;
        this.cartoonRepository = cartoonRepository;
    }

    @GetMapping("/{cartoonId}")
    public String listEpisodes(@PathVariable Integer cartoonId, Model model) {
        model.addAttribute("episodes", episodeRepository.findByCartoonId(cartoonId));
        model.addAttribute("cartoonId", cartoonId);
        model.addAttribute("episode", new Episode());
        return "episodes";
    }

    @PostMapping("/add/{cartoonId}")
    public String addEpisode(@PathVariable Integer cartoonId, @ModelAttribute Episode episode) {
        Cartoon cartoon = cartoonRepository.findById(cartoonId).orElseThrow();
        episode.setCartoon(cartoon);
        // views và created_at sẽ tự động hoặc do DB xử lý
        episodeRepository.save(episode);
        return "redirect:/admin/episodes/" + cartoonId;
    }

    @GetMapping("/delete/{cartoonId}/{id}")
    public String deleteEpisode(@PathVariable Integer cartoonId, @PathVariable Integer id) {
        episodeRepository.deleteById(id);
        return "redirect:/admin/episodes/" + cartoonId;
    }
}