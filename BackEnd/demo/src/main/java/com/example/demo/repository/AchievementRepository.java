package com.example.demo.repository;

import com.example.demo.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Integer> {
    List<Achievement> findByActionType(String actionType);

    // Tìm achievements theo danh sách ID
    List<Achievement> findByIdIn(List<Integer> ids);

    // Tìm achievements đang active
    List<Achievement> findByIsActiveTrue();

    // Tìm achievements theo category
    List<Achievement> findByCategory(String category);
}
