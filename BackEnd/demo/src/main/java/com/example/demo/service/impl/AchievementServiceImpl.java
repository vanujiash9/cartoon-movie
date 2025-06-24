package com.example.demo.service.impl;

import com.example.demo.entity.Achievement;
import com.example.demo.entity.User;
import com.example.demo.entity.UserAchievement;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.UserAchievementRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AchievementService;
import com.example.demo.service.NotificationService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void updateUserAchievementProgress(Integer userId, String actionType, Integer cartoonId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }

        // Map frontend action types to database achievement mapping
        List<Achievement> targetAchievements = getAchievementsForAction(actionType);

        for (Achievement achievement : targetAchievements) {
            UserAchievement userAchievement = userAchievementRepository.findByUserAndAchievement(user, achievement);
            if (userAchievement == null) {
                userAchievement = new UserAchievement();
                userAchievement.setUser(user);
                userAchievement.setAchievement(achievement);
                userAchievement.setProgress(0);
                userAchievement.setAchievedAt(null);
                userAchievement.setProgressDetails("{}");
            }

            if (userAchievement.getAchievedAt() == null) {
                boolean progressMade = updateProgressForAction(userAchievement, actionType, cartoonId);

                if (progressMade && userAchievement.getProgress() >= achievement.getTargetValue()) {
                    userAchievement.setAchievedAt(new Date());
                    notificationService.createAchievementNotification(user, achievement);
                }
                userAchievementRepository.save(userAchievement);
            }
        }
    }

    private List<Achievement> getAchievementsForAction(String actionType) {
        // Map action types to specific achievements based on your MySQL data
        switch (actionType) {
            case "WATCH_MOVIE":
                // ID 1: First Watch - Xem tập đầu tiên
                return achievementRepository.findByIdIn(List.of(1));
            
            case "WATCH_DIFFERENT_MOVIES":
                // ID 2: Movie Buff - Xem 5 phim khác nhau
                return achievementRepository.findByIdIn(List.of(2));
            
            case "WATCH_EPISODE":
                // ID 3: Binge Watcher - Xem 10 tập trong một ngày
                return achievementRepository.findByIdIn(List.of(3));
            
            case "COMPLETE_MOVIE":
                // ID 4: Series Completionist - Hoàn thành một bộ phim
                return achievementRepository.findByIdIn(List.of(4));
            
            case "REVIEW":
                // ID 5: First Review - Viết đánh giá đầu tiên
                // ID 6: Review Master - Viết 10 đánh giá
                // ID 10: Comment King - Viết 20 bình luận
                return achievementRepository.findByIdIn(List.of(5, 6, 10));
            
            case "SHARE":
                // ID 7: Social Butterfly - Chia sẻ 5 phim
                return achievementRepository.findByIdIn(List.of(7));
            
            case "LIKE":
            case "RECEIVE_LIKE":
                // Có thể thêm achievement cho việc like sau
                return List.of();
            
            case "REFERRAL":
                // Có thể thêm achievement cho referral sau
                return List.of();
            
            default:
                return List.of();
        }
    }

    private boolean updateProgressForAction(UserAchievement userAchievement, String actionType, Integer cartoonId) {
        switch (actionType) {
            case "WATCH_DIFFERENT_MOVIES":
                // Chỉ đếm phim khác nhau cho achievement "Movie Buff"
                return handleWatchDifferentMoviesAction(userAchievement, cartoonId);
            
            case "WATCH_EPISODE":
                // Đếm số tập xem trong ngày cho "Binge Watcher"
                return handleBingeWatchingAction(userAchievement);
            
            case "WATCH_MOVIE":
            case "COMPLETE_MOVIE":
            case "REVIEW":
            case "SHARE":
            default:
                // Các action khác chỉ cần tăng progress lên 1
                userAchievement.setProgress(userAchievement.getProgress() + 1);
                return true;
        }
    }

    private boolean handleWatchDifferentMoviesAction(UserAchievement userAchievement, Integer cartoonId) {
        if (cartoonId == null) return false;
        
        try {
            Set<Integer> watchedMovies = new HashSet<>();
            if (userAchievement.getProgressDetails() != null && !userAchievement.getProgressDetails().isEmpty()) {
                watchedMovies = objectMapper.readValue(userAchievement.getProgressDetails(), new TypeReference<Set<Integer>>() {});
            }

            if (watchedMovies.add(cartoonId)) {
                userAchievement.setProgress(watchedMovies.size());
                userAchievement.setProgressDetails(objectMapper.writeValueAsString(watchedMovies));
                return true;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }

    private boolean handleBingeWatchingAction(UserAchievement userAchievement) {
        // Đếm số tập xem trong ngày hiện tại
        try {
            String today = java.time.LocalDate.now().toString();
            Set<String> watchDates = new HashSet<>();
            
            if (userAchievement.getProgressDetails() != null && !userAchievement.getProgressDetails().isEmpty()) {
                watchDates = objectMapper.readValue(userAchievement.getProgressDetails(), new TypeReference<Set<String>>() {});
            }
            
            // Reset progress nếu không phải hôm nay
            if (!watchDates.contains(today)) {
                watchDates.clear();
                watchDates.add(today);
                userAchievement.setProgress(1);
            } else {
                userAchievement.setProgress(userAchievement.getProgress() + 1);
            }
            
            userAchievement.setProgressDetails(objectMapper.writeValueAsString(watchDates));
            return true;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }
}
