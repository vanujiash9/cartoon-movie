package com.example.demo.controller.admin;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin/categories")
public class AdminCategoryController {
    @GetMapping
    public String listCategories(Model model) {
        // Nếu có dữ liệu categories, truyền vào model ở đây
        return "categories";
    }
}
