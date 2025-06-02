package com.example.demo.controller.api;

import com.example.demo.entity.Cartoon;
import com.example.demo.service.CartoonService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cartoons")
@CrossOrigin(origins = "*")
public class CartoonController {
    
    private final CartoonService cartoonService;
    
    public CartoonController(CartoonService cartoonService) {
        this.cartoonService = cartoonService;
    }
    
    @GetMapping
    public ResponseEntity<List<Cartoon>> getAllCartoons() {
        List<Cartoon> cartoons = cartoonService.getAll();
        return ResponseEntity.ok(cartoons);
    }
    
    @GetMapping("/summary")
    public ResponseEntity<List<Cartoon>> getAllCartoonsSummary() {
        List<Cartoon> cartoons = cartoonService.getAll();
        return ResponseEntity.ok(cartoons);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Cartoon> getCartoonById(@PathVariable Integer id) {
        try {
            Cartoon cartoon = cartoonService.getById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cartoon not found with id: " + id));
            return ResponseEntity.ok(cartoon);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
public ResponseEntity<Cartoon> createCartoon(@RequestBody Cartoon cartoon) {
    try {
        // Kiểm tra dữ liệu đầu vào
        if (cartoon.getTitle() == null || cartoon.getTitle().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        cartoon.setCreatedAt(LocalDateTime.now()); // Sử dụng setCreatedAt
        Cartoon savedCartoon = cartoonService.create(cartoon);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCartoon);
    } catch (Exception e) {
        e.printStackTrace(); // Log lỗi chi tiết
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
    
    @PutMapping("/{id}")
    public ResponseEntity<Cartoon> updateCartoon(@PathVariable Integer id, @RequestBody Cartoon cartoon) {
        try {
            Cartoon updatedCartoon = cartoonService.update(id, cartoon);
            return ResponseEntity.ok(updatedCartoon);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartoon(@PathVariable Integer id) {
        try {
            cartoonService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Cartoon>> searchCartoons(@RequestParam String title) {
        try {
            List<Cartoon> cartoons = cartoonService.getAll().stream()
                    .filter(cartoon -> cartoon.getTitle().toLowerCase().contains(title.toLowerCase()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(cartoons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}