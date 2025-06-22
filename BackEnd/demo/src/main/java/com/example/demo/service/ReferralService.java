package com.example.demo.service;

import com.example.demo.entity.Referral;
import com.example.demo.entity.User;
import com.example.demo.repository.ReferralRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReferralService {

    @Autowired
    private ReferralRepository referralRepository;
    
    @Autowired
    private UserAchievementService userAchievementService;

    // Tạo referral code cho user
    public String generateReferralCode(User user) {
        return "REF_" + user.getUsername().toUpperCase() + "_" + 
               UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Ghi lại việc user được refer
    public Referral recordReferral(User referrer, User referee, String referralCode) {
        Referral referral = new Referral(referrer, referee, referralCode);
        return referralRepository.save(referral);
    }

    // Hoàn thành referral (khi referee đăng ký thành công)
    public void completeReferral(User referee) {
        Optional<Referral> referralOpt = referralRepository.findByReferee(referee);
        
        if (referralOpt.isPresent()) {
            Referral referral = referralOpt.get();
            referral.markCompleted();
            referralRepository.save(referral);
            
            // Trigger achievement check for referrer
            userAchievementService.checkAndGrantAchievements(referral.getReferrer());
        }
    }

    // Lấy tất cả successful referrals của user
    public List<Referral> getSuccessfulReferrals(User user) {
        return referralRepository.findCompletedByReferrer(user);
    }

    // Đếm số successful referrals của user
    public Long getSuccessfulReferralCount(User user) {
        return referralRepository.countCompletedByReferrer(user);
    }

    // Tìm referral theo code
    public Optional<Referral> findByReferralCode(String code) {
        return referralRepository.findByReferralCode(code);
    }

    // Kiểm tra user có được refer không
    public Optional<Referral> findReferralForUser(User user) {
        return referralRepository.findByReferee(user);
    }

    // Validate referral code
    public boolean isValidReferralCode(String code) {
        return referralRepository.findByReferralCode(code).isPresent();
    }

    // Tạo referral link
    public String generateReferralLink(String referralCode) {
        return "https://maxion-movie.com/register?ref=" + referralCode;
    }

    // Process referral registration
    public boolean processReferral(String referralCode, User referee) {
        // Tìm referrer qua referral code (giả sử code có format REF_USERNAME_XXXX)
        String[] parts = referralCode.split("_");
        if (parts.length >= 2) {
            String username = parts[1];
            // Tìm user theo username (cần UserService)
            // Tạm thời return false, cần implement logic này
            return false;
        }
        return false;
    }

    // Get referral code of user
    public String getReferralCode(User user) {
        return generateReferralCode(user);
    }

    // Get successful referrals count (alias for existing method)
    public long getSuccessfulReferralsCount(User user) {
        return getSuccessfulReferralCount(user);
    }
}
