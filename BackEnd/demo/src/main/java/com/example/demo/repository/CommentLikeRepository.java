package com.example.demo.repository;

import com.example.demo.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    
    // Tìm like/dislike của user cho một comment
    @Query("SELECT cl FROM CommentLike cl WHERE cl.comment.id = :commentId AND cl.user.id = :userId")
    Optional<CommentLike> findByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Integer userId);
    
    // Đếm số likes của một comment
    @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.comment.id = :commentId AND cl.isLiked = true")
    Long countLikesByCommentId(@Param("commentId") Long commentId);
    
    // Đếm số dislikes của một comment
    @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.comment.id = :commentId AND cl.isLiked = false")
    Long countDislikesByCommentId(@Param("commentId") Long commentId);
    
    // Xóa like/dislike của user cho một comment
    void deleteByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Integer userId);
    
    // Đếm likes theo comment và trạng thái liked
    @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.comment = :comment AND cl.isLiked = :liked")
    int countByCommentAndLiked(@Param("comment") com.example.demo.entity.Comment comment, @Param("liked") boolean liked);
}
