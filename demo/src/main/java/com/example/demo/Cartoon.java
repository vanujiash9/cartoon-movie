package com.example.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cartoonn")
public class Cartoon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String description;
    private Integer release_year;
    private Integer total_episodes;
    private String image_url;
    private String trailer_url;
    private LocalDateTime created_at;

    @OneToMany(mappedBy = "cartoon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Episode> episodes = new ArrayList<>();

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRelease_year() { return release_year; }
    public void setRelease_year(Integer release_year) { this.release_year = release_year; }

    public Integer getTotal_episodes() { return total_episodes; }
    public void setTotal_episodes(Integer total_episodes) { this.total_episodes = total_episodes; }

    public String getImage_url() { return image_url; }
    public void setImage_url(String image_url) { this.image_url = image_url; }

    public String getTrailer_url() { return trailer_url; }
    public void setTrailer_url(String trailer_url) { this.trailer_url = trailer_url; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public List<Episode> getEpisodes() { return episodes; }
    public void setEpisodes(List<Episode> episodes) { this.episodes = episodes; }
}