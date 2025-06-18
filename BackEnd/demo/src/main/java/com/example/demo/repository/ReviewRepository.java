package com.example.demo.repository;

import com.example.demo.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.cartoon WHERE r.cartoon.id = :cartoonId")
    List<Review> findByCartoonId(@Param("cartoonId") Integer cartoonId);
    
    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.cartoon")
    List<Review> findAllWithCartoon();

    @Query("SELECT AVG(r.rating), COUNT(r) FROM Review r WHERE r.cartoon.id = :cartoonId")
    Object[] findAverageRatingAndCountByCartoonId(@Param("cartoonId") Integer cartoonId);
}
