-- Sample data for Cartoon Movie System
-- Clear existing data
DELETE FROM episodes;
DELETE FROM cartoons;

-- Insert sample cartoons
INSERT INTO cartoons (id, title, description, release_year, total_episodes, image_url, genre, director, duration, status, created_at) VALUES
(1, 'Dragon Ball Z', 'Cuộc phiêu lưu của Son Goku và các chiến binh Z bảo vệ Trái Đất khỏi những kẻ thù mạnh mẽ', 1989, 291, 'https://image.tmdb.org/t/p/w500/6VBrDNKxGBDzKgvmjwDWQAzOiCh.jpg', 'Hành động', 'Akira Toriyama', 24, 'Completed', NOW()),
(2, 'Naruto', 'Câu chuyện về ninja trẻ Uzumaki Naruto trong hành trình trở thành Hokage', 2002, 720, 'https://image.tmdb.org/t/p/w500/vauCEnR7CiyBDzRCeElKkCaXIYu.jpg', 'Hành động', 'Masashi Kishimoto', 23, 'Completed', NOW()),
(3, 'One Piece', 'Cuộc phiêu lưu của Monkey D. Luffy và băng hải tặc Mũ Rơm tìm kiếm kho báu One Piece', 1999, 1000, 'https://image.tmdb.org/t/p/w500/6VBrDNKxGBDzKgvmjwDWQAzOiCh.jpg', 'Phiêu lưu', 'Eiichiro Oda', 24, 'Ongoing', NOW()),
(4, 'Attack on Titan', 'Nhân loại chiến đấu chống lại những người khổng lồ ăn thịt người', 2013, 75, 'https://image.tmdb.org/t/p/w500/8WxAKSfXZYGUJSTYMBMGWgvjgpq.jpg', 'Hành động', 'Hajime Isayama', 24, 'Completed', NOW()),
(5, 'My Hero Academia', 'Trong thế giới nơi 80% dân số có siêu năng lực, Izuku Midoriya mơ ước trở thành anh hùng', 2016, 138, 'https://image.tmdb.org/t/p/w500/8WxAKSfXZYGUJSTYMBMGWgvjgpq.jpg', 'Hành động', 'Kohei Horikoshi', 24, 'Ongoing', NOW()),
(6, 'Demon Slayer', 'Tanjiro Kamado trở thành thợ săn quỷ để cứu em gái mình', 2019, 44, 'https://image.tmdb.org/t/p/w500/6VBrDNKxGBDzKgvmjwDWQAzOiCh.jpg', 'Hành động', 'Koyoharu Gotouge', 24, 'Completed', NOW());

-- Insert sample episodes
INSERT INTO episodes (id, cartoon_id, episode_number, title, video_url, thumbnail_url, duration, description, created_at) VALUES
-- Dragon Ball Z episodes
(1, 1, 1, 'The Arrival of Raditz', 'https://youtu.be/032ctWjilU0', 'https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg', 24, 'Raditz arrives on Earth looking for Goku', NOW()),
(2, 1, 2, 'The World''s Strongest Team', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 24, 'Goku and Piccolo team up', NOW()),
(3, 1, 3, 'Gohan''s Rage', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 24, 'Gohan shows his hidden power', NOW()),

-- Naruto episodes
(4, 2, 1, 'Enter: Naruto Uzumaki!', 'https://youtu.be/032ctWjilU0', 'https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg', 23, 'Naruto graduates from ninja academy', NOW()),
(5, 2, 2, 'My Name is Konohamaru!', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 23, 'Naruto meets Konohamaru', NOW()),
(6, 2, 3, 'Sasuke and Sakura: Friends or Foes?', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 23, 'Team 7 is formed', NOW()),

-- One Piece episodes
(7, 3, 1, 'I''m Luffy! The Man Who''s Gonna Be King of the Pirates!', 'https://youtu.be/032ctWjilU0', 'https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg', 24, 'Luffy begins his adventure', NOW()),
(8, 3, 2, 'Enter the Great Swordsman! Pirate Hunter Roronoa Zoro!', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 24, 'Luffy meets Zoro', NOW()),
(9, 3, 3, 'Morgan versus Luffy! Who''s the Mysterious Pretty Girl?', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 24, 'The first adventure begins', NOW()),

-- Attack on Titan episodes
(10, 4, 1, 'To You, in 2000 Years: The Fall of Shiganshina, Part 1', 'https://youtu.be/032ctWjilU0', 'https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg', 24, 'The Colossal Titan appears', NOW()),
(11, 4, 2, 'That Day: The Fall of Shiganshina, Part 2', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 24, 'Eren witnesses tragedy', NOW()),

-- My Hero Academia episodes
(12, 5, 1, 'Izuku Midoriya: Origin', 'https://youtu.be/032ctWjilU0', 'https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg', 24, 'Deku meets All Might', NOW()),
(13, 5, 2, 'What It Takes to Be a Hero', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 24, 'Deku saves Bakugo', NOW()),

-- Demon Slayer episodes
(14, 6, 1, 'Cruelty', 'https://youtu.be/032ctWjilU0', 'https://i.ytimg.com/vi/032ctWjilU0/maxresdefault.jpg', 24, 'Tanjiro''s family is attacked', NOW()),
(15, 6, 2, 'Trainer Sakonji Urokodaki', 'https://youtu.be/dQw4w9WgXcQ', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 24, 'Tanjiro begins training', NOW());
