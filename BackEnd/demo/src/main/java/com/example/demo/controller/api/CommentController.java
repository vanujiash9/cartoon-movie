package com.example.demo.controller.api;

import com.example.demo.entity.Comment;
import com.example.demo.entity.CommentLike;
import com.example.demo.entity.User;
import com.example.demo.entity.Cartoon;
import com.example.demo.service.CommentService;
import com.example.demo.service.UserService;
import com.example.demo.service.CartoonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CartoonService cartoonService;

    // Lấy danh sách comments của một phim
    @GetMapping("/cartoon/{cartoonId}")
    public ResponseEntity<?> getCommentsByCartoon(@PathVariable Long cartoonId) {
        try {
            List<Comment> comments = commentService.getCommentsByCartoonId(cartoonId);
            
            // Convert to response format with like counts and user info
            List<Map<String, Object>> responseComments = comments.stream().map(comment -> {
                Map<String, Object> commentData = new HashMap<>();
                commentData.put("id", comment.getId());
                commentData.put("content", comment.getContent());
                commentData.put("rating", comment.getRating());
                commentData.put("createdAt", comment.getCreatedAt().toString());
                commentData.put("userName", comment.getUser().getFullName());
                commentData.put("userAvatar", comment.getUser().getFullName().substring(0, 1).toUpperCase());
                commentData.put("likeCount", commentService.getLikeCount(comment.getId()));
                commentData.put("dislikeCount", commentService.getDislikeCount(comment.getId()));
                
                // Check if current user has liked/disliked this comment
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                    try {
                        User currentUser = userService.findByUsername(auth.getName());
                        if (currentUser != null) {
                            Optional<CommentLike> userLike = commentService.getUserLike(comment.getId(), currentUser.getId());
                            if (userLike.isPresent()) {
                                commentData.put("userLikeStatus", userLike.get().isLiked() ? "liked" : "disliked");
                            } else {
                                commentData.put("userLikeStatus", null);
                            }
                        }
                    } catch (Exception e) {
                        commentData.put("userLikeStatus", null);
                    }
                } else {
                    commentData.put("userLikeStatus", null);
                }
                
                // Add replies
                List<Comment> replies = commentService.getRepliesByParentId(comment.getId());
                List<Map<String, Object>> replyData = replies.stream().map(reply -> {
                    Map<String, Object> replyMap = new HashMap<>();
                    replyMap.put("id", reply.getId());
                    replyMap.put("content", reply.getContent());
                    replyMap.put("createdAt", reply.getCreatedAt().toString());
                    replyMap.put("userName", reply.getUser().getFullName());
                    replyMap.put("userAvatar", reply.getUser().getFullName().substring(0, 1).toUpperCase());
                    return replyMap;
                }).toList();
                commentData.put("replies", replyData);
                
                return commentData;
            }).toList();
            
            return ResponseEntity.ok(responseComments);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể tải bình luận: " + e.getMessage()));
        }
    }

    // Đăng comment mới (yêu cầu authentication)
    @PostMapping("/cartoon/{cartoonId}")
    public ResponseEntity<?> postComment(
            @PathVariable Long cartoonId,
            @RequestBody Map<String, Object> commentData,
            @RequestHeader(value = "X-User-ID", required = false) String userIdHeader,
            @RequestHeader(value = "X-Username", required = false) String usernameHeader) {
        
        try {
            User currentUser = null;
            
            // Try to get user from Spring Security context first
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                currentUser = userService.findByUsername(auth.getName());
            }
            
            // If Spring Security auth failed, try custom headers
            if (currentUser == null && userIdHeader != null && usernameHeader != null) {
                try {
                    // Validate user from headers (simple validation)
                    currentUser = userService.findByUsername(usernameHeader);
                    if (currentUser == null || !currentUser.getId().toString().equals(userIdHeader)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("error", "Thông tin xác thực không hợp lệ"));
                    }
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Lỗi xác thực: " + e.getMessage()));
                }
            }
            
            // If still no user found, return unauthorized
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để bình luận"));
            }

            // Get cartoon
            Optional<Cartoon> cartoonOpt = cartoonService.getById(cartoonId.intValue());
            if (cartoonOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy phim"));
            }
            Cartoon cartoon = cartoonOpt.get();

            // Create comment
            Comment comment = new Comment();
            comment.setContent((String) commentData.get("content"));
            comment.setRating(Integer.parseInt(commentData.get("rating").toString()));
            comment.setUser(currentUser);
            comment.setCartoon(cartoon);
            comment.setCreatedAt(LocalDateTime.now());
            
            // Handle parent comment for replies
            if (commentData.containsKey("parentId") && commentData.get("parentId") != null) {
                Long parentId = Long.parseLong(commentData.get("parentId").toString());
                Comment parentComment = commentService.findById(parentId);
                if (parentComment != null) {
                    comment.setParentComment(parentComment);
                }
            }

            Comment savedComment = commentService.save(comment);
            
            // Return created comment data
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("id", savedComment.getId());
            responseData.put("content", savedComment.getContent());
            responseData.put("rating", savedComment.getRating());
            responseData.put("createdAt", savedComment.getCreatedAt().toString());
            responseData.put("userName", savedComment.getUser().getFullName());
            responseData.put("userAvatar", savedComment.getUser().getFullName().substring(0, 1).toUpperCase());
            responseData.put("likeCount", 0);
            responseData.put("dislikeCount", 0);
            responseData.put("userLikeStatus", null);
            responseData.put("replies", List.of());

            return ResponseEntity.status(HttpStatus.CREATED).body(responseData);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể đăng bình luận: " + e.getMessage()));
        }
    }



    // Delete comment (chỉ author hoặc admin)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập"));
            }

            User currentUser = userService.findByUsername(auth.getName());
            Comment comment = commentService.findById(commentId);
            
            if (comment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy bình luận"));
            }

            // Check if user is comment author or admin
            if (!comment.getUser().getId().equals(currentUser.getId()) && 
                !currentUser.getRole().toString().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Bạn không có quyền xóa bình luận này"));
            }

            commentService.deleteById(commentId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa bình luận thành công"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể xóa bình luận: " + e.getMessage()));
        }
    }
}
