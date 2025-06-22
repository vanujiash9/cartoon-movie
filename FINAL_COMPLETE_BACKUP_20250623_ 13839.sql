-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: cartoon
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_value` int NOT NULL DEFAULT '1',
  `reward_points` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'First Watch','Xem tập đầu tiên của bất kỳ phim nào','🎬','WATCHING',1,10,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(2,'Movie Buff','Xem 5 phim khác nhau','🍿','WATCHING',5,50,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(3,'Binge Watcher','Xem 10 tập trong một ngày','📺','WATCHING',10,100,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(4,'Series Completionist','Hoàn thành một bộ phim','✅','COMPLETION',1,200,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(5,'First Review','Viết đánh giá đầu tiên','⭐','SOCIAL',1,25,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(6,'Review Master','Viết 10 đánh giá','📝','SOCIAL',10,150,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(7,'Social Butterfly','Chia sẻ 5 phim lên mạng xã hội','📱','SOCIAL',5,75,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(8,'Early Bird','Đăng ký tài khoản','🐣','MILESTONE',1,5,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(9,'Loyal Fan','Sử dụng hệ thống trong 30 ngày','💎','MILESTONE',30,300,1,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(10,'Comment King','Viết 20 bình luận','💬','SOCIAL',20,100,1,'2025-06-22 18:31:00','2025-06-22 18:31:00');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartoons`
--  

