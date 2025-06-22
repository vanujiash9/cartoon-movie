package com.example.demo.repository;

import com.example.demo.entity.CartoonLike;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartoonLikeRepository extends JpaRepository<CartoonLike, Long> {

    // Tìm like/dislike của user cho một cartoon cụ thể
    Optional<CartoonLike> findByCartoonAndUser(Cartoon cartoon, User user);

    // Đếm số like của một cartoon
    @Query("SELECT COUNT(cl) FROM CartoonLike cl WHERE cl.cartoon = :cartoon AND cl.isLiked = true")
    int countLikesByCartoon(@Param("cartoon") Cartoon cartoon);

    // Đếm số dislike của một cartoon
    @Query("SELECT COUNT(cl) FROM CartoonLike cl WHERE cl.cartoon = :cartoon AND cl.isLiked = false")
    int countDislikesByCartoon(@Param("cartoon") Cartoon cartoon);

    // Kiểm tra user đã like cartoon chưa
    @Query("SELECT cl.isLiked FROM CartoonLike cl WHERE cl.cartoon = :cartoon AND cl.user = :user")
    Optional<Boolean> findUserLikeStatus(@Param("cartoon") Cartoon cartoon, @Param("user") User user);

    // Xóa like/dislike của user cho cartoon
    void deleteByCartoonAndUser(Cartoon cartoon, User user);
}
