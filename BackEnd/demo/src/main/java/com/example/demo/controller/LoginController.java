package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/")
    public String home() {
        return "redirect:/admin"; // Redirect root URL to admin page
    }

    @GetMapping("/login")
    public String login() {
        return "login"; // trả về view login.html trong templates
    }
}
