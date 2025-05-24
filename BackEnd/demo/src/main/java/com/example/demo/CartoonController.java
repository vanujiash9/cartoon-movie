package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cartoons")
public class CartoonController {
    private final CartoonService cartoonService;

    public CartoonController(CartoonService cartoonService) {
        this.cartoonService = cartoonService;
    }

    // Lấy danh sách phim hoạt hình
    @GetMapping
    public List<Cartoon> getAll() {
        return cartoonService.getAll();
    }

    // Lấy chi tiết phim hoạt hình theo id
    @GetMapping("/{id}")
    public Cartoon getById(@PathVariable Integer id) {
        return cartoonService.getById(id).orElse(null);
    }

    // Thêm phim hoạt hình mới
    @PostMapping
    public Cartoon create(@RequestBody Cartoon cartoon) {
        return cartoonService.create(cartoon);
    }

    // Sửa thông tin phim hoạt hình
    @PutMapping("/{id}")
    public Cartoon update(@PathVariable Integer id, @RequestBody Cartoon cartoon) {
        return cartoonService.update(id, cartoon);
    }

    // Xóa phim hoạt hình
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        cartoonService.delete(id);
    }
}