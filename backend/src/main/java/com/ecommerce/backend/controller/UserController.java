package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.UpdateContactRequest;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.entity.Users.Role;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.UserService;

import lombok.RequiredArgsConstructor;

/**
 * REST controller for user account operations.
 */
@RestController
@RequestMapping("/server/users")
@RequiredArgsConstructor
public class UserController {
	private final UserRepository repository;
	private final UserService userService;

	/**
	 * Returns all user accounts.
	 *
	 * @return a list of all user accounts
	 */
	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public List<Users> getAll() {
		return repository.findAll();
	}

	/**
	 * Returns the user account with the given ID.
	 *
	 * @param id the ID of the user to retrieve
	 * @return the user with the given ID
	 */
	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public Users getOne(@PathVariable Long id) {
		return repository.findById(id).orElseThrow();
	}

	/**
	 * Creates a new user account.
	 *
	 * @param user the user to create
	 * @return the created user
	 */
	@PostMapping
	public Users create(@RequestBody Users user) {
		user.setUserRole(Role.CUSTOMER);
		return repository.save(user);
	}

	/**
	 * Deletes the user with the given ID.
	 *
	 * @param id the ID of the user to delete
	 */
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public void delete(@PathVariable Long id) {
		repository.deleteById(id);
	}

	/**
	 * Updates the current session's user with optional contact info
	 * (email/phone), for prepopulating checkout on a returning session.
	 *
	 * @param request fields to update; null fields are left unchanged
	 * @return the updated user
	 */
	@PostMapping("/contact")
	@PreAuthorize("hasRole('CUSTOMER')")
	public Users updateContact(@RequestBody UpdateContactRequest request) {
		Users user = userService.getUserFromSession();
		return userService.updateContactInfo(user, request);
	}
}
