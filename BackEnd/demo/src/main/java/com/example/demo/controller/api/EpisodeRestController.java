package com.example.demo.controller.api;

import com.example.demo.entity.Episode;
import com.example.demo.service.EpisodeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/episodes")
public class EpisodeRestController {
    private final EpisodeService episodeService;
    public EpisodeRestController(EpisodeService episodeService) {
        this.episodeService = episodeService;
    }

    @GetMapping
    public List<Episode> getAll() { return episodeService.getAll(); }

    @GetMapping("/{id}")
    public Episode getById(@PathVariable Integer id) { return episodeService.getById(id).orElse(null); }

    @GetMapping("/cartoon/{cartoonId}")
    public List<Episode> getByCartoonId(@PathVariable Integer cartoonId) { return episodeService.getByCartoonId(cartoonId); }

    @PostMapping
    public Episode create(@RequestBody Episode episode) { return episodeService.create(episode); }

    @PutMapping("/{id}")
    public Episode update(@PathVariable Integer id, @RequestBody Episode episode) { return episodeService.update(id, episode); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) { episodeService.delete(id); }
}
