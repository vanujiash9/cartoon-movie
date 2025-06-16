package com.example.demo.service;

import com.example.demo.entity.Achievement;
import com.example.demo.entity.User;
import com.example.demo.entity.UserAchievement;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.UserAchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserAchievementService {
    @Autowired
    private UserAchievementRepository userAchievementRepository;
    @Autowired
    private AchievementRepository achievementRepository;

    // Gán thành tựu cho user nếu chưa có
    public void grantAchievementIfNotExists(User user, int achievementId) {
        boolean alreadyHas = userAchievementRepository.findByUser(user)
            .stream().anyMatch(ua -> ua.getAchievement().getId() == achievementId);
        if (!alreadyHas) {
            Optional<Achievement> achievementOpt = achievementRepository.findById(achievementId);
            if (achievementOpt.isPresent()) {
                UserAchievement ua = new UserAchievement();
                ua.setUser(user);
                ua.setAchievement(achievementOpt.get());
                userAchievementRepository.save(ua);
            }
        }
    }
}
