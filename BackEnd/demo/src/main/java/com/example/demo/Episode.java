package com.example.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "episodes")
public class Episode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "cartoonn_id", nullable = false)
    private Cartoon cartoon;

    @Column(nullable = false)
    private Integer episode_number;

    @Column(length = 255)
    private String title;

    @Column(length = 500)
    private String video_url;

    @Column(length = 500)
    private String thumbnail_url;

    private Integer duration;

    private Integer views = 0;

    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime created_at;

    // Getters & Setters

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Cartoon getCartoon() { return cartoon; }
    public void setCartoon(Cartoon cartoon) { this.cartoon = cartoon; }

    public Integer getEpisode_number() { return episode_number; }
    public void setEpisode_number(Integer episode_number) { this.episode_number = episode_number; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getVideo_url() { return video_url; }
    public void setVideo_url(String video_url) { this.video_url = video_url; }

    public String getThumbnail_url() { return thumbnail_url; }
    public void setThumbnail_url(String thumbnail_url) { this.thumbnail_url = thumbnail_url; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }
}