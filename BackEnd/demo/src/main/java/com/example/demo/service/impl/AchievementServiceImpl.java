package com.example.demo.service.impl;

import com.example.demo.entity.Achievement;
import com.example.demo.entity.User;
import com.example.demo.entity.UserAchievement;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.UserAchievementRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AchievementService;
import com.example.demo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AchievementServiceImpl implements AchievementService {

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public void updateUserAchievementProgress(Integer userId, String actionType) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }

        List<Achievement> achievements = achievementRepository.findByActionType(actionType);

        for (Achievement achievement : achievements) {
            UserAchievement userAchievement = userAchievementRepository.findByUserAndAchievement(user, achievement);
            if (userAchievement == null) {
                userAchievement = new UserAchievement();
                userAchievement.setUser(user);
                userAchievement.setAchievement(achievement);
                userAchievement.setProgress(0);
                userAchievement.setAchievedAt(null);
            }

            if (userAchievement.getAchievedAt() == null) {
                userAchievement.setProgress(userAchievement.getProgress() + 1);

                if (userAchievement.getProgress() >= achievement.getTarget()) {
                    userAchievement.setAchievedAt(new Date());
                    notificationService.createAchievementNotification(user, achievement);
                }
                userAchievementRepository.save(userAchievement);
            }
        }
    }
}
