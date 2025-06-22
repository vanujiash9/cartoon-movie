package com.example.demo.service;

import com.example.demo.entity.Achievement;
import com.example.demo.entity.User;
import com.example.demo.entity.UserAchievement;
import com.example.demo.entity.UserWatchHistory;
import com.example.demo.entity.Comment;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.UserShare;
import com.example.demo.entity.Referral;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.UserAchievementRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserWatchHistoryRepository;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.CartoonRepository;
import com.example.demo.repository.UserShareRepository;
import com.example.demo.repository.ReferralRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserAchievementService {    @Autowired
    private UserAchievementRepository userAchievementRepository;
    @Autowired
    private AchievementRepository achievementRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserWatchHistoryRepository userWatchHistoryRepository;    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private CartoonRepository cartoonRepository;
    @Autowired
    private UserShareRepository userShareRepository;    @Autowired 
    private ReferralRepository referralRepository;
    
    @Autowired
    private NotificationService notificationService;    // Gán thành tựu cho user nếu chưa có
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
                
                // Send notification for new achievement
                Achievement achievement = achievementOpt.get();
                if (notificationService != null) {
                    notificationService.notifyAchievementUnlocked(user, achievement.getName());
                }
            }
        }
    }// Kiểm tra và tự động cấp thành tựu cho user
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

        // 3. Viết đánh giá đầu tiên (ID: 3)
        checkFirstReviewAchievement(user);

        // 7. Xem hết 1 series (ID: 7)
        checkSeriesCompletionAchievement(user);        // 9. Đạt 100 lượt thích review (ID: 9)
        checkReviewLikesAchievement(user);

        // 8. Chia sẻ phim lên mạng xã hội (ID: 8)
        checkSocialSharingAchievement(user);

        // 10. Mời bạn bè đăng ký (ID: 10)
        checkReferralAchievement(user);
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
    }    // Kiểm tra thành viên tích cực
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

    // Kiểm tra thành tựu viết đánh giá đầu tiên (ID: 3)
    private void checkFirstReviewAchievement(User user) {
        List<Comment> userComments = commentRepository.findByUserId(Long.valueOf(user.getId()));
        if (!userComments.isEmpty()) {
            grantAchievementIfNotExists(user, 3);
        }
    }    // Kiểm tra thành tựu xem hết 1 series (ID: 7)
    private void checkSeriesCompletionAchievement(User user) {
        List<UserWatchHistory> watchHistory = userWatchHistoryRepository.findByUser(user);
        
        // Nhóm lịch sử xem theo cartoon và đếm số lần xem
        Map<Integer, Integer> watchCountByCartoon = new HashMap<>();
        
        for (UserWatchHistory watch : watchHistory) {
            Integer cartoonId = watch.getCartoon().getId();
            watchCountByCartoon.put(cartoonId, 
                watchCountByCartoon.getOrDefault(cartoonId, 0) + 1);
        }
        
        // Kiểm tra xem có cartoon nào đã xem đủ số tập chưa
        for (Map.Entry<Integer, Integer> entry : watchCountByCartoon.entrySet()) {
            Integer cartoonId = entry.getKey();
            Integer watchCount = entry.getValue();
            
            Optional<Cartoon> cartoonOpt = cartoonRepository.findById(cartoonId);
            if (cartoonOpt.isPresent()) {
                Cartoon cartoon = cartoonOpt.get();
                Integer totalEpisodes = cartoon.getTotalEpisodes();
                
                // Nếu số lần xem >= tổng số tập của series
                // (giả định user xem mỗi tập ít nhất 1 lần)
                if (totalEpisodes != null && watchCount >= totalEpisodes) {
                    grantAchievementIfNotExists(user, 7);
                    return;
                }
            }
        }
    }    // Kiểm tra thành tựu đạt 100 lượt thích review (ID: 9)
    private void checkReviewLikesAchievement(User user) {
        List<Comment> userComments = commentRepository.findByUserId(Long.valueOf(user.getId()));
        
        int totalLikes = 0;
        for (Comment comment : userComments) {
            // Đếm số likes của mỗi comment (chỉ đếm likes, không đếm dislikes)
            totalLikes += comment.getLikes().stream()
                    .mapToInt(like -> like.isLiked() ? 1 : 0)
                    .sum();
        }
        
        if (totalLikes >= 100) {
            grantAchievementIfNotExists(user, 9);
        }
    }

    // Kiểm tra thành tựu chia sẻ phim lên mạng xã hội (ID: 8)
    private void checkSocialSharingAchievement(User user) {
        List<UserShare> userShares = userShareRepository.findByUser(user);
        if (!userShares.isEmpty()) {
            grantAchievementIfNotExists(user, 8);
        }
    }

    // Kiểm tra thành tựu mời bạn bè đăng ký (ID: 10)
    private void checkReferralAchievement(User user) {
        List<Referral> successfulReferrals = referralRepository.findCompletedByReferrer(user);
        if (!successfulReferrals.isEmpty()) {
            grantAchievementIfNotExists(user, 10);
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
                break;            case 3: // Viết đánh giá đầu tiên
                List<Comment> userComments = commentRepository.findByUserId(Long.valueOf(user.getId()));
                progress.put("current", userComments.isEmpty() ? 0 : 1);
                progress.put("target", 1);
                progress.put("progressPercent", userComments.isEmpty() ? 0 : 100);
                progress.put("icon", "📝");
                break;            case 7: // Xem hết 1 series
                boolean hasCompletedSeries = hasCompletedAnySeries(user);
                progress.put("current", hasCompletedSeries ? 1 : 0);
                progress.put("target", 1);
                progress.put("progressPercent", hasCompletedSeries ? 100 : 0);
                progress.put("icon", "📺");
                break;            case 8: // Chia sẻ phim lên mạng xã hội
                List<UserShare> userShares = userShareRepository.findByUser(user);
                boolean hasShared = !userShares.isEmpty();
                progress.put("current", hasShared ? 1 : 0);
                progress.put("target", 1);
                progress.put("progressPercent", hasShared ? 100 : 0);
                progress.put("icon", "📤");
                break;case 9: // Đạt 100 lượt thích review
                int totalLikes = getTotalReviewLikes(user);
                progress.put("current", Math.min(totalLikes, 100));
                progress.put("target", 100);
                progress.put("progressPercent", Math.min(100, totalLikes));
                progress.put("icon", "👍");
                break;            case 10: // Mời bạn bè đăng ký
                List<Referral> successfulReferrals = referralRepository.findCompletedByReferrer(user);
                boolean hasSuccessfulReferral = !successfulReferrals.isEmpty();
                progress.put("current", hasSuccessfulReferral ? 1 : 0);
                progress.put("target", 1);
                progress.put("progressPercent", hasSuccessfulReferral ? 100 : 0);
                progress.put("icon", "👥");
                break;

            default:
                progress.put("current", 0);
                progress.put("target", 1);
                progress.put("progressPercent", 0);
                progress.put("icon", "🏆");
                break;
        }        return progress;
    }

    // Helper method: Kiểm tra user có hoàn thành series nào chưa
    private boolean hasCompletedAnySeries(User user) {
        List<UserWatchHistory> watchHistory = userWatchHistoryRepository.findByUser(user);
        
        // Nhóm lịch sử xem theo cartoon và đếm số lần xem
        Map<Integer, Integer> watchCountByCartoon = new HashMap<>();
        
        for (UserWatchHistory watch : watchHistory) {
            Integer cartoonId = watch.getCartoon().getId();
            watchCountByCartoon.put(cartoonId, 
                watchCountByCartoon.getOrDefault(cartoonId, 0) + 1);
        }
        
        // Kiểm tra xem có cartoon nào đã xem đủ số tập chưa
        for (Map.Entry<Integer, Integer> entry : watchCountByCartoon.entrySet()) {
            Integer cartoonId = entry.getKey();
            Integer watchCount = entry.getValue();
            
            Optional<Cartoon> cartoonOpt = cartoonRepository.findById(cartoonId);
            if (cartoonOpt.isPresent()) {
                Cartoon cartoon = cartoonOpt.get();
                Integer totalEpisodes = cartoon.getTotalEpisodes();
                
                // Nếu số lần xem >= tổng số tập của series
                if (totalEpisodes != null && watchCount >= totalEpisodes) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Helper method: Tính tổng số likes của tất cả reviews của user
    private int getTotalReviewLikes(User user) {
        List<Comment> userComments = commentRepository.findByUserId(Long.valueOf(user.getId()));
        
        int totalLikes = 0;
        for (Comment comment : userComments) {
            // Đếm số likes của mỗi comment (chỉ đếm likes, không đếm dislikes)
            totalLikes += comment.getLikes().stream()
                    .mapToInt(like -> like.isLiked() ? 1 : 0)
                    .sum();
        }
        
        return totalLikes;
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
    }    // Lấy tất cả thành tựu của user với thông tin tiến độ
    public List<UserAchievement> getUserAchievements(User user) {
        return userAchievementRepository.findByUser(user);
    }
    
    // Lấy thành tựu với thông tin tiến độ chi tiết
    public List<Map<String, Object>> getUserAchievementsWithProgress(User user) {
        List<Achievement> allAchievements = achievementRepository.findAll();
        List<UserAchievement> userAchievements = userAchievementRepository.findByUser(user);
        
        return allAchievements.stream().map(achievement -> {
            Map<String, Object> result = new HashMap<>();
            result.put("id", achievement.getId());
            result.put("name", achievement.getName());            result.put("description", achievement.getDescription());
            
            // Kiểm tra user đã đạt thành tựu này chưa
            boolean completed = userAchievements.stream()
                .anyMatch(ua -> ua.getAchievement().getId().equals(achievement.getId()));
            result.put("completed", completed);
            
            if (completed) {
                result.put("progressPercent", 100);
            } else {
                // Tính toán tiến độ dựa trên loại thành tựu
                int progress = calculateProgressPercent(user, achievement.getId());
                result.put("progressPercent", progress);
            }
            
            return result;
        }).collect(Collectors.toList());
    }
    
    // Tính toán tiến độ cho từng thành tựu
    private int calculateProgressPercent(User user, int achievementId) {
        switch (achievementId) {
            case 1: // Đăng ký tài khoản - đã đăng ký thì 100%
                return 100;
            case 2: // Xem 10 phim
                List<UserWatchHistory> watchHistory = userWatchHistoryRepository.findByUser(user);
                return Math.min(100, (watchHistory.size() * 100) / 10);            case 3: // Viết review đầu tiên
                List<Comment> reviews = commentRepository.findByUserId(user.getId().longValue());
                return reviews.size() > 0 ? 100 : 0;
            case 8: // Chia sẻ phim lên mạng xã hội (5 lần)
                List<UserShare> shares = userShareRepository.findByUser(user);
                return Math.min(100, (shares.size() * 100) / 5);
            case 10: // Mời bạn bè (3 người)
                List<Referral> referrals = referralRepository.findByReferrer(user);
                long successfulReferrals = referrals.stream()
                    .filter(r -> r.getReferee() != null)
                    .count();
                return Math.min(100, (int)(successfulReferrals * 100) / 3);
            default:
                return 0;
        }
    }
}
