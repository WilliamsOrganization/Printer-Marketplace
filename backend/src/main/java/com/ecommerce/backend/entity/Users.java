package com.ecommerce.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * Registered user account with authentication credentials.
 */
@Data
@Entity
@Table(name = "users")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Users {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@CreationTimestamp
	private LocalDateTime createdAt;
	@UpdateTimestamp
	private LocalDateTime updatedAt;
	// TODO: consider @Email + @NotBlank (jakarta.validation)
	@Column(unique = true)
	private String email;
	// TODO: consider @Pattern for phone number format
	private String phoneNumber; // completes to phone_number in the table
	// TODO: consider @Size(min = ...) minimum length - confirm this stores a hash, not raw password
	private String password;
	private Boolean isAdmin;

	@NotNull
	@NonNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Role userRole;

	public enum Role {
		CUSTOMER, REGISTERED, ADMIN
	}

}
