package com.example.demo.service;

import com.example.demo.entity.UserShare;
import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import com.example.demo.repository.UserShareRepository;
import com.example.demo.repository.CartoonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SocialSharingService {

    @Autowired
    private UserShareRepository userShareRepository;
    
    @Autowired
    private CartoonRepository cartoonRepository;
    
    @Autowired
    private UserAchievementService userAchievementService;

    // Ghi lại việc user share phim
    public UserShare recordShare(User user, Integer cartoonId, String platform) {
        Optional<Cartoon> cartoonOpt = cartoonRepository.findById(cartoonId);
        
        if (cartoonOpt.isPresent()) {
            UserShare share = new UserShare(user, cartoonOpt.get(), platform);
            UserShare savedShare = userShareRepository.save(share);
            
            // Trigger achievement check for social sharing
            userAchievementService.checkAndGrantAchievements(user);
            
            return savedShare;
        } else {
            // Return null if cartoon doesn't exist - don't create fake data for real MySQL database
            System.out.println("Warning: Cartoon with ID " + cartoonId + " not found in database.");
            return null;
        }
    }

    // Lấy tất cả shares của user
    public List<UserShare> getUserShares(User user) {
        return userShareRepository.findByUser(user);
    }

    // Đếm số shares của user
    public Long getUserShareCount(User user) {
        return userShareRepository.countByUser(user);
    }

    // Kiểm tra user đã share cartoon này chưa
    public boolean hasSharedCartoon(User user, Integer cartoonId) {
        return userShareRepository.countByUserAndCartoonId(user, cartoonId) > 0;
    }

    // Lấy shares theo platform
    public List<UserShare> getUserSharesByPlatform(User user, String platform) {
        return userShareRepository.findByUserAndPlatform(user, platform);
    }

    // Generate share URL
    public String generateShareUrl(Integer cartoonId, String platform, String username) {
        String baseUrl = "https://maxion-movie.com/movie/" + cartoonId;
        String shareText = "Tôi đang xem phim này trên Maxion! Cùng xem nhé!";
        
        switch (platform.toLowerCase()) {
            case "facebook":
                return "https://www.facebook.com/sharer/sharer.php?u=" + baseUrl + "&quote=" + shareText;
            case "twitter":
                return "https://twitter.com/intent/tweet?url=" + baseUrl + "&text=" + shareText + " via @MaxionMovies";
            default:
                return baseUrl;
        }
    }
}
