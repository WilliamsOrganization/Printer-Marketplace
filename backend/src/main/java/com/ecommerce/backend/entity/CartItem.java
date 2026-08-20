package com.ecommerce.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.ToString;

/**
 * Line item in a shopping cart linking a cart to an inventory item with
 * quantity.
 */
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "cartItem", uniqueConstraints = @UniqueConstraint(
                              columnNames = {"cart_id", "item_id"}))
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // for JPA
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @CreationTimestamp private LocalDateTime createdAt;

    @UpdateTimestamp private LocalDateTime updatedAt;

    @NonNull
    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonBackReference
	// This breaks the circular reference errors 
    @ToString.Exclude
    private Cart cart;

    @NonNull
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private InventoryItem item;

    // TODO: consider @Positive (jakarta.validation) - can't add zero/negative
    // quantity to a cart
    @NonNull @Column(nullable = false) private Integer quantity;
}
