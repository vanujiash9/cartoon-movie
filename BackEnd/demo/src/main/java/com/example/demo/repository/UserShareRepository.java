package com.example.demo.repository;

import com.example.demo.entity.UserShare;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserShareRepository extends JpaRepository<UserShare, Integer> {
    
    // Lấy tất cả shares của một user
    List<UserShare> findByUser(User user);
    
    // Đếm số shares của một user
    @Query("SELECT COUNT(s) FROM UserShare s WHERE s.user = :user")
    Long countByUser(@Param("user") User user);
    
    // Lấy shares theo platform
    @Query("SELECT s FROM UserShare s WHERE s.user = :user AND s.platform = :platform")
    List<UserShare> findByUserAndPlatform(@Param("user") User user, @Param("platform") String platform);
    
    // Kiểm tra user đã share cartoon này chưa
    @Query("SELECT COUNT(s) FROM UserShare s WHERE s.user = :user AND s.cartoon.id = :cartoonId")
    Long countByUserAndCartoonId(@Param("user") User user, @Param("cartoonId") Integer cartoonId);
}
