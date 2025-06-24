# 🎬 Hướng Dẫn Test & Debug Movie Detail System

## Vấn đề đã được sửa

### ❌ Lỗi trước đây:
- "Tên phim không xác định" 
- "Chưa có mô tả cho bộ phim này"

### ✅ Nguyên nhân & giải pháp:
**Nguyên nhân:** API trả về object có cấu trúc `{cartoon: {...}, stats: {...}}` nhưng frontend đang truy cập trực tiếp vào `movie.title` thay vì `movie.cartoon.title`.

**Giải pháp:** Đã sửa script.js để:
1. Extract đúng data từ `movieResponse.cartoon`
2. Thêm log debug chi tiết
3. Hiển thị stats like/dislike
4. Xử lý fallback tốt hơn

## Test Cases

### 1. Test API Backend
```bash
# Test endpoint trả về data
curl -X GET "http://localhost:8080/api/cartoons/1" -H "Content-Type: application/json"

# Expected response structure:
{
  "cartoon": {
    "id": 1,
    "title": "Dragon Ball Z",
    "description": "Cuộc phiêu lưu của Son Goku...",
    ...
  },
  "likeCount": 1,
  "dislikeCount": 0,
  "isLiked": false,
  "isDisliked": false
}
```

### 2. Test Frontend
**URL test:** `http://localhost:5500/FrontEnd/test-movie-detail.html`

**Movie Detail URLs:**
- Dragon Ball Z: `movie-detail/movie_detail.html?id=1`
- Naruto: `movie-detail/movie_detail.html?id=2`
- Attack on Titan: `movie-detail/movie_detail.html?id=4`
- Demon Slayer: `movie-detail/movie_detail.html?id=6`
- Spirited Away: `movie-detail/movie_detail.html?id=7`
- Your Name: `movie-detail/movie_detail.html?id=8`

### 3. Debug Console Logs
Mở Developer Console (F12) và kiểm tra:

```javascript
// ✅ Logs hiện tại sẽ hiển thị:
🎬 Movie detail page loaded
📋 URL Parameters: {movieId: "1", fullURL: "...", search: "?id=1"}
🎬 Fetching details for movie ID: 1 from http://localhost:8080/api/cartoons/1
✅ API Response received: {cartoon: {...}, likeCount: 1, ...}
🎬 populateMovieDetails called with:
Raw movie data: {id: 1, title: "Dragon Ball Z", description: "..."}
Stats data: {likeCount: 1, dislikeCount: 0, isLiked: false, isDisliked: false}
✅ Processed data:
- Final title: Dragon Ball Z
- Final description: Cuộc phiêu lưu của Son Goku...
- Original title field: Dragon Ball Z
- Original description field: Cuộc phiêu lưu của Son Goku...
```

### 4. Kiểm tra UI Components

**Header:**
- ✅ Title hiển thị đúng
- ✅ Description hiển thị đúng
- ✅ Banner image load hoặc fallback SVG

**Main Section:**
- ✅ Poster image load hoặc fallback SVG  
- ✅ Movie title hiển thị đúng
- ✅ Meta info (năm, số tập, thể loại, etc.)
- ✅ Like/dislike stats hiển thị
- ✅ Action buttons hoạt động

**Tabs:**
- ✅ Overview tab hiển thị description
- ✅ Categories hiển thị từ genre field
- ✅ Tab switching hoạt động

## Troubleshooting

### Nếu vẫn hiển thị "Tên phim không xác định":

1. **Kiểm tra backend running:**
   ```bash
   curl http://localhost:8080/api/cartoons/1
   ```

2. **Kiểm tra CORS:**
   - Backend phải cho phép CORS từ frontend
   - Hoặc chạy frontend trên cùng domain

3. **Kiểm tra logs:**
   - Console hiển thị "❌ Failed to fetch movie details"
   - Xem chi tiết lỗi trong Network tab

4. **Kiểm tra data structure:**
   - Console log "Raw movie data" có data không
   - Field title có tồn tại không

### Các trường hợp lỗi khác:

- **No movie ID:** URL không có ?id=... → Hiển thị error page
- **Invalid movie ID:** API trả về 404 → Hiển thị error page  
- **Network error:** Không connect được backend → Hiển thị error với retry button

## Files đã được sửa:

1. **script.js** (movie-detail):
   - ✅ Extract data từ `movieResponse.cartoon`
   - ✅ Thêm stats display
   - ✅ Log debug chi tiết
   - ✅ Xử lý lỗi tốt hơn

2. **Backend API** (đã có từ trước):
   - ✅ CartoonController trả về đúng cấu trúc
   - ✅ Entity Cartoon có đầy đủ fields
   - ✅ Database có test data

## Next Steps:

1. ✅ Test thoroughly với tất cả movie IDs
2. ✅ Verify achievement system integration  
3. ✅ Check voice search functionality
4. ✅ Test responsive design trên mobile
