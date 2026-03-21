package com.ecommerce.backend.service;

import com.ecommerce.backend.config.SessionAuthFilter;
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
import com.ecommerce.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * CartService
 */
@Service
@RequiredArgsConstructor
public class CartService {
	private final UserRepository userRepository;
	private final SessionRepository sessionRepository;
	private final CartRepository cartRepository;
	private final CartItemRepository cartItemRepository;
	private final InventoryItemRepository inventoryItemRepository;

	public AddCartItemResponse createCartItem(AddCartItemRequest cartItemRequest) {
		InventoryItem inventoryItem = inventoryItemRepository.findById(cartItemRequest.getItemId())
				.orElseThrow();

		CartItem cartItem = new CartItem();
		cartItem.setItem(inventoryItem);
		cartItem.setQuantity(cartItemRequest.getQuantity());
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.isAuthenticated() &&
				auth.getPrincipal() instanceof Users user) {
			// TODO: if a user exists without a cart they wont be able to create
			// a cart. fix me pls non urgent
			Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
				Cart newCart = new Cart();
				newCart.setUser(user);
				return cartRepository.save(newCart);
			});

			Optional<CartItem> existing = cartItemRepository.findByCartAndItem(cart, inventoryItem);
			if (existing.isPresent()) {
				throw new ResponseStatusException(HttpStatus.CONFLICT);
			} else {
				cartItem.setCart(cart);
				cartItem = cartItemRepository.save(cartItem);
			}
			AddCartItemResponse response = new AddCartItemResponse(
					cartItem,
					sessionRepository.findByUser(user).orElseThrow().getToken());
			return response;
		} else if (auth instanceof AnonymousAuthenticationToken) {
			// create user/cart/cartItem
			Users user = new Users();
			user.setUserRole(Users.Role.CUSTOMER);
			user = userRepository.save(user);
			Cart cart = new Cart();
			cart.setUser(user);
			cart = cartRepository.save(cart);
			Sessions session = new Sessions();
			session.setUser(user);
			session.setExpiresAt(LocalDateTime.now().plusDays(30));
			sessionRepository.save(session);
			cartItem.setCart(cart);
			cartItem = cartItemRepository.save(cartItem);
			AddCartItemResponse response = new AddCartItemResponse(cartItem, session.getToken());
			return response;
		} else {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
		}
	}

	public Cart getCartItems() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.isAuthenticated() &&
				auth.getPrincipal() instanceof Users user) {
			return cartRepository.findByUser(user).orElseThrow();
		}
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
	}

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
}
