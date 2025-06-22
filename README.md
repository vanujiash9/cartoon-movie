# 🎬 Cartoon Movie System - Hệ thống xem phim hoạt hình

## 📋 Mô tả Project
Hệ thống web xem phim hoạt hình với đầy đủ tính năng quản lý, phát video, đánh giá và thành tựu người dùng.

## 🏗️ Cấu trúc Project

```
Cartoon-movie/
├── BackEnd/                    # Spring Boot Backend
│   └── demo/
│       ├── src/main/
│       │   ├── java/com/example/demo/
│       │   │   ├── config/         # Configuration classes
│       │   │   ├── controller/     # REST Controllers
│       │   │   │   ├── admin/      # Admin controllers
│       │   │   │   └── api/        # API controllers
│       │   │   ├── dto/            # Data Transfer Objects
│       │   │   ├── entity/         # JPA Entities
│       │   │   ├── exception/      # Custom exceptions
│       │   │   ├── repository/     # JPA Repositories
│       │   │   └── service/        # Business logic
│       │   └── resources/
│       │       ├── templates/      # Thymeleaf templates
│       │       └── static/         # Static resources
│       └── target/                 # Build output
├── FrontEnd/                   # Frontend Client
│   ├── achievements/           # Thành tựu
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript files
│   ├── login-register/        # Đăng nhập/Đăng ký
│   ├── movie-detail/          # Chi tiết phim
│   ├── movie-player/          # Trình phát video
│   ├── profile/               # Hồ sơ người dùng
│   ├── user/                  # Quản lý user
│   ├── index.html             # Trang chủ
│   ├── styles.css             # CSS chính
│   └── script.js              # JavaScript chính
├── logs/                      # Application logs
├── backups/                   # Database backups
└── FINAL_COMPLETE_BACKUP_20250623_13839.sql  # Backup database
```

## 🚀 Cài đặt và Chạy

### Prerequisites
- Java 21+
- Maven 3.6+
- MySQL 8.0+
- Node.js (optional, for development)

### Backend Setup
1. **Database Setup:**
   ```sql
   CREATE DATABASE cartoon;
   ```

2. **Restore Database:**
   ```bash
   mysql -u root -p cartoon < FINAL_COMPLETE_BACKUP_20250623_13839.sql
   ```

3. **Configure Application:**
   Kiểm tra `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/cartoon
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

4. **Build và Run:**
   ```bash
   cd BackEnd/demo
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup
1. **Serve Static Files:**
   - Sử dụng Live Server (VS Code extension)
   - Hoặc serve qua Python: `python -m http.server 8000`
   - Hoặc serve qua Node.js: `npx serve .`

2. **Truy cập ứng dụng:**
   - Frontend: `http://localhost:8000` (hoặc port khác)
   - Backend API: `http://localhost:8080`
   - Admin Panel: `http://localhost:8080/admin`

## 🔧 Tính năng chính

### User Features
- ✅ Đăng ký/Đăng nhập với Spring Security
- ✅ Xem danh sách phim hoạt hình
- ✅ Phát video với trình player tối ưu
- ✅ Đánh giá và bình luận
- ✅ Hệ thống thành tựu (Achievements)
- ✅ Chia sẻ phim lên mạng xã hội
- ✅ Quản lý hồ sơ cá nhân

### Admin Features
- ✅ Dashboard thống kê
- ✅ Quản lý phim và tập phim
- ✅ Quản lý người dùng
- ✅ Quản lý bình luận
- ✅ Báo cáo và thống kê

### Technical Features
- ✅ JWT Authentication
- ✅ BCrypt password encryption
- ✅ RESTful API design
- ✅ Responsive UI design
- ✅ Database relationships với Foreign Keys
- ✅ Exception handling toàn diện
- ✅ Logging system

## 🗄️ Database Schema

### Main Tables
- **users**: Thông tin người dùng
- **cartoons**: Thông tin phim
- **episodes**: Tập phim
- **comments**: Bình luận
- **achievements**: Thành tựu
- **user_achievements**: Tiến độ thành tựu của user
- **social_shares**: Lịch sử chia sẻ

### Key Relationships
- User 1:N Comments
- Cartoon 1:N Episodes
- Episode 1:N Comments
- User N:M Achievements (through user_achievements)

## 🔑 User Accounts

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

### Test User Accounts
- **Username**: `testuser1` | **Password**: `password123`
- **Username**: `testuser2` | **Password**: `password123`

## 📁 Cấu trúc Code đã tối ưu

### Backend (Java/Spring Boot)
```java
// Controller example
@RestController
@RequestMapping("/api/cartoons")
public class CartoonController {
    // Clean, optimized controller methods
}

// Service example  
@Service
public class CartoonService {
    // Business logic with proper error handling
}

// Entity example
@Entity
@Table(name = "cartoons")
public class Cartoon {
    // JPA annotations optimized
}
```

### Frontend (JavaScript/HTML/CSS)
```javascript
// Utils.js - Utility functions
const Utils = {
    api: { /* API helpers */ },
    dom: { /* DOM helpers */ },
    auth: { /* Auth helpers */ }
};

// Config.js - Centralized configuration
const AppConfig = {
    api: { baseUrl: 'http://localhost:8080' },
    features: { achievements: true }
};
```

## 🚀 Deployment

### Production Build
```bash
# Backend
cd BackEnd/demo
mvn clean package -Pprod

# Deploy JAR file
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

### Environment Variables
```bash
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=your_db_host
export DB_USERNAME=your_db_user
export DB_PASSWORD=your_db_password
```

## 🔧 Troubleshooting

### Common Issues
1. **Database connection failed**: Kiểm tra MySQL service và credentials
2. **CORS errors**: Kiểm tra CORS configuration trong Spring Boot
3. **JWT token expired**: Kiểm tra token expiration time
4. **File upload failed**: Kiểm tra file size và type restrictions

### Debug Commands
```bash
# Check application logs
tail -f logs/cartoon-movie-system.log

# Check database connectivity
mysql -u root -p -e "SELECT 1"

# Check Spring Boot health
curl http://localhost:8080/actuator/health
```

## 📚 API Documentation

### Authentication
```http
POST /api/auth/login
POST /api/auth/register
GET /api/users/me
```

### Cartoons
```http
GET /api/cartoons
GET /api/cartoons/{id}
GET /api/cartoons/{id}/episodes
```

### Episodes
```http
GET /api/episodes
GET /api/episodes/{id}
POST /api/episodes/{id}/comments
```

## 🎯 Performance Optimizations Applied

### Backend
- ✅ Optimized JPA queries
- ✅ Removed excessive logging
- ✅ Clean controller endpoints
- ✅ Proper exception handling
- ✅ Optimized service layer

### Frontend
- ✅ Consolidated CSS files
- ✅ Utility functions centralized
- ✅ Configuration management
- ✅ Removed duplicate code
- ✅ Optimized JavaScript structure

### Database
- ✅ Proper indexes
- ✅ Foreign key constraints
- ✅ Normalized schema
- ✅ Optimized queries

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong thư mục `logs/`
2. Xem database backup trong `FINAL_COMPLETE_BACKUP_20250623_13839.sql`
3. Chạy các script kiểm tra trong project

---

**Chúc bạn sử dụng project thành công! 🎉**
