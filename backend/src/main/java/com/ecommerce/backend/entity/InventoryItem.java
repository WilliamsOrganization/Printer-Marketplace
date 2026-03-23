package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Product available for purchase in the store.
 */
@Data
@Entity
@Table(name = "inventoryItem")
public class InventoryItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@CreationTimestamp
	private LocalDateTime createdAt;
	@UpdateTimestamp
	private LocalDateTime updatedAt;

	private String itemTitle;
	private String itemDescription;
	private Long itemCost;

	@Column(columnDefinition = "text[]")
	private String[] imageUrls;

	private String stripePriceId;
	private String stripeProductId;

	private Long quantity;

	private String currency;

	private Boolean sale;

	@Column(nullable = false, columnDefinition = "boolean default false")
	private Boolean isArchived = false;

	@Enumerated(EnumType.STRING)
	private Category category;

	@Enumerated(EnumType.STRING)
	private Badge badge;

	public enum Category {
		ELECTRONICS, PRINTS, CUSTOM
	}

	public enum Badge {
		BESTSELLER, NEW, SALE
	}
}
