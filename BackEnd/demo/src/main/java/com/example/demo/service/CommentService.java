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
    private UserAchievementService userAchievementService;

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
            userAchievementService.checkAndGrantAchievements(savedComment.getUser());
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
        
        if (existingLike.isPresent()) {
            CommentLike like = existingLike.get();
            if (like.isLiked() == isLiked) {
                // User clicked same action, remove the like/dislike
                commentLikeRepository.delete(like);
            } else {
                // User changed from like to dislike or vice versa
                like.setLiked(isLiked);
                commentLikeRepository.save(like);
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
            }
        }
        
        // Trigger achievement check for comment owner (100 likes achievement)
        if (commentOwner != null && isLiked) {
            userAchievementService.checkAndGrantAchievements(commentOwner);
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
