package com.example.demo.dto;

public class UserAchievementDTO {
    private Integer id;
    private Integer userId;
    private Integer achievementId;
    private String achievedAt;
    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public Integer getAchievementId() { return achievementId; }
    public void setAchievementId(Integer achievementId) { this.achievementId = achievementId; }
    public String getAchievedAt() { return achievedAt; }
    public void setAchievedAt(String achievedAt) { this.achievedAt = achievedAt; }
}
