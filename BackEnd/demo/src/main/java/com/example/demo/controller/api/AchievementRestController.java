package com.example.demo.controller.api;

import com.example.demo.entity.Achievement;
import com.example.demo.repository.AchievementRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "*")
public class AchievementRestController {
    private final AchievementRepository achievementRepository;

    public AchievementRestController(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    @GetMapping
    public List<Achievement> getAll() {
        return achievementRepository.findAll();
    }

    @GetMapping("/{id}")
    public Achievement getById(@PathVariable Integer id) {
        return achievementRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Achievement create(@RequestBody Achievement achievement) {
        return achievementRepository.save(achievement);
    }

    @PutMapping("/{id}")
    public Achievement update(@PathVariable Integer id, @RequestBody Achievement achievement) {
        achievement.setId(id);
        return achievementRepository.save(achievement);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        achievementRepository.deleteById(id);
    }
}
