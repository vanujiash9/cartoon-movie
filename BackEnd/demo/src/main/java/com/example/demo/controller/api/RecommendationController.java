package com.example.demo.controller.api;

import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.UserWatchHistory;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.CartoonRepository;
import com.example.demo.repository.UserWatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommend")
public class RecommendationController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CartoonRepository cartoonRepository;
    @Autowired
    private UserWatchHistoryRepository userWatchHistoryRepository;

    // Gợi ý phim cùng thể loại user đã xem
    @GetMapping("/user/{userId}")
    public List<Cartoon> recommendByGenre(@PathVariable Integer userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();
        List<UserWatchHistory> history = userWatchHistoryRepository.findByUser(user);
        Set<String> genres = history.stream()
            .map(h -> h.getCartoon().getGenre())
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        return cartoonRepository.findAll().stream()
            .filter(c -> genres.contains(c.getGenre()))
            .limit(10)
            .collect(Collectors.toList());
    }

    // Gợi ý phim hot (nhiều người xem nhất)
    @GetMapping("/hot")
    public List<Cartoon> recommendHot() {
        Map<Integer, Long> countMap = userWatchHistoryRepository.findAll().stream()
            .collect(Collectors.groupingBy(h -> h.getCartoon().getId(), Collectors.counting()));
        return countMap.entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(10)
            .map(e -> cartoonRepository.findById(e.getKey()).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    // Top phim được xem nhiều nhất tuần
    @GetMapping("/top-week")
    public List<Cartoon> topWeek() {
        // Lấy các lượt xem trong 7 ngày gần nhất
        java.time.LocalDateTime weekAgo = java.time.LocalDateTime.now().minusDays(7);
        Map<Integer, Long> countMap = userWatchHistoryRepository.findAll().stream()
            .filter(h -> h.getWatchedAt() != null && h.getWatchedAt().isAfter(weekAgo))
            .collect(Collectors.groupingBy(h -> h.getCartoon().getId(), Collectors.counting()));
        return countMap.entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(10)
            .map(e -> cartoonRepository.findById(e.getKey()).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    // Top phim được xem nhiều nhất tháng
    @GetMapping("/top-month")
    public List<Cartoon> topMonth() {
        java.time.LocalDateTime monthAgo = java.time.LocalDateTime.now().minusDays(30);
        Map<Integer, Long> countMap = userWatchHistoryRepository.findAll().stream()
            .filter(h -> h.getWatchedAt() != null && h.getWatchedAt().isAfter(monthAgo))
            .collect(Collectors.groupingBy(h -> h.getCartoon().getId(), Collectors.counting()));
        return countMap.entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(10)
            .map(e -> cartoonRepository.findById(e.getKey()).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
}