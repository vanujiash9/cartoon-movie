package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "episodes")
public class Episode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "episode_num")
    private Integer episode_number;

    @Column(name = "video_url")
    private String video_url;

    @Column(name = "thumbnail_url")
    private String thumbnail_url;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "views")
    private Integer views = 0;

    @Column(name = "season_num")
    private Integer season_number = 1;

    @Column(name = "created_at")
    private LocalDateTime created_at;

    @ManyToOne
    @JoinColumn(name = "cartoon_id")
    private Cartoon cartoon;

    public Episode() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getEpisode_number() { return episode_number; }
    public void setEpisode_number(Integer episode_number) { this.episode_number = episode_number; }

    public String getVideo_url() { return video_url; }
    public void setVideo_url(String video_url) { this.video_url = video_url; }

    public String getThumbnail_url() { return thumbnail_url; }
    public void setThumbnail_url(String thumbnail_url) { this.thumbnail_url = thumbnail_url; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }

    public Integer getSeason_number() { return season_number; }
    public void setSeason_number(Integer season_number) { this.season_number = season_number; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public Cartoon getCartoon() { return cartoon; }
    public void setCartoon(Cartoon cartoon) { this.cartoon = cartoon; }

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
    }
}
