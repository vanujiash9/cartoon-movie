package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cartoons")
public class Cartoon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;    private String title;
    private String description;
    
    @Column(name = "release_year")
    private Integer releaseYear;
    
    @Column(name = "total_episodes")
    private Integer totalEpisodes;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    private String trailerUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt; // Đảm bảo tên trường là "createdAt"

    @Column(name = "video_url")
    private String videoUrl;

    private String genre;
    private String actors;
    private String director;
    private Integer duration;
    private String status;

    @OneToMany(mappedBy = "cartoon", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Episode> episodes = new ArrayList<>();    @OneToMany(mappedBy = "cartoon", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Comment> comments;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }

    public Integer getTotalEpisodes() { return totalEpisodes; }
    public void setTotalEpisodes(Integer totalEpisodes) { this.totalEpisodes = totalEpisodes; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; } // Đảm bảo setter có tên đúng

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getActors() { return actors; }
    public void setActors(String actors) { this.actors = actors; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<Episode> getEpisodes() { return episodes; }
    public void setEpisodes(List<Episode> episodes) { this.episodes = episodes; }    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}