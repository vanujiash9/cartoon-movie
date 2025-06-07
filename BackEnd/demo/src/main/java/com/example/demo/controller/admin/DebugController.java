package com.example.demo.controller.admin;

import com.example.demo.service.ReviewService;
import com.example.demo.service.CartoonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/debug")
public class DebugController {
    
    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private CartoonService cartoonService;
    
    @GetMapping("/reviews")
    public String debugReviews(Model model) {
        model.addAttribute("reviews", reviewService.getAll());
        model.addAttribute("cartoons", cartoonService.getAll());
        return "debug-reviews";
    }
}
