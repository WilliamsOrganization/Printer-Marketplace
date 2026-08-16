package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import org.hibernate.annotations.CreationTimestamp;


@Entity
@Table(name = "email_verification_codes")
@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class EmailVerification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_email_verification_codes_users"))
	private Users user;
	@NotNull @NonNull private String email;
	@NotNull @NonNull
	@Column(length = 6)
	private String code;
	@NotNull @NonNull private LocalDateTime expiryDate;

	@CreationTimestamp
	private LocalDateTime createdAt;


	@NotNull
	@NonNull
	@Column(nullable = false)
	@Enumerated(EnumType.STRING)
	private Reason reason;

	public enum Reason {
		CREATE_ACCOUNT, RESET_PASSWORD, CHANGE_EMAIL
	}
}
