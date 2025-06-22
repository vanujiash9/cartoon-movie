package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "related_id")
    private Integer relatedId; // ID của đối tượng liên quan

    @Column(name = "related_type")
    private String relatedType; // Loại đối tượng (CARTOON, COMMENT, ACHIEVEMENT, etc.)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Constructors
    public Notification() {}

    public Notification(User user, String title, String content, NotificationType type) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.type = type;
    }

    public Notification(User user, String title, String content, NotificationType type, Integer relatedId, String relatedType) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.type = type;
        this.relatedId = relatedId;
        this.relatedType = relatedType;
    }

    // Enum for notification types
    public enum NotificationType {
        ACHIEVEMENT("🏆", "#FFD700"),
        LIKE("❤️", "#FF6B6B"),
        COMMENT("💬", "#4ECDC4"),
        REPLY("↩️", "#45B7D1"),
        PROFILE_UPDATE("👤", "#96CEB4"),
        SYSTEM("⚙️", "#6C5CE7"),
        WARNING("⚠️", "#FDCB6E"),
        SUCCESS("✅", "#00B894");

        private final String icon;
        private final String color;

        NotificationType(String icon, String color) {
            this.icon = icon;
            this.color = color;
        }

        public String getIcon() { return icon; }
        public String getColor() { return color; }
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { 
        this.isRead = isRead;
        if (isRead && this.readAt == null) {
            this.readAt = LocalDateTime.now();
        }
    }

    public Integer getRelatedId() { return relatedId; }
    public void setRelatedId(Integer relatedId) { this.relatedId = relatedId; }

    public String getRelatedType() { return relatedType; }
    public void setRelatedType(String relatedType) { this.relatedType = relatedType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}