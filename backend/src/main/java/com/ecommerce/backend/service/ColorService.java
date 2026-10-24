/* (C)2026 */
package com.ecommerce.backend.service;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ColorRequest;
import com.ecommerce.backend.entity.Color;
import com.ecommerce.backend.exception.NotFoundException;
import com.ecommerce.backend.repository.ColorRepository;

import lombok.RequiredArgsConstructor;

/**
 * ColorService manages the colors 3MF regions can be printed in.
 */
@Service
@RequiredArgsConstructor
public class ColorService {
	private static final Pattern HEX = Pattern.compile("^#[0-9A-Fa-f]{6}$");

	private final ColorRepository colorRepository;

	/**
	 * Creates a new color.
	 */
	public Color create(ColorRequest request) {
		Color color = Color.builder().name(requireName(request.name())).hex(normalizeHex(request.hex()))
				.isDisabled(Boolean.TRUE.equals(request.isDisabled())).build();
		return colorRepository.save(color);
	}

	/**
	 * Soft deletes a color so existing selections that reference it still resolve.
	 */
	public void delete(Long id) {
		Color color = getOne(id);
		color.setIsDeleted(true);
		colorRepository.save(color);
	}

	/**
	 * Every color that isn't deleted, including disabled ones.
	 */
	public List<Color> getAll() {
		return colorRepository.findByIsDeletedFalseOrderByNameAsc();
	}

	/**
	 * Colors customers can currently pick.
	 */
	public List<Color> getAvailable() {
		return colorRepository.findByIsDeletedFalseAndIsDisabledFalseOrderByNameAsc();
	}

	public Color getOne(Long id) {
		return colorRepository.findByIdAndIsDeletedFalse(id)
				.orElseThrow(() -> new NotFoundException("Color not found: " + id));
	}

	private String normalizeHex(String hex) {
		if (hex == null || !HEX.matcher(hex).matches())
			throw new IllegalArgumentException("Hex must look like #RRGGBB");
		return hex.toUpperCase(Locale.ROOT);
	}

	private String requireName(String name) {
		if (name == null || name.isBlank())
			throw new IllegalArgumentException("Color name is required");
		return name.trim();
	}

	/**
	 * Replaces the name and hex of a color, and its disabled flag when given.
	 */
	public Color update(Long id, ColorRequest request) {
		Color color = getOne(id);
		color.setName(requireName(request.name()));
		color.setHex(normalizeHex(request.hex()));
		if (request.isDisabled() != null)
			color.setIsDisabled(request.isDisabled());
		return colorRepository.save(color);
	}
}
