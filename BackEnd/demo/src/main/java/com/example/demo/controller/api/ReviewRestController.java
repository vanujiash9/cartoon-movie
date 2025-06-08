package com.example.demo.controller.api;

import com.example.demo.entity.Review;
import com.example.demo.service.ReviewService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewRestController {
    private final ReviewService reviewService;
    public ReviewRestController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<Review> getAll() { return reviewService.getAll(); }

    @GetMapping("/{id}")
    public Review getById(@PathVariable Integer id) { return reviewService.getById(id).orElse(null); }

    @GetMapping("/cartoon/{cartoonId}")
    public List<Review> getByCartoonId(@PathVariable Integer cartoonId) { return reviewService.getByCartoonId(cartoonId); }

    @PostMapping
    public Review create(@RequestBody Review review) { return reviewService.create(review); }

    @PutMapping("/{id}")
    public Review update(@PathVariable Integer id, @RequestBody Review review) { return reviewService.update(id, review); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) { reviewService.delete(id); }
}
