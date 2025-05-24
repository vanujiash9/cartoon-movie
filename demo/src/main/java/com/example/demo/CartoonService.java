package com.example.demo;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CartoonService {
    private final CartoonRepository cartoonRepository;

    public CartoonService(CartoonRepository cartoonRepository) {
        this.cartoonRepository = cartoonRepository;
    }

    public List<Cartoon> getAll() {
        return cartoonRepository.findAll();
    }

    public Optional<Cartoon> getById(Integer id) {
        return cartoonRepository.findById(id);
    }

    public Cartoon create(Cartoon cartoon) {
        return cartoonRepository.save(cartoon);
    }

    public Cartoon update(Integer id, Cartoon cartoon) {
        cartoon.setId(id);
        return cartoonRepository.save(cartoon);
    }

    public void delete(Integer id) {
        cartoonRepository.deleteById(id);
    }
}