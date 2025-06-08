package com.example.demo.controller.admin;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/admin/users")
public class AdminUserController {
    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public String listUsers(Model model) {
        List<User> users = userService.getAll();
        model.addAttribute("users", users);
        model.addAttribute("activePage", "users");
        return "users";
    }

    @PostMapping("/delete/{id}")
    public String deleteUser(@PathVariable Integer id, RedirectAttributes redirectAttributes) {
        try {
            userService.delete(id);
            redirectAttributes.addFlashAttribute("success", "Xóa người dùng thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Xóa người dùng thất bại: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/update-role/{id}")
    public String updateUserRole(@PathVariable Integer id, @RequestParam String role, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.getById(id).orElseThrow(() -> new RuntimeException("User not found"));
            user.setRole(role);
            userService.save(user);
            redirectAttributes.addFlashAttribute("success", "Cập nhật quyền thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Cập nhật quyền thất bại: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }
}
