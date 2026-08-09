package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;

/**
 * Session management so far only intended for Amy's main route.
 */
@Data
@Entity
@Table(name = "session", uniqueConstraints = @UniqueConstraint(columnNames="user_id"))
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Sessions {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Nullable: a session can exist before any user is attached to it (see
	// AuthService.resolveOrCreateSession / attachNewUserToSession) - sessions
	// are cheap and created for any request, users are only created lazily
	// once something actually needs one.
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private Users user;

	@Column(unique = true, nullable = false)
	private String token;

	@CreationTimestamp
	private LocalDateTime createdAt;

	// TODO: no simple built-in annotation checks cross-field ordering
	// (expiresAt after createdAt) - would need a custom class-level
	// validator if that guarantee matters here
	private LocalDateTime expiresAt;
	private String providerAccountID;

	@PrePersist
	private void generateToken() {
		if (token == null) {
			token = UUID.randomUUID().toString();
		}
	}
}
