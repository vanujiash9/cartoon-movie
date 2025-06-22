package com.example.demo.controller;

import com.example.demo.entity.Comment;
import com.example.demo.entity.CommentLike;
import com.example.demo.entity.Cartoon;
import com.example.demo.entity.CartoonLike;
import com.example.demo.entity.Episode;
import com.example.demo.entity.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.CommentLikeRepository;
import com.example.demo.repository.CartoonLikeRepository;
import com.example.demo.service.CartoonService;
import com.example.demo.service.EpisodeService;
import com.example.demo.service.UserService;
import com.example.demo.dto.CommentDTO;
import com.example.demo.dto.ReplyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cartoons")
public class CartoonController {
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private CommentLikeRepository commentLikeRepository;
    @Autowired
    private CartoonLikeRepository cartoonLikeRepository;
    @Autowired
    private CartoonService cartoonService;
    @Autowired
    private EpisodeService episodeService;
    @Autowired
    private UserService userService;

    // Lấy danh sách bình luận theo id phim (trả về replies và user info)
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getCommentsWithReplies(@PathVariable Integer id) {
        List<Comment> parentComments = commentRepository.findByCartoonIdAndParentCommentIsNull(Long.valueOf(id));
        List<CommentDTO> result = new java.util.ArrayList<>();
        for (Comment comment : parentComments) {
            CommentDTO commentDTO = toCommentDTO(comment);
            result.add(commentDTO);
        }
        return ResponseEntity.ok(result);
    }

