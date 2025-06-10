package com.example.demo.controller.api;

import com.example.demo.entity.Episode;
import com.example.demo.service.EpisodeService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/episodes")
public class EpisodeRestController {
    private final EpisodeService episodeService;
    public EpisodeRestController(EpisodeService episodeService) {
        this.episodeService = episodeService;
    }

    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @GetMapping
    public List<Episode> getAll() { return episodeService.getAll(); }

    @PreAuthorize("hasAnyRole('USER','VIP','ADMIN')")
    @GetMapping("/{id}")
    public Episode getById(@PathVariable Integer id) { return episodeService.getById(id).orElse(null); }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Episode create(@RequestBody Episode episode) { return episodeService.create(episode); }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Episode update(@PathVariable Integer id, @RequestBody Episode episode) { return episodeService.update(id, episode); }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) { episodeService.delete(id); }
}
