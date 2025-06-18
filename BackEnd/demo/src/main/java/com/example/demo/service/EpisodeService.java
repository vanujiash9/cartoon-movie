package com.example.demo.service;

import com.example.demo.entity.Episode;
import com.example.demo.repository.EpisodeRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EpisodeService {
    private final EpisodeRepository episodeRepository;

    public EpisodeService(EpisodeRepository episodeRepository) {
        this.episodeRepository = episodeRepository;
    }

    public List<Episode> getAll() {
        return episodeRepository.findAll();
    }

    public Optional<Episode> getById(Integer id) {
        return episodeRepository.findById(id);
    }

    public List<Episode> getByCartoonId(Integer cartoonId) {
        try {
            return episodeRepository.findByCartoonId(cartoonId);
        } catch (Exception e) {
            // Fallback to native query if JPA query fails
            System.err.println("JPA query failed, using native query: " + e.getMessage());
            return episodeRepository.findByCartoonIdNative(cartoonId);
        }
    }

    public int countByCartoonId(Integer cartoonId) {
        return episodeRepository.countByCartoonId(cartoonId);
    }

    public Episode create(Episode episode) {
        return episodeRepository.save(episode);
    }

    public Episode update(Integer id, Episode episode) {
        episode.setId(id);
        return episodeRepository.save(episode);
    }

    public void delete(Integer id) {
        episodeRepository.deleteById(id);
    }
}