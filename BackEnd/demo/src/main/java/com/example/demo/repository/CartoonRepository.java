package com.example.demo.repository;

import com.example.demo.entity.Cartoon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartoonRepository extends JpaRepository<Cartoon, Integer> {
}