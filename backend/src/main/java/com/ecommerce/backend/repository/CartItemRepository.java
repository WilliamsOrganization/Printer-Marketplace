package com.ecommerce.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.InventoryItem;


/**
 * Data access layer for CartItem entities.
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
	/**
	 * Finds all items in a cart.
	 * @param cart the cart
	 * @return the cart's items
	 */
	List<CartItem> findByCart(Cart cart);

	/**
	 * Deletes a cart item by its id, scoped to the given cart.
	 * @param id the cart item id
	 * @param cart the cart the item must belong to
	 */
	void deleteByIdAndCart(Long id, Cart cart);

	/**
	 * Finds the cart item for a given cart and inventory item.
	 * @param cart the cart
	 * @param inventoryItem the inventory item
	 * @return the cart item
	 */
	Optional<CartItem> findByCartAndItem(Cart cart, InventoryItem inventoryItem);
}
