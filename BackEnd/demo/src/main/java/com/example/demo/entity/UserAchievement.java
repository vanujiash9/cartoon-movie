package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "user_achievements")
public class UserAchievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "achievement_id")
    private Achievement achievement;

    private int progress;

    @Temporal(TemporalType.TIMESTAMP)
    private Date achievedAt;

    @Column(name = "progress_details", columnDefinition = "TEXT")
    private String progressDetails; // JSON string to store details like watched movie IDs

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Achievement getAchievement() { return achievement; }
    public void setAchievement(Achievement achievement) { this.achievement = achievement; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    public Date getAchievedAt() { return achievedAt; }
    public void setAchievedAt(Date achievedAt) { this.achievedAt = achievedAt; }
    public String getProgressDetails() { return progressDetails; }
    public void setProgressDetails(String progressDetails) { this.progressDetails = progressDetails; }
}
