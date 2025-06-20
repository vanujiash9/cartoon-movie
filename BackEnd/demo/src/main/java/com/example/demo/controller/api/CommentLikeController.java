package com.example.demo.controller.api;

import com.example.demo.entity.Comment;
import com.example.demo.entity.CommentLike;
import com.example.demo.entity.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.CommentLikeRepository;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentLikeController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private UserService userService;

    // Like hoặc dislike một comment
    @PostMapping("/{commentId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long commentId, @RequestBody Map<String, Boolean> body) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy thông tin user hiện tại
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                response.put("success", false);
                response.put("message", "Bạn cần đăng nhập để thực hiện hành động này");
                return ResponseEntity.status(401).body(response);
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            if (user == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy thông tin người dùng");
                return ResponseEntity.status(404).body(response);
            }

            // Kiểm tra comment có tồn tại không
            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (!commentOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy bình luận");
                return ResponseEntity.status(404).body(response);
            }

            Comment comment = commentOpt.get();
            boolean isLike = body.getOrDefault("isLike", true);

            // Kiểm tra user đã like/dislike comment này chưa
            Optional<CommentLike> existingLike = commentLikeRepository.findByCommentIdAndUserId(commentId, user.getId());

            if (existingLike.isPresent()) {
                CommentLike like = existingLike.get();
                if (like.isLiked() == isLike) {
                    // Nếu click lại cùng action thì xóa like/dislike
                    commentLikeRepository.delete(like);
                    response.put("action", "removed");
                } else {
                    // Nếu khác action thì cập nhật
                    like.setLiked(isLike);
                    commentLikeRepository.save(like);
                    response.put("action", isLike ? "liked" : "disliked");
                }
            } else {
                // Tạo mới like/dislike
                CommentLike newLike = new CommentLike(comment, user, isLike);
                commentLikeRepository.save(newLike);
                response.put("action", isLike ? "liked" : "disliked");
            }

            // Lấy số lượng like/dislike mới
            Long likeCount = commentLikeRepository.countLikesByCommentId(commentId);
            Long dislikeCount = commentLikeRepository.countDislikesByCommentId(commentId);

            response.put("success", true);
            response.put("likeCount", likeCount);
            response.put("dislikeCount", dislikeCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Lấy thông tin like/dislike của comment
    @GetMapping("/{commentId}/likes")
    public ResponseEntity<Map<String, Object>> getLikeInfo(@PathVariable Long commentId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Kiểm tra comment có tồn tại không
            if (!commentRepository.existsById(commentId)) {
                response.put("success", false);
                response.put("message", "Không tìm thấy bình luận");
                return ResponseEntity.status(404).body(response);
            }

            Long likeCount = commentLikeRepository.countLikesByCommentId(commentId);
            Long dislikeCount = commentLikeRepository.countDislikesByCommentId(commentId);

            // Kiểm tra user hiện tại đã like/dislike chưa
            String userAction = "none";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                User user = userService.findByUsername(username);
                if (user != null) {
                    Optional<CommentLike> userLike = commentLikeRepository.findByCommentIdAndUserId(commentId, user.getId());
                    if (userLike.isPresent()) {
                        userAction = userLike.get().isLiked() ? "liked" : "disliked";
                    }
                }
            }

            response.put("success", true);
            response.put("likeCount", likeCount);
            response.put("dislikeCount", dislikeCount);
            response.put("userAction", userAction);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
