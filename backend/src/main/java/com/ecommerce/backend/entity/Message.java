package com.ecommerce.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import org.hibernate.annotations.CreationTimestamp;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * Chats
 */
@Data
@Entity
@Table(name = "messages")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Message {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NonNull
	@NotNull
	@CreationTimestamp
	private LocalDateTime createdAt;

	@NonNull
	@NotNull
	@OneToOne
	@JoinColumn(name = "user_id", unique = false)
	private Users sender;

	@NonNull
	@NotNull
	@ManyToOne
	@JoinColumn(name = "chat_id", unique = false)
	private Chat chat;

	@NonNull
	@NotNull
	private String content;

	// // TODO: drop this and join a table so you can track per-user reactions
	// @JdbcTypeCode(SqlTypes.ARRAY)
	// @Column(columnDefinition = "text[]")
	// private String[] reactions;
}
