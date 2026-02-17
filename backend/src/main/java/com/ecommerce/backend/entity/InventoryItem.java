package com.ecommerce.backend.entity;

import java.sql.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * InventoryItem This is a marketplace Item in which to market 
 */
@Data
@Entity
@Table(name = "InventoryItem")
public class InventoryItem {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY )
	private Long id;
	private String itemName;
	private Long itemCost;

	@CreationTimestamp
	private Date createdAt;

	@UpdateTimestamp
	private Date updatedAt;
}
