package com.example.demo.service;

import com.example.demo.entity.Achievement;
import com.example.demo.entity.User;
import com.example.demo.entity.UserAchievement;
import com.example.demo.entity.UserWatchHistory;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.UserAchievementRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserWatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserAchievementService {
    @Autowired
    private UserAchievementRepository userAchievementRepository;
    @Autowired
    private AchievementRepository achievementRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserWatchHistoryRepository userWatchHistoryRepository;

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

    // Kiểm tra và tự động cấp thành tựu cho user
    public void checkAndGrantAchievements(User user) {
        // 1. Đăng ký tài khoản (ID: 1) - tự động cấp
        grantAchievementIfNotExists(user, 1);

        // 5. Đăng nhập lần đầu (ID: 5) - tự động cấp khi login
        grantAchievementIfNotExists(user, 5);

        // 2. Xem 10 phim (ID: 2)
        List<UserWatchHistory> watchHistory = userWatchHistoryRepository.findByUser(user);
        if (watchHistory.size() >= 10) {
            grantAchievementIfNotExists(user, 2);
        }

        // 6. Xem phim liên tục 7 ngày (ID: 6)
        checkConsecutiveDaysWatching(user, 7, 6);

        // 4. Thành viên tích cực - hoạt động thường xuyên trong 1 tháng (ID: 4)
        checkActiveUserAchievement(user);
    }

    // Kiểm tra xem user có xem phim liên tục trong n ngày không
    private void checkConsecutiveDaysWatching(User user, int consecutiveDays, int achievementId) {
        List<UserWatchHistory> history = userWatchHistoryRepository.findByUser(user);
        if (history.size() < consecutiveDays)
            return;

        // Sắp xếp theo thời gian xem
        history.sort((a, b) -> a.getWatchedAt().compareTo(b.getWatchedAt()));

        // Nhóm theo ngày
        Map<String, List<UserWatchHistory>> watchByDay = history.stream()
                .collect(Collectors.groupingBy(h -> h.getWatchedAt().toLocalDate().toString()));

        List<String> watchedDays = new ArrayList<>(watchByDay.keySet());
        Collections.sort(watchedDays);

        // Kiểm tra chuỗi ngày liên tiếp
        int consecutiveCount = 1;
        for (int i = 1; i < watchedDays.size(); i++) {
            LocalDateTime currentDay = LocalDateTime.parse(watchedDays.get(i) + "T00:00:00");
            LocalDateTime previousDay = LocalDateTime.parse(watchedDays.get(i - 1) + "T00:00:00");

            if (ChronoUnit.DAYS.between(previousDay, currentDay) == 1) {
                consecutiveCount++;
                if (consecutiveCount >= consecutiveDays) {
                    grantAchievementIfNotExists(user, achievementId);
                    return;
                }
            } else {
                consecutiveCount = 1;
            }
        }
    }

    // Kiểm tra thành viên tích cực
    private void checkActiveUserAchievement(User user) {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        List<UserWatchHistory> recentActivity = userWatchHistoryRepository.findByUser(user)
                .stream()
                .filter(h -> h.getWatchedAt().isAfter(oneMonthAgo))
                .collect(Collectors.toList());

        // Nếu có ít nhất 15 lần xem trong tháng qua
        if (recentActivity.size() >= 15) {
            grantAchievementIfNotExists(user, 4);
        }
    }

    // Lấy tiến độ thành tựu của user
    public List<Map<String, Object>> getUserAchievementProgress(Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return new ArrayList<>();

        List<Achievement> allAchievements = achievementRepository.findAll();
        List<UserAchievement> userAchievements = userAchievementRepository.findByUser(user);
        Set<Integer> achievedIds = userAchievements.stream()
                .map(ua -> ua.getAchievement().getId())
                .collect(Collectors.toSet());

        List<Map<String, Object>> result = new ArrayList<>();

        for (Achievement achievement : allAchievements) {
            Map<String, Object> progress = new HashMap<>();
            progress.put("id", achievement.getId());
            progress.put("name", achievement.getName());
            progress.put("description", achievement.getDescription());
            progress.put("completed", achievedIds.contains(achievement.getId()));

            // Tính tiến độ cụ thể
            Map<String, Object> progressData = calculateProgress(user, achievement.getId());
            progress.putAll(progressData);

            result.add(progress);
        }

        // Sắp xếp: chưa hoàn thành và gần hoàn thành lên đầu
        result.sort((a, b) -> {
            boolean aCompleted = (Boolean) a.get("completed");
            boolean bCompleted = (Boolean) b.get("completed");

            if (aCompleted && !bCompleted)
                return 1;
            if (!aCompleted && bCompleted)
                return -1;
            if (aCompleted && bCompleted)
                return 0;

            // Cả hai chưa hoàn thành, sắp xếp theo % tiến độ giảm dần
            int aProgress = (Integer) a.get("progressPercent");
            int bProgress = (Integer) b.get("progressPercent");
            return Integer.compare(bProgress, aProgress);
        });

        return result;
    }

    // Tính tiến độ chi tiết cho từng thành tựu
    private Map<String, Object> calculateProgress(User user, Integer achievementId) {
        Map<String, Object> progress = new HashMap<>();
        List<UserWatchHistory> watchHistory = userWatchHistoryRepository.findByUser(user);

        switch (achievementId) {
            case 1: // Đăng ký tài khoản
                progress.put("current", 1);
                progress.put("target", 1);
                progress.put("progressPercent", 100);
                progress.put("icon", "🎉");
                break;

            case 2: // Xem 10 phim
                int watchedCount = watchHistory.size();
                progress.put("current", Math.min(watchedCount, 10));
                progress.put("target", 10);
                progress.put("progressPercent", Math.min(100, (watchedCount * 100) / 10));
                progress.put("icon", "🎬");
                break;

            case 5: // Đăng nhập lần đầu
                progress.put("current", 1);
                progress.put("target", 1);
                progress.put("progressPercent", 100);
                progress.put("icon", "🔐");
                break;

            case 6: // Xem phim liên tục 7 ngày
                int consecutiveDays = getConsecutiveDaysCount(user);
                progress.put("current", Math.min(consecutiveDays, 7));
                progress.put("target", 7);
                progress.put("progressPercent", Math.min(100, (consecutiveDays * 100) / 7));
                progress.put("icon", "📅");
                break;

            case 4: // Thành viên tích cực
                LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
                int recentActivity = (int) watchHistory.stream()
                        .filter(h -> h.getWatchedAt().isAfter(oneMonthAgo))
                        .count();
                progress.put("current", Math.min(recentActivity, 15));
                progress.put("target", 15);
                progress.put("progressPercent", Math.min(100, (recentActivity * 100) / 15));
                progress.put("icon", "⭐");
                break;

            case 11: // Xem phim ban đêm (22:00-02:00 trong 5 ngày)
                int nightWatchingDays = getNightWatchingDays(user);
                progress.put("current", Math.min(nightWatchingDays, 5));
                progress.put("target", 5);
                progress.put("progressPercent", Math.min(100, (nightWatchingDays * 100) / 5));
                progress.put("icon", "🌙");
                break;

            case 13: // Tốc độ ánh sáng - 5 phim trong 1 ngày
                int maxMoviesInDay = getMaxMoviesInOneDay(user);
                progress.put("current", Math.min(maxMoviesInDay, 5));
                progress.put("target", 5);
                progress.put("progressPercent", Math.min(100, (maxMoviesInDay * 100) / 5));
                progress.put("icon", "⚡");
                break;

            case 17: // Collector - 100 phim yêu thích
                // Cần thêm logic cho favorites
                progress.put("current", 0);
                progress.put("target", 100);
                progress.put("progressPercent", 0);
                progress.put("icon", "💎");
                break;

            case 21: // Marathon runner - 10 giờ liên tục
                int maxHoursInDay = getMaxHoursInOneDay(user);
                progress.put("current", Math.min(maxHoursInDay, 10));
                progress.put("target", 10);
                progress.put("progressPercent", Math.min(100, (maxHoursInDay * 100) / 10));
                progress.put("icon", "🏃");
                break;

            case 26: // Night owl - sau 01:00 trong 10 ngày
                int lateNightDays = getLateNightWatchingDays(user);
                progress.put("current", Math.min(lateNightDays, 10));
                progress.put("target", 10);
                progress.put("progressPercent", Math.min(100, (lateNightDays * 100) / 10));
                progress.put("icon", "🦉");
                break;

            default:
                progress.put("current", 0);
                progress.put("target", 1);
                progress.put("progressPercent", 0);
                progress.put("icon", "🏆");
                break;
        }

        return progress;
    }

    // Helper methods cho các thành tựu mới
    private int getNightWatchingDays(User user) {
        List<UserWatchHistory> history = userWatchHistoryRepository.findByUser(user);
        Set<String> nightWatchingDays = new HashSet<>();

        for (UserWatchHistory watch : history) {
            int hour = watch.getWatchedAt().getHour();
            if (hour >= 22 || hour <= 2) {
                nightWatchingDays.add(watch.getWatchedAt().toLocalDate().toString());
            }
        }

        return nightWatchingDays.size();
    }

    private int getMaxMoviesInOneDay(User user) {
        List<UserWatchHistory> history = userWatchHistoryRepository.findByUser(user);
        Map<String, Integer> moviesPerDay = new HashMap<>();

        for (UserWatchHistory watch : history) {
            String day = watch.getWatchedAt().toLocalDate().toString();
            moviesPerDay.put(day, moviesPerDay.getOrDefault(day, 0) + 1);
        }

        return moviesPerDay.values().stream().mapToInt(Integer::intValue).max().orElse(0);
    }

    private int getMaxHoursInOneDay(User user) {
        // Giả sử mỗi phim trung bình 2 giờ
        return getMaxMoviesInOneDay(user) * 2;
    }

    private int getLateNightWatchingDays(User user) {
        List<UserWatchHistory> history = userWatchHistoryRepository.findByUser(user);
        Set<String> lateNightDays = new HashSet<>();

        for (UserWatchHistory watch : history) {
            int hour = watch.getWatchedAt().getHour();
            if (hour >= 1 && hour <= 6) {
                lateNightDays.add(watch.getWatchedAt().toLocalDate().toString());
            }
        }

        return lateNightDays.size();
    }

    // Tính số ngày xem phim liên tiếp hiện tại
    private int getConsecutiveDaysCount(User user) {
        List<UserWatchHistory> history = userWatchHistoryRepository.findByUser(user);
        if (history.isEmpty())
            return 0;

        // Nhóm theo ngày
        Map<String, List<UserWatchHistory>> watchByDay = history.stream()
                .collect(Collectors.groupingBy(h -> h.getWatchedAt().toLocalDate().toString()));

        List<String> watchedDays = new ArrayList<>(watchByDay.keySet());
        Collections.sort(watchedDays);
        Collections.reverse(watchedDays); // Sắp xếp ngược để tính từ ngày gần nhất

        if (watchedDays.isEmpty())
            return 0;

        int consecutiveCount = 1;
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime lastWatchDay = LocalDateTime.parse(watchedDays.get(0) + "T00:00:00");

        // Kiểm tra xem ngày gần nhất có phải hôm nay hoặc hôm qua không
        long daysDiff = ChronoUnit.DAYS.between(lastWatchDay.toLocalDate(), today.toLocalDate());
        if (daysDiff > 1)
            return 0; // Chuỗi bị gián đoạn
        if (daysDiff == 1)
            consecutiveCount = 0; // Hôm qua là ngày cuối

        // Đếm ngược từ ngày gần nhất
        for (int i = 1; i < watchedDays.size(); i++) {
            LocalDateTime currentDay = LocalDateTime.parse(watchedDays.get(i) + "T00:00:00");
            LocalDateTime previousDay = LocalDateTime.parse(watchedDays.get(i - 1) + "T00:00:00");

            if (ChronoUnit.DAYS.between(currentDay, previousDay) == 1) {
                consecutiveCount++;
            } else {
                break;
            }
        }

        return consecutiveCount;
    }
}
