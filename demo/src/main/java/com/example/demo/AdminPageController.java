package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminPageController {
    private final CartoonService cartoonService;

    public AdminPageController(CartoonService cartoonService) {
        this.cartoonService = cartoonService;
    }

    // Trang danh sách phim hoạt hình
    @GetMapping
    public String adminPage(Model model) {
        List<Cartoon> cartoons = cartoonService.getAll();
        model.addAttribute("cartoons", cartoons);
        model.addAttribute("cartoon", new Cartoon());
        model.addAttribute("editMode", false); // Thêm dòng này
        return "admin";
    }

    // Thêm phim hoạt hình mới
    @PostMapping("/add")
    public String addCartoon(@ModelAttribute Cartoon cartoon) {
        cartoonService.create(cartoon);
        return "redirect:/admin";
    }

    // Xóa phim hoạt hình
    @GetMapping("/delete/{id}")
    public String deleteCartoon(@PathVariable Integer id) {
        cartoonService.delete(id);
        return "redirect:/admin";
    }

    // Hiển thị form sửa
    @GetMapping("/edit/{id}")
    public String editCartoonForm(@PathVariable Integer id, Model model) {
        Cartoon cartoon = cartoonService.getById(id).orElse(null);
        model.addAttribute("cartoon", cartoon);
        model.addAttribute("cartoons", cartoonService.getAll());
        model.addAttribute("editMode", true);
        return "admin";
    }

    // Lưu thông tin sửa
    @PostMapping("/edit/{id}")
    public String editCartoon(@PathVariable Integer id, @ModelAttribute Cartoon cartoon) {
        cartoonService.update(id, cartoon);
        return "redirect:/admin";
    }
}