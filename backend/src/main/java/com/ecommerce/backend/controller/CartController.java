package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CheckoutRequest;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.CartService;
import com.ecommerce.backend.service.StripeCatalogService;

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
	private final StripeCatalogService stripeCatalogService;

    // @GetMapping
    // public List<Cart> getAll() {
    //     return cartRepository.findAll();
    // }

    /**
     * Gets the current user's cart, with its items.
     *
     * @return the current user's cart
     */
    @GetMapping
	@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public Cart getOne() {
		return cartService.getCartItems();
    }

    /**
     * Creates (or overwrites) a cart record as given.
     *
     * @param cart the cart to save
     * @return the saved cart
     */
    @PostMapping
    public Cart create(@RequestBody Cart cart) {
        return cartRepository.save(cart);
    }

    /**
     * Deletes a cart by id.
     *
     * @param id the cart id
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        cartRepository.deleteById(id);
    }

	/**
	 * This creates the checkout session url with the selected shipping rate id. uses the
	 * AuthService to get the current user context cart
	 * @param request the selected shipping rate id
	 * @return
	 * @throws Exception
	 */
	@PostMapping("/checkout")
	public String getCheckoutUrl(@RequestBody CheckoutRequest request) throws Exception {
		return stripeCatalogService.createCheckoutSession(request.selectedShippingID());
	}
}