    // Chuyển đổi Comment sang CommentDTO (bao gồm replies)
    private CommentDTO toCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setRating(comment.getRating());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUserName(comment.getUser() != null ? comment.getUser().getUsername() : "Ẩn danh");
        dto.setUserAvatar(
                comment.getUser() != null && comment.getUser().getAvatar() != null ? comment.getUser().getAvatar()
                        : "A");
        dto.setLikeCount(commentLikeRepository.countByCommentAndLiked(comment, true));
        dto.setDislikeCount(commentLikeRepository.countByCommentAndLiked(comment, false));
        // Replies
        List<Comment> replies = commentRepository.findByParentCommentId(comment.getId());
        List<ReplyDTO> repliesData = new java.util.ArrayList<>();
        for (Comment reply : replies) {
            ReplyDTO replyDTO = new ReplyDTO();
            replyDTO.setId(reply.getId());
            replyDTO.setContent(reply.getContent());
            replyDTO.setRating(reply.getRating());
            replyDTO.setCreatedAt(reply.getCreatedAt());
            replyDTO.setUserName(reply.getUser() != null ? reply.getUser().getUsername() : "Ẩn danh");
            replyDTO.setUserAvatar(
                    reply.getUser() != null && reply.getUser().getAvatar() != null ? reply.getUser().getAvatar() : "A");
            replyDTO.setLikeCount(commentLikeRepository.countByCommentAndLiked(reply, true));
            replyDTO.setDislikeCount(commentLikeRepository.countByCommentAndLiked(reply, false));
            repliesData.add(replyDTO);
        }
        dto.setReplies(repliesData);
        return dto;
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
    } // Like phim

    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likeCartoon(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        try {
            // Lấy thông tin user hiện tại
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để thực hiện hành động này"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy user"));
            }

            // Lấy thông tin cartoon
            Optional<Cartoon> cartoonOpt = cartoonService.getById(id.intValue());
            if (!cartoonOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy phim"));
            }

            Cartoon cartoon = cartoonOpt.get();
            boolean isLiked = body.getOrDefault("isLiked", false);

            // Kiểm tra xem user đã like/dislike phim này chưa
            Optional<CartoonLike> existingLike = cartoonLikeRepository.findByCartoonAndUser(cartoon, user);

            if (existingLike.isPresent()) {
                CartoonLike like = existingLike.get();
                if (like.isLiked() == isLiked) {
                    // Nếu trạng thái giống nhau, xóa like/dislike (toggle off)
                    cartoonLikeRepository.delete(like);
                } else {
                    // Nếu khác trạng thái, cập nhật
                    like.setLiked(isLiked);
                    cartoonLikeRepository.save(like);
                }
            } else {
                // Tạo mới
                CartoonLike newLike = new CartoonLike(cartoon, user, isLiked);
                cartoonLikeRepository.save(newLike);
            }

            // Lấy lại thống kê
            int likeCount = cartoonLikeRepository.countLikesByCartoon(cartoon);
            int dislikeCount = cartoonLikeRepository.countDislikesByCartoon(cartoon);
            Optional<Boolean> userLikeStatus = cartoonLikeRepository.findUserLikeStatus(cartoon, user);

            Map<String, Object> result = new HashMap<>();
            result.put("likeCount", likeCount);
            result.put("dislikeCount", dislikeCount);
            result.put("isLiked", userLikeStatus.orElse(null) == Boolean.TRUE);
            result.put("isDisliked", userLikeStatus.orElse(null) == Boolean.FALSE);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Dislike phim
    @PostMapping("/{id}/dislike")
    @Transactional
    public ResponseEntity<?> dislikeCartoon(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        try {
            // Lấy thông tin user hiện tại
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để thực hiện hành động này"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy user"));
            }

            // Lấy thông tin cartoon
            Optional<Cartoon> cartoonOpt = cartoonService.getById(id.intValue());
            if (!cartoonOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy phim"));
            }

            Cartoon cartoon = cartoonOpt.get();
            boolean isDisliked = body.getOrDefault("isDisliked", false);

            // Kiểm tra xem user đã like/dislike phim này chưa
            Optional<CartoonLike> existingLike = cartoonLikeRepository.findByCartoonAndUser(cartoon, user);

            if (existingLike.isPresent()) {
                CartoonLike like = existingLike.get();
                if (like.isLiked() != isDisliked) {
                    // Nếu trạng thái giống nhau (dislike = !like), xóa like/dislike (toggle off)
                    cartoonLikeRepository.delete(like);
                } else {
                    // Nếu khác trạng thái, cập nhật
                    like.setLiked(!isDisliked);
                    cartoonLikeRepository.save(like);
                }
            } else {
                // Tạo mới
                CartoonLike newLike = new CartoonLike(cartoon, user, !isDisliked);
                cartoonLikeRepository.save(newLike);
            }

            // Lấy lại thống kê
            int likeCount = cartoonLikeRepository.countLikesByCartoon(cartoon);
            int dislikeCount = cartoonLikeRepository.countDislikesByCartoon(cartoon);
            Optional<Boolean> userLikeStatus = cartoonLikeRepository.findUserLikeStatus(cartoon, user);

            Map<String, Object> result = new HashMap<>();
            result.put("likeCount", likeCount);
            result.put("dislikeCount", dislikeCount);
            result.put("isLiked", userLikeStatus.orElse(null) == Boolean.TRUE);
            result.put("isDisliked", userLikeStatus.orElse(null) == Boolean.FALSE);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Lấy thống kê like/dislike của phim
    @GetMapping("/{id}/like-stats")
    public ResponseEntity<?> getCartoonLikeStats(@PathVariable Long id) {
        try {
            Optional<Cartoon> cartoonOpt = cartoonService.getById(id.intValue());
            if (!cartoonOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy phim"));
            }

            Cartoon cartoon = cartoonOpt.get();
            int likeCount = cartoonLikeRepository.countLikesByCartoon(cartoon);
            int dislikeCount = cartoonLikeRepository.countDislikesByCartoon(cartoon);

            // Kiểm tra trạng thái của user hiện tại (nếu đã đăng nhập)
            Boolean userIsLiked = null;
            Boolean userIsDisliked = null;

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                User user = userService.findByUsername(username);
                if (user != null) {
                    Optional<Boolean> userLikeStatus = cartoonLikeRepository.findUserLikeStatus(cartoon, user);
                    if (userLikeStatus.isPresent()) {
                        userIsLiked = userLikeStatus.get();
                        userIsDisliked = !userLikeStatus.get();
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("likeCount", likeCount);
            result.put("dislikeCount", dislikeCount);
            result.put("isLiked", userIsLiked != null ? userIsLiked : false);
            result.put("isDisliked", userIsDisliked != null ? userIsDisliked : false);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Like comment
    @PostMapping("/comments/{commentId}/like")
    @Transactional
    public ResponseEntity<?> likeComment(
            @PathVariable Long commentId,
            @RequestBody Map<String, Boolean> body) {
        try {
            // Lấy thông tin user hiện tại
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để thực hiện hành động này"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy user"));
            }

            // Lấy thông tin comment
            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (!commentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy comment"));
            }

            Comment comment = commentOpt.get();
            boolean isLiked = body.getOrDefault("isLiked", false);

            // Kiểm tra xem user đã like/dislike comment này chưa
            Optional<CommentLike> existingLike = commentLikeRepository.findByCommentAndUser(comment, user);

            if (existingLike.isPresent()) {
                CommentLike like = existingLike.get();
                if (like.isLiked() == isLiked) {
                    // Nếu trạng thái giống nhau, xóa like/dislike (toggle off)
                    commentLikeRepository.delete(like);
                } else {
                    // Nếu khác trạng thái, cập nhật
                    like.setLiked(isLiked);
                    commentLikeRepository.save(like);
                }
            } else {
                // Tạo mới
                CommentLike newLike = new CommentLike(comment, user, isLiked);
                commentLikeRepository.save(newLike);
            }

            // Lấy lại thống kê
            int likeCount = commentLikeRepository.countByCommentAndLiked(comment, true);
            int dislikeCount = commentLikeRepository.countByCommentAndLiked(comment, false);
            Optional<CommentLike> userLike = commentLikeRepository.findByCommentAndUser(comment, user);

            Map<String, Object> result = new HashMap<>();
            result.put("likeCount", likeCount);
            result.put("dislikeCount", dislikeCount);
            result.put("isLiked", userLike.isPresent() && userLike.get().isLiked());
            result.put("isDisliked", userLike.isPresent() && !userLike.get().isLiked());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Dislike comment
    @PostMapping("/comments/{commentId}/dislike")
    @Transactional
    public ResponseEntity<?> dislikeComment(
            @PathVariable Long commentId,
            @RequestBody Map<String, Boolean> body) {
        try {
            // Lấy thông tin user hiện tại
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để thực hiện hành động này"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy user"));
            }

            // Lấy thông tin comment
            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (!commentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy comment"));
            }

            Comment comment = commentOpt.get();
            boolean isDisliked = body.getOrDefault("isDisliked", false);

            // Kiểm tra xem user đã like/dislike comment này chưa
            Optional<CommentLike> existingLike = commentLikeRepository.findByCommentAndUser(comment, user);

            if (existingLike.isPresent()) {
                CommentLike like = existingLike.get();
                if (like.isLiked() != isDisliked) {
                    // Nếu trạng thái giống nhau (dislike = !like), xóa like/dislike (toggle off)
                    commentLikeRepository.delete(like);
                } else {
                    // Nếu khác trạng thái, cập nhật
                    like.setLiked(!isDisliked);
                    commentLikeRepository.save(like);
                }
            } else {
                // Tạo mới
                CommentLike newLike = new CommentLike(comment, user, !isDisliked);
                commentLikeRepository.save(newLike);
            }

            // Lấy lại thống kê
            int likeCount = commentLikeRepository.countByCommentAndLiked(comment, true);
            int dislikeCount = commentLikeRepository.countByCommentAndLiked(comment, false);
            Optional<CommentLike> userLike = commentLikeRepository.findByCommentAndUser(comment, user);

            Map<String, Object> result = new HashMap<>();
            result.put("likeCount", likeCount);
            result.put("dislikeCount", dislikeCount);
            result.put("isLiked", userLike.isPresent() && userLike.get().isLiked());
            result.put("isDisliked", userLike.isPresent() && !userLike.get().isLiked());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Lấy thống kê like/dislike của comment
    @GetMapping("/comments/{commentId}/like-stats")
    public ResponseEntity<?> getCommentLikeStats(@PathVariable Long commentId) {
        try {
            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (!commentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy comment"));
            }

            Comment comment = commentOpt.get();
            int likeCount = commentLikeRepository.countByCommentAndLiked(comment, true);
            int dislikeCount = commentLikeRepository.countByCommentAndLiked(comment, false);

            // Kiểm tra trạng thái của user hiện tại (nếu đã đăng nhập)
            Boolean userIsLiked = false;
            Boolean userIsDisliked = false;

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                User user = userService.findByUsername(username);
                if (user != null) {
                    Optional<CommentLike> userLike = commentLikeRepository.findByCommentAndUser(comment, user);
                    if (userLike.isPresent()) {
                        userIsLiked = userLike.get().isLiked();
                        userIsDisliked = !userLike.get().isLiked();
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("likeCount", likeCount);
            result.put("dislikeCount", dislikeCount);
            result.put("isLiked", userIsLiked);
            result.put("isDisliked", userIsDisliked);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Tạo comment mới cho phim
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> commentData) {
        try {
            // Lấy thông tin user hiện tại
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để bình luận"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy user"));
            }

            // Kiểm tra cartoon có tồn tại không
            Optional<Cartoon> cartoonOpt = cartoonService.getById(id.intValue());
            if (!cartoonOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy phim"));
            }

            String content = (String) commentData.get("content");
            Integer rating = commentData.get("rating") != null ? Integer.parseInt(commentData.get("rating").toString())
                    : 0;
            Long parentId = commentData.get("parentId") != null ? Long.parseLong(commentData.get("parentId").toString())
                    : null;

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Nội dung bình luận không được trống"));
            }
            // Tạo comment mới
            Comment comment = new Comment();
            comment.setCartoon(cartoonOpt.get());
            comment.setUser(user);
            comment.setContent(content.trim());
            comment.setRating(rating);
            if (parentId != null) {
                Optional<Comment> parentComment = commentRepository.findById(parentId);
                if (parentComment.isPresent()) {
                    comment.setParentComment(parentComment.get());
                }
            }

            Comment savedComment = commentRepository.save(comment);

            Map<String, Object> result = new HashMap<>();
            result.put("id", savedComment.getId());
            result.put("content", savedComment.getContent());
            result.put("rating", savedComment.getRating());
            result.put("username", user.getUsername());
            result.put("createdAt", savedComment.getCreatedAt());

            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Xóa comment
    @DeleteMapping("/comments/{commentId}")
    @Transactional
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        try {
            // Lấy thông tin user hiện tại
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để xóa bình luận"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy user"));
            }

            // Tìm comment
            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (!commentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy bình luận"));
            }

            Comment comment = commentOpt.get();

            // Kiểm tra quyền xóa (chỉ cho phép user tạo comment hoặc admin)
            if (!comment.getUser().getId().equals(user.getId()) &&
                    !"ADMIN".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Bạn không có quyền xóa bình luận này"));
            }

            // Xóa các like/dislike của comment trước
            commentLikeRepository.deleteAll(
                    commentLikeRepository.findAll().stream()
                            .filter(cl -> cl.getComment().getId().equals(commentId))
                            .collect(java.util.stream.Collectors.toList()));

            // Xóa comment
            commentRepository.delete(comment);

            return ResponseEntity.ok(Map.of("message", "Đã xóa bình luận thành công"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Load thông tin phim với thống kê like/dislike
    @GetMapping("/{id}")
    public ResponseEntity<?> getCartoonWithStats(@PathVariable Long id) {
        try {
            Optional<Cartoon> cartoonOpt = cartoonService.getById(id.intValue());
            if (!cartoonOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy phim"));
            }

            Cartoon cartoon = cartoonOpt.get();

            // Lấy thống kê like/dislike
            int likeCount = cartoonLikeRepository.countLikesByCartoon(cartoon);
            int dislikeCount = cartoonLikeRepository.countDislikesByCartoon(cartoon);

            // Kiểm tra trạng thái của user hiện tại (nếu đã đăng nhập)
            Boolean userIsLiked = null;
            Boolean userIsDisliked = null;

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                User user = userService.findByUsername(username);
                if (user != null) {
                    Optional<Boolean> userLikeStatus = cartoonLikeRepository.findUserLikeStatus(cartoon, user);
                    if (userLikeStatus.isPresent()) {
                        userIsLiked = userLikeStatus.get();
                        userIsDisliked = !userLikeStatus.get();
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("cartoon", cartoon);
            result.put("likeCount", likeCount);
            result.put("dislikeCount", dislikeCount);
            result.put("isLiked", userIsLiked != null ? userIsLiked : false);
            result.put("isDisliked", userIsDisliked != null ? userIsDisliked : false);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Lấy danh sách tất cả phim
    @GetMapping
    public ResponseEntity<List<Cartoon>> getAllCartoons() {
        try {
            List<Cartoon> cartoons = cartoonService.getAll();
            return ResponseEntity.ok(cartoons);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // Lấy danh sách phim hot/nổi bật
    @GetMapping("/hot")
    public ResponseEntity<List<Cartoon>> getHotCartoons() {
        try {
            List<Cartoon> cartoons = cartoonService.getAll();
            // Có thể sắp xếp theo lượt xem, rating, hoặc ngày tạo
            // Ở đây tạm thời lấy 10 phim đầu tiên
            List<Cartoon> hotCartoons = cartoons.stream()
                    .limit(10)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(hotCartoons);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    } // Lấy danh sách episodes của phim

    @GetMapping("/{id}/episodes")
    public ResponseEntity<List<Map<String, Object>>> getCartoonEpisodes(@PathVariable Long id) {
        try {
            Optional<Cartoon> cartoonOpt = cartoonService.getById(id.intValue());
            if (!cartoonOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null);
            } // Lấy episodes thực tế từ database
            List<Episode> episodeList = episodeService.getByCartoonId(id.intValue());

            List<Map<String, Object>> episodes = new java.util.ArrayList<>();
            for (Episode episode : episodeList) {
                Map<String, Object> episodeData = new HashMap<>();
                episodeData.put("id", episode.getId());
                episodeData.put("episodeNumber", episode.getEpisode_number());
                episodeData.put("episode_number", episode.getEpisode_number()); // Support both formats
                episodeData.put("title", episode.getTitle());
                episodeData.put("videoUrl", episode.getVideo_url());
                episodeData.put("video_url", episode.getVideo_url()); // Support both formats
                episodeData.put("thumbnailUrl", episode.getThumbnail_url() != null ? episode.getThumbnail_url()
                        : "https://via.placeholder.com/320x180?text=Episode+" + episode.getEpisode_number());
                episodeData.put("duration", episode.getDuration() != null ? episode.getDuration() : 24);
                episodeData.put("description", episode.getDescription() != null ? episode.getDescription()
                        : "Tập " + episode.getEpisode_number());
                episodeData.put("cartoonId",
                        episode.getCartoon() != null ? episode.getCartoon().getId() : id.intValue());
                episodeData.put("views", episode.getViews() != null ? episode.getViews() : 0);
                episodeData.put("seasonNumber", episode.getSeason_number() != null ? episode.getSeason_number() : 1);
                episodes.add(episodeData);
            }

            return ResponseEntity.ok(episodes);

        } catch (Exception e) {
            System.err.println("Error getting episodes for cartoon " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
