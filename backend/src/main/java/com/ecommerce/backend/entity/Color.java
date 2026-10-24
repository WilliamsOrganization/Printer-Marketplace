/* (C)2026 */
package com.ecommerce.backend.entity;

import java.util.Locale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * Colors in which all ThreeMF files can choose from. they will be recorded.
 * Deleting a color only flags it, so cart and order selections that reference
 * it keep resolving.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Data
@Entity
@Table(name = "colors")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Color {

	public static class ColorBuilder {
		public ColorBuilder hex(String hex) {
			if (hex == null || !hex.matches("^#[0-9A-Fa-f]{6}$"))
				throw new IllegalArgumentException("Hex must look like #RRGGBB");
			this.hex = hex.toUpperCase(Locale.ROOT);
			return this;
		}
	}

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE)
	private Long id;

	@Column(nullable = false)
	private String name;

	/**
	 * Uppercase #RRGGBB.
	 */
	@Column(nullable = false, length = 7)
	private String hex;

	/**
	 * Hidden from customers but still listed for the admin, e.g. out of stock.
	 */
	@Builder.Default
	@Column(nullable = false)
	private Boolean isDisabled = false;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isDeleted = false;
}
