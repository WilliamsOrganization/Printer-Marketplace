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
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Session management so far only intended for Amy's main route. 
 */
@Data
@Entity
@Table(name = "session")
public class Sessions {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private Users user;

	@Column(unique = true, nullable = false)
	private String token;

	@CreationTimestamp
	private LocalDateTime createdAt;

	private LocalDateTime expiresAt;

	private String deviceInfo;

	private String providerAccountID;

	@PrePersist
	private void generateToken() {
		if (token == null) {
			token = UUID.randomUUID().toString();
		}
	}
}
