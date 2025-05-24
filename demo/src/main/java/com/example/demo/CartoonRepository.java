package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartoonRepository extends JpaRepository<Cartoon, Integer> {
    // Có thể bổ sung các phương thức tìm kiếm nếu cần
}