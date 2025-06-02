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
}