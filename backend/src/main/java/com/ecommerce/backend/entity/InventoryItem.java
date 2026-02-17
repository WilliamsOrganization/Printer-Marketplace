package com.ecommerce.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.sql.Date;
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
	private Date createdAt;
	@UpdateTimestamp
	private Date updatedAt;

	private String itemTitle;
	private String item;
	private Long itemCost;
	private String imageUrl;
	private String stripeId;
	private Boolean sale;

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
