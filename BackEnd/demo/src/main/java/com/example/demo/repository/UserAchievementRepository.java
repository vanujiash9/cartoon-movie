package com.example.demo.repository;

import com.example.demo.entity.UserAchievement;
import com.example.demo.entity.User;
import com.example.demo.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Integer> {
    List<UserAchievement> findByUser(User user);
    UserAchievement findByUserAndAchievement(User user, Achievement achievement);
}
