package com.example.demo.controller;

import com.example.demo.entity.Comment;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.CommentLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/cartoons")
public class CartoonController {
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private CommentLikeRepository commentLikeRepository;



    // Lấy danh sách bình luận theo id phim
    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Integer id) {
        return commentRepository.findByCartoonIdAndParentCommentIsNull(Long.valueOf(id));
    }

    // Lấy tổng số lượt thích của tất cả comment thuộc phim
    @GetMapping("/{id}/likes")
    public int getLikes(@PathVariable Integer id) {
        List<Comment> comments = commentRepository.findByCartoonIdAndParentCommentIsNull(Long.valueOf(id));
        int totalLikes = 0;
        for (Comment comment : comments) {
            totalLikes += commentLikeRepository.countByCommentAndLiked(comment, true);
        }
        return totalLikes;
    }
}
