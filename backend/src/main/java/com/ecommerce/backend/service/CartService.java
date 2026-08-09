package com.ecommerce.backend.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.backend.dto.AddCartItemRequest;
import com.ecommerce.backend.dto.AddCartItemResponse;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.ecommerce.backend.repository.SessionRepository;

import lombok.RequiredArgsConstructor;

/**
 * CartService
 */
@Service
@RequiredArgsConstructor
public class CartService {
	private static final long DAYS = 30;
	private final UserService userService;
	private final SessionRepository sessionRepository;
	private final CartRepository cartRepository;
	private final CartItemRepository cartItemRepository;
	private final InventoryItemRepository inventoryItemRepository;

	/**
	 * createCartItem creates a new cart item
	 * 
	 * @param cartItemRequest
	 * @return
	 */
	public AddCartItemResponse createCartItem(AddCartItemRequest cartItemRequest, Users user, Cart cart) {
		InventoryItem inventoryItem = inventoryItemRepository.findById(cartItemRequest.getItemId())
				.orElseThrow();
		Sessions session = sessionRepository.findByUser(user).orElseThrow();
		
		Optional<CartItem> existing = cartItemRepository.findByCartAndItem(cart, inventoryItem);
		if (existing.isPresent()) {
			updateCartItemQuantity(existing.get().getId(), cartItemRequest.getQuantity());
			return new AddCartItemResponse(existing.get(), session.getToken());
		} 

		CartItem cartItem = CartItem.builder()
				.item(inventoryItem)
				.quantity(cartItemRequest.getQuantity())
				.cart(cart)
				.build();

		cartItem = cartItemRepository.save(cartItem);
		AddCartItemResponse response = new AddCartItemResponse(cartItem, session.getToken());
		return response;
	}

	/**
	 * getCartItems returns the cart items for the current user
	 * 
	 * @return
	 */
	public Cart getCartItems() {
		return cartRepository.findByUser(userService.getUserFromSession()).orElseThrow();
	}

	/**
	 * deleteCartItem deletes a cart item
	 * 
	 * @param id
	 */
	public void deleteCartItem(Long id) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.isAuthenticated() &&
				auth.getPrincipal() instanceof Users user) {
			Cart cart = cartRepository.findByUser(user).orElseThrow();
			cartItemRepository.deleteByIdAndCart(id, cart);
			return;
		}
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
	}

	/**
	 * finds a cart for a given user if exists 
	 * @Cart
	 *
	 */
	public Cart getCart(Users user){
		return cartRepository.findByUser(user).orElseGet(() -> {
			Cart newCart = Cart.builder().user(user).build();
			return cartRepository.save(newCart);
		});
	}

	/**
	 * if cart item exists, update quantity
	 * 
	 * @param id
	 * @param quantity
	 * @return
	 */
	public CartItem updateCartItemQuantity(Long id, Integer quantity) {
		CartItem cartItem = cartItemRepository.findById(id).orElseThrow();
		cartItem.setQuantity(quantity);
		return cartItemRepository.save(cartItem);
	}
}
