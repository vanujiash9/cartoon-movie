package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_shares")
public class UserShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "cartoon_id", nullable = false)
    private Cartoon cartoon;

    @Column(name = "platform", nullable = false)
    private String platform; // facebook, twitter, etc.

    @Column(name = "shared_at", nullable = false)
    private LocalDateTime sharedAt;

    // Constructors
    public UserShare() {
        this.sharedAt = LocalDateTime.now();
    }

    public UserShare(User user, Cartoon cartoon, String platform) {
        this();
        this.user = user;
        this.cartoon = cartoon;
        this.platform = platform;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Cartoon getCartoon() {
        return cartoon;
    }

    public void setCartoon(Cartoon cartoon) {
        this.cartoon = cartoon;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public LocalDateTime getSharedAt() {
        return sharedAt;
    }

    public void setSharedAt(LocalDateTime sharedAt) {
        this.sharedAt = sharedAt;
    }
}
