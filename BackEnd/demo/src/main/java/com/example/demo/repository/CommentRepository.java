package com.example.demo.repository;

import com.example.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Lấy comments của một phim (chỉ parent comments, không bao gồm replies)
    @Query("SELECT c FROM Comment c WHERE c.cartoon.id = :cartoonId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByCartoonIdAndParentCommentIsNull(@Param("cartoonId") Long cartoonId);
    
    // Lấy replies của một comment
    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentId ORDER BY c.createdAt ASC")
    List<Comment> findByParentCommentId(@Param("parentId") Long parentId);
    
    // Đếm số comments của một phim
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.cartoon.id = :cartoonId")
    Long countByCartoonId(@Param("cartoonId") Long cartoonId);
    
    // Lấy comments của một user
    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Comment> findByUserId(@Param("userId") Long userId);
    
    // Tính average rating và count cho một cartoon
    @Query("SELECT AVG(c.rating), COUNT(c) FROM Comment c WHERE c.cartoon.id = :cartoonId")
    Object[] findAverageRatingAndCountByCartoonId(@Param("cartoonId") Integer cartoonId);
    
    // Lấy comments với thông tin user cho một cartoon
    @Query("SELECT c.id, c.content, c.rating, c.createdAt, u.username FROM Comment c JOIN c.user u WHERE c.cartoon.id = :cartoonId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Object[]> findCommentsForCartoon(@Param("cartoonId") Integer cartoonId);
}
