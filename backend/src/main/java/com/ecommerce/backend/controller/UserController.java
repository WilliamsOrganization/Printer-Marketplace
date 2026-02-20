package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.entity.Users.Role;
import com.ecommerce.backend.repository.UserRepository;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for user account operations.
 */
@RestController
@RequestMapping("/server/users")
public class UserController {
	private final UserRepository repository;

	public UserController(UserRepository repository) {
		this.repository = repository;
	}

	@GetMapping
	public List<Users> getAll() {
		return repository.findAll();
	}

	@GetMapping("/{id}")
	public Users getOne(@PathVariable Long id) {
		return repository.findById(id).orElseThrow();
	}

	@PostMapping
	public Users create(@RequestBody Users user) {
		user.setUserRole(Role.CUSTOMER);
		return repository.save(user);
	}

	@DeleteMapping("/{id}")

	public void delete(@PathVariable Long id) {
		repository.deleteById(id);
	}
}