DROP TABLE IF EXISTS `cartoons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartoons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `release_year` int DEFAULT NULL,
  `total_episodes` int DEFAULT '0',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `genre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `director` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT '24',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Ongoing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartoons`
--

LOCK TABLES `cartoons` WRITE;
/*!40000 ALTER TABLE `cartoons` DISABLE KEYS */;
INSERT INTO `cartoons` VALUES (1,'Dragon Ball Z','Cuộc phiêu lưu của Son Goku và các chiến binh Z bảo vệ Trái Đất khỏi những kẻ thù mạnh mẽ',1989,291,'https://image.tmdb.org/t/p/w500/6VBrDNKxGBDzKgvmjwDWQAzOiCh.jpg','Hành động','Akira Toriyama',24,'Completed','2025-06-22 18:31:00','2025-06-22 18:31:00'),(2,'Naruto','Câu chuyện về ninja trẻ Uzumaki Naruto trong hành trình trở thành Hokage',2002,720,'https://image.tmdb.org/t/p/w500/vauCEnR7CiyBDzRCeElKkCaXIYu.jpg','Hành động','Masashi Kishimoto',23,'Completed','2025-06-22 18:31:00','2025-06-22 18:31:00'),(3,'One Piece','Cuộc phiêu lưu của Monkey D. Luffy và băng hải tặc Mũ Rơm tìm kiếm kho báu One Piece',1999,1000,'https://image.tmdb.org/t/p/w500/6VBrDNKxGBDzKgvmjwDWQAzOiCh.jpg','Phiêu lưu','Eiichiro Oda',24,'Ongoing','2025-06-22 18:31:00','2025-06-22 18:31:00'),(4,'Attack on Titan','Nhân loại chiến đấu chống lại những người khổng lồ ăn thịt người',2013,75,'https://image.tmdb.org/t/p/w500/8WxAKSfXZYGUJSTYMBMGWgvjgpq.jpg','Hành động','Hajime Isayama',24,'Completed','2025-06-22 18:31:00','2025-06-22 18:31:00'),(5,'My Hero Academia','Trong thế giới nơi 80% dân số có siêu năng lực, Izuku Midoriya mơ ước trở thành anh hùng',2016,138,'https://image.tmdb.org/t/p/w500/8WxAKSfXZYGUJSTYMBMGWgvjgpq.jpg','Hành động','Kohei Horikoshi',24,'Ongoing','2025-06-22 18:31:00','2025-06-22 18:31:00'),(6,'Demon Slayer','Tanjiro Kamado trở thành thợ săn quỷ để cứu em gái mình',2019,44,'https://image.tmdb.org/t/p/w500/6VBrDNKxGBDzKgvmjwDWQAzOiCh.jpg','Hành động','Koyoharu Gotouge',24,'Completed','2025-06-22 18:31:00','2025-06-22 18:31:00'),(7,'Spirited Away','Chihiro bị lạc vào thế giới thần linh và phải tìm cách cứu cha mẹ',2001,1,'https://image.tmdb.org/t/p/w500/spirited_away.jpg','Phiêu lưu','Hayao Miyazaki',125,'Completed','2025-06-22 18:31:00','2025-06-22 18:31:00'),(8,'Your Name','Hai thanh niên hoán đổi cơ thể một cách bí ẩn',2016,1,'https://image.tmdb.org/t/p/w500/your_name.jpg','Lãng mạn','Makoto Shinkai',106,'Completed','2025-06-22 18:31:00','2025-06-22 18:31:00');
/*!40000 ALTER TABLE `cartoons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `cartoon_id` bigint DEFAULT NULL,
  `episode_id` bigint DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `likes_count` int DEFAULT '0',
  `dislikes_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_user_id` (`user_id`),
  KEY `idx_comments_cartoon_id` (`cartoon_id`),
  KEY `idx_comments_episode_id` (`episode_id`),
  KEY `idx_comments_parent_id` (`parent_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`cartoon_id`) REFERENCES `cartoons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_4` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,2,1,NULL,NULL,'Tập này quá hay! Gohan thật sự mạnh',5,0,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(2,3,1,NULL,NULL,'Đồng ý, Gohan có tiềm năng rất lớn',3,0,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(3,4,2,NULL,NULL,'Naruto và Sasuke là cặp đôi tuyệt vời',8,0,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(4,2,3,NULL,NULL,'Luffy sẽ trở thành Vua Hải Tặc!',12,0,'2025-06-22 18:31:00','2025-06-22 18:31:00');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `episodes`
--

DROP TABLE IF EXISTS `episodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `episodes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cartoon_id` bigint NOT NULL,
  `episode_number` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT '24',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cartoon_episode` (`cartoon_id`,`episode_number`),
  KEY `idx_episodes_cartoon_id` (`cartoon_id`),
  KEY `idx_episodes_episode_number` (`episode_number`),
  CONSTRAINT `episodes_ibfk_1` FOREIGN KEY (`cartoon_id`) REFERENCES `cartoons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `episodes`
--

LOCK TABLES `episodes` WRITE;
/*!40000 ALTER TABLE `episodes` DISABLE KEYS */;
INSERT INTO `episodes` VALUES (1,1,1,'The Arrival of Raditz','https://youtu.be/032ctWjilU0','https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg',24,'Raditz arrives on Earth looking for Goku','2025-06-22 18:31:00','2025-06-22 18:31:00'),(2,1,2,'The World\'s Strongest Team','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',24,'Goku and Piccolo team up','2025-06-22 18:31:00','2025-06-22 18:31:00'),(3,1,3,'Gohan\'s Rage','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',24,'Gohan shows his hidden power','2025-06-22 18:31:00','2025-06-22 18:31:00'),(4,2,1,'Enter: Naruto Uzumaki!','https://youtu.be/032ctWjilU0','https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg',23,'Naruto graduates from ninja academy','2025-06-22 18:31:00','2025-06-22 18:31:00'),(5,2,2,'My Name is Konohamaru!','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',23,'Naruto meets Konohamaru','2025-06-22 18:31:00','2025-06-22 18:31:00'),(6,2,3,'Sasuke and Sakura: Friends or Foes?','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',23,'Team 7 is formed','2025-06-22 18:31:00','2025-06-22 18:31:00'),(7,3,1,'I\'m Luffy! The Man Who\'s Gonna Be King of the Pirates!','https://youtu.be/032ctWjilU0','https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg',24,'Luffy begins his adventure','2025-06-22 18:31:00','2025-06-22 18:31:00'),(8,3,2,'Enter the Great Swordsman! Pirate Hunter Roronoa Zoro!','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',24,'Luffy meets Zoro','2025-06-22 18:31:00','2025-06-22 18:31:00'),(9,3,3,'Morgan versus Luffy! Who\'s the Mysterious Pretty Girl?','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',24,'The first adventure begins','2025-06-22 18:31:00','2025-06-22 18:31:00'),(10,4,1,'To You, in 2000 Years: The Fall of Shiganshina, Part 1','https://youtu.be/032ctWjilU0','https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg',24,'The Colossal Titan appears','2025-06-22 18:31:00','2025-06-22 18:31:00'),(11,4,2,'That Day: The Fall of Shiganshina, Part 2','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',24,'Eren witnesses tragedy','2025-06-22 18:31:00','2025-06-22 18:31:00'),(12,5,1,'Izuku Midoriya: Origin','https://youtu.be/032ctWjilU0','https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg',24,'Deku meets All Might','2025-06-22 18:31:00','2025-06-22 18:31:00'),(13,5,2,'What It Takes to Be a Hero','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',24,'Deku saves Bakugo','2025-06-22 18:31:00','2025-06-22 18:31:00'),(14,6,1,'Cruelty','https://youtu.be/032ctWjilU0','https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg',24,'Tanjiro\'s family is attacked','2025-06-22 18:31:00','2025-06-22 18:31:00'),(15,6,2,'Trainer Sakonji Urokodaki','https://youtu.be/dQw4w9WgXcQ','https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',24,'Tanjiro begins training','2025-06-22 18:31:00','2025-06-22 18:31:00'),(16,7,1,'Spirited Away','https://youtu.be/movie1','https://i.ytimg.com/vi/movie1/maxresdefault.jpg',125,'Full movie','2025-06-22 18:31:00','2025-06-22 18:31:00'),(17,8,1,'Your Name','https://youtu.be/movie2','https://i.ytimg.com/vi/movie2/maxresdefault.jpg',106,'Full movie','2025-06-22 18:31:00','2025-06-22 18:31:00');
/*!40000 ALTER TABLE `episodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `cartoon_id` bigint NOT NULL,
  `rating` decimal(2,1) NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review` (`user_id`,`cartoon_id`),
  KEY `idx_reviews_user_id` (`user_id`),
  KEY `idx_reviews_cartoon_id` (`cartoon_id`),
  KEY `idx_reviews_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`cartoon_id`) REFERENCES `cartoons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,2,1,4.5,'Dragon Ball Z là một trong những anime hay nhất mọi thời đại!','2025-06-22 18:31:00','2025-06-22 18:31:00'),(2,3,1,5.0,'Tuyệt vời! Đã xem hết và rất thích','2025-06-22 18:31:00','2025-06-22 18:31:00'),(3,3,3,4.8,'One Piece có cốt truyện rất hấp dẫn','2025-06-22 18:31:00','2025-06-22 18:31:00'),(4,4,2,4.2,'Naruto là bộ anime về tình bạn và ước mơ rất cảm động','2025-06-22 18:31:00','2025-06-22 18:31:00');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_sharing`
--

DROP TABLE IF EXISTS `social_sharing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_sharing` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `cartoon_id` bigint NOT NULL,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shared_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_social_sharing_user_id` (`user_id`),
  KEY `idx_social_sharing_cartoon_id` (`cartoon_id`),
  KEY `idx_social_sharing_platform` (`platform`),
  CONSTRAINT `social_sharing_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `social_sharing_ibfk_2` FOREIGN KEY (`cartoon_id`) REFERENCES `cartoons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_sharing`
--

LOCK TABLES `social_sharing` WRITE;
/*!40000 ALTER TABLE `social_sharing` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_sharing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `achievement_id` bigint NOT NULL,
  `current_progress` int DEFAULT '0',
  `is_completed` tinyint(1) DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_id`),
  KEY `idx_user_achievements_user_id` (`user_id`),
  KEY `idx_user_achievements_achievement_id` (`achievement_id`),
  KEY `idx_user_achievements_completed` (`is_completed`),
  CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
INSERT INTO `user_achievements` VALUES (1,3,3,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(2,2,3,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(3,4,3,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(4,1,3,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(5,3,10,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(6,2,10,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(7,4,10,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(8,1,10,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(9,3,8,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(10,2,8,1,1,'2025-06-22 18:31:00','2025-06-22 18:31:00','2025-06-22 18:31:00'),(11,4,8,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(12,1,8,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(13,3,5,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(14,2,5,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(15,4,5,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(16,1,5,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(17,3,1,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(18,2,1,1,1,'2025-06-22 18:31:00','2025-06-22 18:31:00','2025-06-22 18:31:00'),(19,4,1,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(20,1,1,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(21,3,9,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(22,2,9,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(23,4,9,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(24,1,9,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(25,3,2,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(26,2,2,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(27,4,2,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(28,1,2,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(29,3,6,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(30,2,6,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(31,4,6,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(32,1,6,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(33,3,4,1,1,'2025-06-22 18:31:00','2025-06-22 18:31:00','2025-06-22 18:31:00'),(34,2,4,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(35,4,4,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(36,1,4,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(37,3,7,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(38,2,7,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(39,4,7,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00'),(40,1,7,0,0,NULL,'2025-06-22 18:31:00','2025-06-22 18:31:00');
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `cartoon_id` bigint NOT NULL,
  `current_episode` int DEFAULT '1',
  `watch_time_seconds` int DEFAULT '0',
  `is_completed` tinyint(1) DEFAULT '0',
  `rating` decimal(2,1) DEFAULT NULL,
  `last_watched` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_cartoon` (`user_id`,`cartoon_id`),
  KEY `idx_user_progress_user_id` (`user_id`),
  KEY `idx_user_progress_cartoon_id` (`cartoon_id`),
  KEY `idx_user_progress_last_watched` (`last_watched`),
  CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_progress_ibfk_2` FOREIGN KEY (`cartoon_id`) REFERENCES `cartoons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES (1,2,1,3,3600,0,4.5,'2025-06-22 18:31:00','2025-06-22 18:31:00','2025-06-22 18:31:00'),(2,2,2,1,1380,0,4.0,'2025-06-22 18:31:00','2025-06-22 18:31:00','2025-06-22 18:31:00'),(3,3,1,291,70000,1,5.0,'2025-06-22 18:31:00','2025-06-22 18:31:00','2025-06-22 18:31:00'),(4,3,3,50,72000,0,4.8,'2025-06-22 18:31:00','2025-06-22 18:31:00','2025-06-22 18:31:00'),(5,4,2,10,13800,0,4.2,'2025-06-22 18:31:00','2025-06-22 18:31:00','2025-06-22 18:31:00');
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'USER',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@cartoon.com','{bcrypt}$2a$12$vOK6jI6QkpDU7Tqoo.snWugrjRbL4x9omad0sHVY9sd5U9VMK5NsK','Administrator',NULL,'ADMIN',1,'2025-06-22 18:31:00','2025-06-22 18:31:10'),(2,'user1','user1@cartoon.com','{bcrypt}$2a$12$vOK6jI6QkpDU7Tqoo.snWugrjRbL4x9omad0sHVY9sd5U9VMK5NsK','Người dùng 1',NULL,'USER',1,'2025-06-22 18:31:00','2025-06-22 18:31:10'),(3,'user2','user2@cartoon.com','{bcrypt}$2a$12$vOK6jI6QkpDU7Tqoo.snWugrjRbL4x9omad0sHVY9sd5U9VMK5NsK','Người dùng 2',NULL,'USER',1,'2025-06-22 18:31:00','2025-06-22 18:31:10'),(4,'testuser','test@cartoon.com','{bcrypt}$2a$12$vOK6jI6QkpDU7Tqoo.snWugrjRbL4x9omad0sHVY9sd5U9VMK5NsK','Test User',NULL,'USER',1,'2025-06-22 18:31:00','2025-06-22 18:31:10');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'cartoon'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-23  1:38:39
