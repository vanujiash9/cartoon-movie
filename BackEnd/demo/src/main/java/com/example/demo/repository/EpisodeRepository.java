package com.example.demo.repository;

import com.example.demo.entity.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EpisodeRepository extends JpaRepository<Episode, Integer> {
    @Query("SELECT e FROM Episode e WHERE e.cartoon.id = :cartoonId")
    List<Episode> findByCartoonId(@Param("cartoonId") Integer cartoonId);

    @Query("SELECT COUNT(e) FROM Episode e WHERE e.cartoon.id = :cartoonId")
    int countByCartoonId(@Param("cartoonId") Integer cartoonId);
}