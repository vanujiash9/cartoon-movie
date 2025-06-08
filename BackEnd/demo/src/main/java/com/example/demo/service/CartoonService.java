package com.example.demo.service;

import com.example.demo.entity.Cartoon;
import com.example.demo.repository.CartoonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CartoonService {
    @Autowired
    private CartoonRepository cartoonRepository;

    public List<Cartoon> getAll() {
        try {
            return cartoonRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch cartoons: " + e.getMessage());
        }
    }

    public Optional<Cartoon> getById(Integer id) {
        return cartoonRepository.findById(id);
    }

    public Cartoon create(Cartoon cartoon) {
        cartoon.setCreatedAt(LocalDateTime.now()); // Sử dụng setCreatedAt
        return cartoonRepository.save(cartoon);
    }

    public Cartoon update(Integer id, Cartoon cartoon) {
        cartoon.setId(id);
        return cartoonRepository.save(cartoon);
    }

    public void delete(Integer id) {
        cartoonRepository.deleteById(id);
    }

    @PostMapping
    public ResponseEntity<Cartoon> createCartoon(@RequestBody Cartoon cartoon) {
        try {
            cartoon.setCreatedAt(LocalDateTime.now());
            Cartoon savedCartoon = create(cartoon); // Không còn lỗi
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCartoon);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    public List<Cartoon> searchAndFilter(String keyword, String year, String genre, String sort) {
        List<Cartoon> cartoons = cartoonRepository.findAll();

        // Lọc theo từ khóa
        if (keyword != null && !keyword.isEmpty()) {
            cartoons = cartoons.stream()
                    .filter(c -> c.getTitle() != null && c.getTitle().toLowerCase().contains(keyword.toLowerCase()))
                    .toList();
        }

        // Lọc theo năm
        if (year != null && !year.isEmpty()) {
            cartoons = cartoons.stream()
                    .filter(c -> c.getReleaseYear() != null && c.getReleaseYear().toString().equals(year))
                    .toList();
        }

        // Lọc theo thể loại
        if (genre != null && !genre.isEmpty()) {
            cartoons = cartoons.stream()
                    .filter(c -> c.getGenre() != null && c.getGenre().toLowerCase().contains(genre.toLowerCase()))
                    .toList();
        }

        // Sắp xếp
        if (sort != null && !sort.isEmpty()) {
            switch (sort) {
                case "title_asc" -> cartoons = cartoons.stream()
                        .sorted((a, b) -> a.getTitle().compareToIgnoreCase(b.getTitle()))
                        .toList();
                case "title_desc" -> cartoons = cartoons.stream()
                        .sorted((a, b) -> b.getTitle().compareToIgnoreCase(a.getTitle()))
                        .toList();
                case "year_asc" -> cartoons = cartoons.stream()
                        .sorted((a, b) -> {
                            if (a.getReleaseYear() == null) return 1;
                            if (b.getReleaseYear() == null) return -1;
                            return a.getReleaseYear().compareTo(b.getReleaseYear());
                        }).toList();
                case "year_desc" -> cartoons = cartoons.stream()
                        .sorted((a, b) -> {
                            if (a.getReleaseYear() == null) return 1;
                            if (b.getReleaseYear() == null) return -1;
                            return b.getReleaseYear().compareTo(a.getReleaseYear());
                        }).toList();
                case "episodes_asc" -> cartoons = cartoons.stream()
                        .sorted((a, b) -> {
                            if (a.getTotalEpisodes() == null) return 1;
                            if (b.getTotalEpisodes() == null) return -1;
                            return a.getTotalEpisodes().compareTo(b.getTotalEpisodes());
                        }).toList();
                case "episodes_desc" -> cartoons = cartoons.stream()
                        .sorted((a, b) -> {
                            if (a.getTotalEpisodes() == null) return 1;
                            if (b.getTotalEpisodes() == null) return -1;
                            return b.getTotalEpisodes().compareTo(a.getTotalEpisodes());
                        }).toList();
            }
        }

        return cartoons;
    }

    public List<String> getAllYears() {
        return cartoonRepository.findAll().stream()
                .map(c -> c.getReleaseYear() != null ? c.getReleaseYear().toString() : null)
                .filter(y -> y != null && !y.isEmpty())
                .distinct()
                .sorted()
                .toList();
    }

    public List<String> getAllGenres() {
        return cartoonRepository.findAll().stream()
                .map(Cartoon::getGenre)
                .filter(g -> g != null && !g.isEmpty())
                .distinct()
                .sorted()
                .toList();
    }

    public long countByStatus(String status) {
        return cartoonRepository.findAll().stream()
                .filter(c -> c.getStatus() != null && c.getStatus().equalsIgnoreCase(status))
                .count();
    }

    public long countActiveMovies() {
        return countByStatus("Active");
    }

    public long countComingSoonMovies() {
        return countByStatus("Coming Soon");
    }

    public long countInactiveMovies() {
        return countByStatus("Inactive");
    }
}