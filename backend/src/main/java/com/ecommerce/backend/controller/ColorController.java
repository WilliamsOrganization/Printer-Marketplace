/* (C)2026 */
package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.ColorRequest;
import com.ecommerce.backend.entity.Color;
import com.ecommerce.backend.service.ColorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/server/colors")
@RequiredArgsConstructor
public class ColorController {
	private final ColorService colorService;

	/**
	 * Creates a color.
	 */
	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	@ResponseStatus(HttpStatus.CREATED)
	public Color create(@RequestBody ColorRequest request) {
		return colorService.create(request);
	}

	/**
	 * Soft deletes a color.
	 */
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		colorService.delete(id);
	}

	/**
	 * Lists every color that isn't deleted, including disabled ones.
	 */
	@GetMapping("/admin/all")
	@PreAuthorize("hasRole('ADMIN')")
	public List<Color> getAll_admin() {
		return colorService.getAll();
	}

	/**
	 * Lists the colors customers can pick.
	 */
	@GetMapping
	public List<Color> getAvailable() {
		return colorService.getAvailable();
	}

	/**
	 * Gets a color by ID.
	 */
	@GetMapping("/{id}")
	public Color getOne(@PathVariable Long id) {
		return colorService.getOne(id);
	}

	/**
	 * Updates a color's name, hex and disabled flag.
	 */
	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public Color update(@PathVariable Long id, @RequestBody ColorRequest request) {
		return colorService.update(id, request);
	}
}
