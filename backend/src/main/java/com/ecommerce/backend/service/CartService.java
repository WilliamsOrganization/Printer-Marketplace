package com.ecommerce.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
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
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * CartService
 */
@Service
@RequiredArgsConstructor
public class CartService {
	private static final long DAYS = 30;
	private final UserRepository userRepository;
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
	public AddCartItemResponse createCartItem(AddCartItemRequest cartItemRequest) {
		// TODO: FIXME: This whole method is cursed
		InventoryItem inventoryItem = inventoryItemRepository.findById(cartItemRequest.getItemId())
				.orElseThrow();

		CartItem cartItem = CartItem.builder()
				.item(inventoryItem)
				.quantity(cartItemRequest.getQuantity())
				// .cart()// TODO: this is properly throwing an error now this is intentional for me to fix
				.build();

			// TODO: extract this into the the authentication service this doesnt belong here.
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.isAuthenticated() &&
				auth.getPrincipal() instanceof Users user) {
			Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
				Cart newCart = Cart.builder().user(user).build();
				return cartRepository.save(newCart);
			});

			Optional<CartItem> existing = cartItemRepository.findByCartAndItem(cart, inventoryItem);
			if (existing.isPresent()) {
				throw new ResponseStatusException(HttpStatus.CONFLICT);
			} else {
				cartItem.setCart(cart);// Should be getting built all at once at the same time not piece meal as its a required argument parameter. simplifies things
				cartItem = cartItemRepository.save(cartItem);
			}
			AddCartItemResponse response = new AddCartItemResponse(
					cartItem,
					sessionRepository.findByUser(user).orElseThrow().getToken());
			return response;
		} else if (auth instanceof AnonymousAuthenticationToken) {
			// create user/cart/cartItem
			// TODO: extract this into the user service this doesnt belong here.
			Users user = Users.builder().userRole(Users.Role.CUSTOMER).build();
			user = userRepository.save(user);
			Cart cart = Cart.builder().user(user).build();
			cart = cartRepository.save(cart);
			// TODO: extract this into the Session service this doesnt belong here.
			Sessions session =  Sessions.builder().user(user).build();
			session.setUser(user);
			session.setExpiresAt(LocalDateTime.now().plusDays(DAYS));
			sessionRepository.save(session);
			cartItem.setCart(cart);
			cartItem = cartItemRepository.save(cartItem);
			AddCartItemResponse response = new AddCartItemResponse(cartItem, session.getToken());
			return response;
		} else {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * getCartItems returns the cart items for the current user
	 * 
	 * @return
	 */
	public Cart getCartItems() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.isAuthenticated() &&
				auth.getPrincipal() instanceof Users user) {
			return cartRepository.findByUser(user).orElseThrow();
		}
		throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
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
}
