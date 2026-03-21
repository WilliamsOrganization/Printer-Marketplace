package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.CartService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.apache.catalina.User;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/server/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartRepository cartRepository;
    private final CartService cartService;

    // @GetMapping
    // public List<Cart> getAll() {
    //     return cartRepository.findAll();
    // }

    @GetMapping
	@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public Cart getOne() {
		return cartService.getCartItems();
    }

    @PostMapping
    public Cart create(@RequestBody Cart cart) {
        return cartRepository.save(cart);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        cartRepository.deleteById(id);
    }
}
