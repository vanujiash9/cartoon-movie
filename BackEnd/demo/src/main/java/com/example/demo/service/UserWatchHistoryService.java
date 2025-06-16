package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.UserWatchHistory;
import com.example.demo.repository.UserWatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserWatchHistoryService {
    @Autowired
    private UserWatchHistoryRepository userWatchHistoryRepository;

    public void recordWatch(User user, Cartoon cartoon) {
        if (!userWatchHistoryRepository.existsByUserAndCartoon(user, cartoon)) {
            UserWatchHistory history = new UserWatchHistory();
            history.setUser(user);
            history.setCartoon(cartoon);
            history.setWatchedAt(LocalDateTime.now());
            userWatchHistoryRepository.save(history);
        }
    }

    public int countUniqueWatched(User user) {
        List<UserWatchHistory> list = userWatchHistoryRepository.findByUser(user);
        return (int) list.stream().map(h -> h.getCartoon().getId()).distinct().count();
    }
}
