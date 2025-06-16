package com.example.demo.repository;

import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.UserWatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserWatchHistoryRepository extends JpaRepository<UserWatchHistory, Integer> {
    List<UserWatchHistory> findByUser(User user);
    boolean existsByUserAndCartoon(User user, Cartoon cartoon);
}
