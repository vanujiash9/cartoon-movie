package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getById(Integer id) {
        return userRepository.findById(id);
    }

    public void delete(Integer id) {
        userRepository.deleteById(id);
    }

    public List<User> getLatestUsers(int count) {
        // For now, only support top 3 for dashboard
        return userRepository.findTop3ByOrderByIdDesc();
    }

    public User save(User user) {
        boolean isUpdate = user.getId() != null; // Check if this is an update
        User savedUser = userRepository.save(user);
        
        // Send notification for profile update (not for new user registration)
        if (isUpdate && notificationService != null) {
            notificationService.notifyProfileUpdated(savedUser);
        }
        
        return savedUser;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
