package com.example.demo.controller.api;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserRestController {
    private final UserService userService;
    public UserRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAll() { return userService.getAll(); }

    @GetMapping("/{id}")
    public User getById(@PathVariable Integer id) { return userService.getById(id).orElse(null); }

    @PostMapping
    public User create(@RequestBody User user) { return userService.save(user); }

    @PutMapping("/{id}")
    public User update(@PathVariable Integer id, @RequestBody User user) {
        user.setId(id);
        return userService.save(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) { userService.delete(id); }
}
