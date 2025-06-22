package com.example.demo.repository;

import com.example.demo.entity.Referral;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Integer> {
    
    // Lấy tất cả referrals của một user (người mời)
    List<Referral> findByReferrer(User referrer);
    
    // Lấy referrals thành công của một user
    @Query("SELECT r FROM Referral r WHERE r.referrer = :referrer AND r.status = 'COMPLETED'")
    List<Referral> findCompletedByReferrer(@Param("referrer") User referrer);
    
    // Đếm số referrals thành công của một user
    @Query("SELECT COUNT(r) FROM Referral r WHERE r.referrer = :referrer AND r.status = 'COMPLETED'")
    Long countCompletedByReferrer(@Param("referrer") User referrer);
    
    // Tìm referral theo code
    Optional<Referral> findByReferralCode(String referralCode);
    
    // Kiểm tra user có được refer bởi ai không
    Optional<Referral> findByReferee(User referee);
}
