package com.example.demo.repository;

import com.example.demo.entity.UserMovieProgress;
import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserMovieProgressRepository extends JpaRepository<UserMovieProgress, Integer> {
    Optional<UserMovieProgress> findByUserAndCartoon(User user, Cartoon cartoon);
    List<UserMovieProgress> findByUser(User user);
}
