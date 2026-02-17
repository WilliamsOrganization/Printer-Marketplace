package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.UserRepository;
import java.util.List;
import org.aspectj.apache.bcel.classfile.Module.Uses;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * UserController
 */
@RestController
@RequestMapping("/api/users")
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
		// TODO: process POST request
		return repository.save(user);
	}

	@DeleteMapping("/{id}")

	public void delete(@PathVariable Long id) {
		// TODO: process POST request
		repository.deleteById(id);
	}
}
