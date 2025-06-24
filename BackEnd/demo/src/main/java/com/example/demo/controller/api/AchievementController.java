package com.example.demo.controller.api;

import com.example.demo.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    @PostMapping("/progress")
    public ResponseEntity<?> updateUserAchievementProgress(@RequestParam Integer userId, 
                                                         @RequestParam String actionType,
                                                         @RequestParam(required = false) Integer cartoonId) {
        achievementService.updateUserAchievementProgress(userId, actionType, cartoonId);
        return ResponseEntity.ok().build();
    }
}
