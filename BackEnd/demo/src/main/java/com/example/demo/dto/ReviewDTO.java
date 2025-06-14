package com.example.demo.dto;

import java.time.LocalDateTime;

public class ReviewDTO {
    private Integer id;
    private String username;
    private String userRole;
    private String content;
    private Integer rating;
    private LocalDateTime createdAt;
    private Integer cartoonId;
    private String cartoonTitle;

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Integer getCartoonId() { return cartoonId; }
    public void setCartoonId(Integer cartoonId) { this.cartoonId = cartoonId; }
    public String getCartoonTitle() { return cartoonTitle; }
    public void setCartoonTitle(String cartoonTitle) { this.cartoonTitle = cartoonTitle; }
}
