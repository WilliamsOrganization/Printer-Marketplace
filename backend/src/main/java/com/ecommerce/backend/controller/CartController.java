package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.repository.CartRepository;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for shopping cart operations.
 */
@RestController
@RequestMapping("/api/Cart")
public class CartController {
    private final CartRepository repository;

    public CartController(CartRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Cart> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Cart getOne(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    public Cart create(@RequestBody Cart cart) {
        // TODO: process POST request
        return repository.save(cart);
    }

    @DeleteMapping("/{id}")

    public void delete(@PathVariable Long id) {
        // TODO: process POST request
        repository.deleteById(id);
    }
}
