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
import lombok.Data;

/**
 * Registered user account with authentication credentials.
 */
@Data
@Entity
@Table(name = "users")
public class Users {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@CreationTimestamp
	private LocalDateTime createdAt;
	@UpdateTimestamp
	private LocalDateTime updatedAt;
	private String email;
	private String phoneNumber; // completes to phone_number in the table
	private String password;
	private Boolean isAdmin;

	@NotNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Role userRole;

	public enum Role {
		CUSTOMER, REGISTERED, ADMIN
	}

}
