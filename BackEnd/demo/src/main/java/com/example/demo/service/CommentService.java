package com.example.demo.service;

import com.example.demo.entity.Comment;
import com.example.demo.entity.CommentLike;
import com.example.demo.entity.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.CommentLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private CommentLikeRepository commentLikeRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AchievementService achievementService;
    
    @Autowired
    private NotificationService notificationService;

    // Lấy danh sách comments của một phim
    public List<Comment> getCommentsByCartoonId(Long cartoonId) {
        return commentRepository.findByCartoonIdAndParentCommentIsNull(cartoonId);
    }

    // Lấy replies của một comment
    public List<Comment> getRepliesByParentId(Long parentId) {
        return commentRepository.findByParentCommentId(parentId);
    }

    // Lưu comment
    public Comment save(Comment comment) {
        Comment savedComment = commentRepository.save(comment);
        
        // Trigger achievement check for first review
        if (savedComment.getUser() != null) {
            achievementService.updateUserAchievementProgress(savedComment.getUser().getId(), "REVIEW", savedComment.getCartoonId());
        }
        
        // Send notification if this is a reply to another comment
        if (savedComment.getParentComment() != null && savedComment.getParentComment().getUser() != null) {
            User parentCommentOwner = savedComment.getParentComment().getUser();
            User replier = savedComment.getUser();
            notificationService.notifyCommentReply(parentCommentOwner, replier, 
                savedComment.getParentComment().getId().intValue());
        }
        
        return savedComment;
    }

    // Tìm comment theo ID
    public Comment findById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }

    // Xóa comment
    public void deleteById(Long id) {
        commentRepository.deleteById(id);
    }

    // Đếm số comments của một phim
    public Long getCommentCount(Long cartoonId) {
        return commentRepository.countByCartoonId(cartoonId);
    }

    // Lấy số likes của một comment
    public Long getLikeCount(Long commentId) {
        return commentLikeRepository.countLikesByCommentId(commentId);
    }

    // Lấy số dislikes của một comment
    public Long getDislikeCount(Long commentId) {
        return commentLikeRepository.countDislikesByCommentId(commentId);
    }

    // Lấy like status của user cho một comment
    public Optional<CommentLike> getUserLike(Long commentId, Integer userId) {
        return commentLikeRepository.findByCommentIdAndUserId(commentId, userId);
    }

    // Toggle like/dislike
    @Transactional
    public void toggleLike(Long commentId, Integer userId, boolean isLiked) {
        Optional<CommentLike> existingLike = commentLikeRepository.findByCommentIdAndUserId(commentId, userId);
        
        Comment comment = commentRepository.findById(commentId).orElse(null);
        User commentOwner = comment != null ? comment.getUser() : null;
        User liker = userService.getById(userId).orElse(null);
        
        if (existingLike.isPresent()) {
            CommentLike like = existingLike.get();
            if (like.isLiked() == isLiked) {
                // User clicked same action, remove the like/dislike
                commentLikeRepository.delete(like);
            } else {
                // User changed from like to dislike or vice versa
                like.setLiked(isLiked);
                commentLikeRepository.save(like);
                
                // Send notification for new like (not dislike)
                if (isLiked && commentOwner != null && liker != null) {
                    notificationService.notifyCommentLiked(commentOwner, liker, commentId.intValue());
                }
            }
        } else {
            // Create new like/dislike
            Optional<User> userOpt = userService.getById(userId);
            if (comment != null && userOpt.isPresent()) {
                CommentLike newLike = new CommentLike();
                newLike.setComment(comment);
                newLike.setUser(userOpt.get());
                newLike.setLiked(isLiked);
                commentLikeRepository.save(newLike);
                
                // Send notification for new like (not dislike)
                if (isLiked && commentOwner != null && liker != null) {
                    notificationService.notifyCommentLiked(commentOwner, liker, commentId.intValue());
                }
            }
        }
        
        // Trigger achievement check for comment owner (100 likes achievement)
        if (commentOwner != null && isLiked) {
            // Kích hoạt thành tựu cho người chủ comment (ví dụ: nhận 100 likes)
            achievementService.updateUserAchievementProgress(commentOwner.getId(), "RECEIVE_LIKE", null);
        }
    }

    // Lấy comment mới nhất
    public List<Comment> getLatestComments(int count) {
        List<Comment> comments = commentRepository.findAll();
        return comments.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(count)
                .toList();
    }

    // Đếm số comment trong tháng hiện tại
    public long countCommentsInCurrentMonth() {
        java.time.LocalDate now = java.time.LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();
        return commentRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null &&
                        c.getCreatedAt().getYear() == currentYear &&
                        c.getCreatedAt().getMonthValue() == currentMonth)
                .count();
    }

    // Tính trung bình rating
    public double getAverageRating() {
        List<Comment> comments = commentRepository.findAll();
        return comments.stream()
                .filter(c -> c.getRating() != null)
                .mapToDouble(Comment::getRating)
                .average()
                .orElse(0.0);
    }

    // Lấy tất cả comments
    public List<Comment> getAll() {
        return commentRepository.findAll();
    }

    // Lấy comments theo cartoon ID (sử dụng Integer thay vì Long để tương thích với controller)
    public List<Comment> getByCartoonId(Integer cartoonId) {
        return commentRepository.findByCartoonIdAndParentCommentIsNull(cartoonId.longValue());
    }

    // Xóa comment theo ID (sử dụng Integer để tương thích với controller)
    public void deleteComment(Integer id) {
        commentRepository.deleteById(id.longValue());
    }
}
