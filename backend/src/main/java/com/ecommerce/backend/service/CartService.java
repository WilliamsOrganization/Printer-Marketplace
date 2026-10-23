/* (C)2026 */
package com.ecommerce.backend.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.dto.AddCartItemRequest;
import com.ecommerce.backend.dto.AddCartItemResponse;
import com.ecommerce.backend.dto.InventoryItemFieldSelection;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.CartItemField;
import com.ecommerce.backend.entity.CartItemFieldChecklist;
import com.ecommerce.backend.entity.CartItemFieldColorPicker;
import com.ecommerce.backend.entity.CartItemFieldOptionsDropdown;
import com.ecommerce.backend.entity.CartItemFieldOptionsStlColor;
import com.ecommerce.backend.entity.CartItemFieldRadioGroup;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.entity.InventoryItemField;
import com.ecommerce.backend.entity.InventoryItemFieldChecklist;
import com.ecommerce.backend.entity.InventoryItemFieldColorPicker;
import com.ecommerce.backend.entity.InventoryItemFieldOptions;
import com.ecommerce.backend.entity.InventoryItemFieldOptionsStlColor;
import com.ecommerce.backend.entity.InventoryItemFieldRadioGroup;
import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.InventoryItemFieldOptionsRepository;
import com.ecommerce.backend.repository.InventoryItemFieldRepository;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.ecommerce.backend.repository.SessionRepository;

import lombok.RequiredArgsConstructor;

/**
 * CartService
 */
@Service
@RequiredArgsConstructor
public class CartService {
	/**
	 * Builds a key that is identical for identical selections, regardless of the order they were sent in.
	 */
	private static String configurationKey(List<InventoryItemFieldSelection> selections) {
		List<String> parts = new ArrayList<>();
		for (InventoryItemFieldSelection selection : selections) {
			List<Long> ids = new ArrayList<>(selection.optionIds());
			Collections.sort(ids);
			parts.add(selection.fieldId() + ":" + ids);
		}
		Collections.sort(parts);
		return String.join(";", parts);
	}
	// private static final long DAYS = 30;
	private final UserService userService;
	private final SessionRepository sessionRepository;
	private final CartRepository cartRepository;
	private final CartItemRepository cartItemRepository;
	private final InventoryItemRepository inventoryItemRepository;
	private final InventoryItemFieldRepository inventoryItemFieldRepository;

	private final InventoryItemFieldOptionsRepository inventoryItemFieldOptionsRepository;

	/**
	 * createCartItem creates a new cart item
	 * 
	 * @param cartItemRequest
	 * @return
	 */
	public AddCartItemResponse createCartItem(AddCartItemRequest cartItemRequest, Users user, Cart cart) {
		InventoryItem inventoryItem = inventoryItemRepository.findById(cartItemRequest.itemId())
				.orElseThrow();
		Sessions session = sessionRepository.findByUser(user).orElseThrow();

		List<InventoryItemFieldSelection> selections = cartItemRequest.inventoryFieldItemSelections() == null
				? List.of() : cartItemRequest.inventoryFieldItemSelections();

		List<CartItemField> fieldSelections = validateFieldSelections(selections, inventoryItem);
		String key = configurationKey(selections);

		Optional<CartItem> existing = cartItemRepository.findByCartAndItemAndConfigurationKey(cart, inventoryItem, key);
		if (existing.isPresent()) {
			CartItem cartItem = existing.get();
			cartItem.setQuantity(cartItem.getQuantity() + cartItemRequest.quantity());
			return new AddCartItemResponse(cartItemRepository.save(cartItem), session.getToken());
		}

		CartItem cartItem = CartItem.builder()
				.item(inventoryItem)
				.quantity(cartItemRequest.quantity())
				.cartItemFields(fieldSelections)
				.configurationKey(key)
				.cart(cart)
				.build();
		return new AddCartItemResponse(cartItemRepository.save(cartItem), session.getToken());
	}

	/**
	 * getCartItems returns the cart items for the current user
	 * 
	 * @return
	 */
	public Cart getCartItems(Users user) {
		return getCart(userService.getUserFromSession());
	}

	/**
	 * deleteCartItem deletes a cart item
	 * 
	 * @param id
	 */
	@Transactional
	public void deleteCartItem(Long id) {
		Cart cart = cartRepository.findByUser(userService.getUserFromSession()).orElseThrow();
		cartItemRepository.deleteByIdAndCart(id, cart);
	}

