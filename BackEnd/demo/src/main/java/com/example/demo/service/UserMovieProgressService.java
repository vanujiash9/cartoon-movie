package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.UserMovieProgress;
import com.example.demo.repository.UserMovieProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
public class UserMovieProgressService {
    @Autowired
    private UserMovieProgressRepository userMovieProgressRepository;

    public void saveOrUpdateProgress(User user, Cartoon cartoon, int lastPosition) {
        Optional<UserMovieProgress> opt = userMovieProgressRepository.findByUserAndCartoon(user, cartoon);
        UserMovieProgress progress = opt.orElseGet(UserMovieProgress::new);
        progress.setUser(user);
        progress.setCartoon(cartoon);
        progress.setLastPosition(lastPosition);
        progress.setUpdatedAt(LocalDateTime.now());
        userMovieProgressRepository.save(progress);
    }

    public Optional<UserMovieProgress> getProgress(User user, Cartoon cartoon) {
        return userMovieProgressRepository.findByUserAndCartoon(user, cartoon);
    }

    public List<UserMovieProgress> getAllProgressByUser(User user) {
        return userMovieProgressRepository.findByUser(user);
    }
}