	/**
	 * finds a cart for a given user if exists
	 * 
	 * @Cart
	 *
	 */
	public Cart getCart(Users user) {
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

	/**
	 * Throws if the same field appears more than once in the selections.
	 */
	private void rejectDuplicateFields(List<InventoryItemFieldSelection> selections) {
		Set<Long> seenFieldIds = new HashSet<>();
		for (InventoryItemFieldSelection selection : selections) {
			if (!seenFieldIds.add(selection.fieldId())) {
				throw new IllegalArgumentException("Field " + selection.fieldId() + " submitted more than once");
			}
		}
	}

	private List<CartItemField> validateFieldSelections(List<InventoryItemFieldSelection> inventoryFieldItemSelections,
			InventoryItem inventoryItem) {
		List<CartItemField> fieldSelections = new ArrayList<>();
		rejectDuplicateFields(inventoryFieldItemSelections);
		for (InventoryItemFieldSelection field : inventoryFieldItemSelections) {
			InventoryItemField inventoryItemField = inventoryItemFieldRepository
					.findByIdAndInventoryItem(field.fieldId(), inventoryItem).orElseThrow(() -> new IllegalArgumentException( "Field " + field.fieldId() + " does not exist on this item"));
			List<InventoryItemFieldOptions> selected = inventoryItemFieldOptionsRepository.findByIdInAndInventoryItemField(field.optionIds(), inventoryItemField);
			switch (inventoryItemField) {
				case InventoryItemFieldRadioGroup radioGroup:
					getCartRadioOption(fieldSelections, field, selected, radioGroup);
					break;
				case InventoryItemFieldChecklist checklist:
					getCartChecklistOptions(fieldSelections, field, selected, checklist);
					break;
				case InventoryItemFieldColorPicker colorPicker:
					getCartStlOptions(fieldSelections, field, selected, colorPicker);
					break;
				default:
					throw new IllegalArgumentException("Field " + field.fieldId() + " is not a valid field type");
			}
		}
		requireMandatoryFields(inventoryFieldItemSelections, inventoryItem);
		return fieldSelections;
	}

	/**
	 * Throws if a radio group or color picker on the item has no selection.
	 * Checklists are optional add-ons, matching isFieldRequired on the frontend.
	 */
	private void requireMandatoryFields(List<InventoryItemFieldSelection> selections, InventoryItem inventoryItem) {
		if (inventoryItem.getFields() == null) return;
		Set<Long> submittedFieldIds = new HashSet<>();
		for (InventoryItemFieldSelection selection : selections) {
			submittedFieldIds.add(selection.fieldId());
		}
		for (InventoryItemField field : inventoryItem.getFields()) {
			boolean required = !(field instanceof InventoryItemFieldChecklist);
			if (required && !submittedFieldIds.contains(field.getId())) {
				throw new IllegalArgumentException(field.getLabel() + " must be selected");
			}
		}
	}

	private void getCartStlOptions(List<CartItemField> fieldSelections, InventoryItemFieldSelection field,
			List<InventoryItemFieldOptions> selected, InventoryItemFieldColorPicker colorPicker) {
		if (field.optionIds().size() != 1)
			throw new IllegalArgumentException("Color picker needs exactly one option");
		if (selected.size() != field.optionIds().size()) throw new IllegalArgumentException("Invalid option for " + colorPicker.getLabel());
		List<CartItemFieldOptionsStlColor> cartStlOptions = new ArrayList<>();
		for (InventoryItemFieldOptions option : selected) {
			cartStlOptions.add(CartItemFieldOptionsStlColor.from((InventoryItemFieldOptionsStlColor) option, colorPicker.getStlUrl()));
		}
		fieldSelections.add(CartItemFieldColorPicker.builder()
				.label(colorPicker.getLabel())
				.description(colorPicker.getDescription())
				.options(cartStlOptions)
				.build());
	}

	private void getCartChecklistOptions(List<CartItemField> fieldSelections, InventoryItemFieldSelection field,
			List<InventoryItemFieldOptions> selected, InventoryItemFieldChecklist checklist) {
		if (field.optionIds().isEmpty())
			throw new IllegalArgumentException("Checklist needs at least one option");
		if (selected.size() != field.optionIds().size()) throw new IllegalArgumentException("Invalid option for " + checklist.getLabel());
		List<CartItemFieldOptionsDropdown> cartChecklistOptions = new ArrayList<>();
		for (InventoryItemFieldOptions option : selected) {
			cartChecklistOptions.add(CartItemFieldOptionsDropdown.from(option));
		}
		fieldSelections.add(CartItemFieldChecklist.builder()
				.label(checklist.getLabel())
				.description(checklist.getDescription())
				.options(cartChecklistOptions)
				.build());
	}

	private void getCartRadioOption(List<CartItemField> fieldSelections, InventoryItemFieldSelection field,
			List<InventoryItemFieldOptions> selected, InventoryItemFieldRadioGroup radioGroup) {
		if (field.optionIds().size() != 1)
			throw new IllegalArgumentException("Radio group needs exactly one option");
		if (selected.size() != field.optionIds().size()) throw new IllegalArgumentException("Invalid option for " + radioGroup.getLabel());
		List<CartItemFieldOptionsDropdown> cartRadioOption = new ArrayList<>();
		for (InventoryItemFieldOptions option : selected) {
			cartRadioOption.add(CartItemFieldOptionsDropdown.from(option));
		}
		fieldSelections.add(CartItemFieldRadioGroup.builder()
				.label(radioGroup.getLabel())
				.description(radioGroup.getDescription())
				.options(cartRadioOption)
				.build());
	}
}
