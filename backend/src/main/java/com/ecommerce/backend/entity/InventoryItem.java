package com.ecommerce.backend.entity;

import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Inventory Item is the Product available for purchase in the store contains
 * description and inventory quantity
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Data
@Entity
@Table(name = "inventoryItem")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// TODO: revisi this not sure if its really needed for anything
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class InventoryItem {

    /**
     * These are the categories of products that can be purchased in the store
     */
    public enum Category { ELECTRONICS, PRINTS, CUSTOM }

    /**
     * These are the badges that can be awarded to products
     */
    public enum Badge { BESTSELLER, NEW, SALE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @CreationTimestamp private LocalDateTime createdAt;

    @UpdateTimestamp private LocalDateTime updatedAt;

    // TODO: consider @Size(min = 1, max = ...) to bound title length
    @NonNull @Column(nullable = false) private String itemTitle;

    // TODO: consider @Size(max = ...) to bound description length
    @NonNull @Column(nullable = false) private String itemDescription;

    // TODO: consider @Positive (jakarta.validation) - cost shouldn't be
    // zero/negative
    @NonNull @Column(nullable = false) private Long itemCost;
    @Column(columnDefinition = "text[]") private String[] imageUrls;

    // TODO: needs to support multiple priceIds for tiered products eventually
    @NonNull @Column(nullable = false) private String stripePriceId;

    @NonNull @Column(nullable = false) private String stripeProductId;

    // TODO: consider @PositiveOrZero (stock can be 0, not negative)
    // TODO: consider @Version on this class for optimistic locking - concurrent
    // checkouts decrementing quantity at once can oversell stock without it
    @NonNull @Column(nullable = false) private Long quantity;

    // TODO: consider @Pattern/@Size(min = 3, max = 3) to validate ISO currency
    // code
    @NonNull
    @Column(nullable = false, columnDefinition = "boolean default CAD")
    private String currency;

    private Boolean sale;

    // TODO: needs @Builder.Default or the builder passes null (not false) here,
    // which trips @NonNull the moment .build() is called without
    // .isArchived(...)
    @NonNull
    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isArchived = false;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING) private Badge badge;

	// TODO: conider moving these to a separate class for shipping item information
    @NonNull @NotNull @Column(nullable = false, columnDefinition = "integer default 500") private Long height;

    @NonNull @NotNull @Column(nullable = false, columnDefinition = "integer default 500") private Long width;

    @NonNull @NotNull @Column(nullable = false, columnDefinition = "integer default 500") private Long length;

    @NonNull @NotNull @Column(nullable = false, columnDefinition = "integer default 500") private Long weight;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'LB'")
    private WeightUnitEnum weightUnit;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'IN'")
    private DistanceUnitEnum distanceUnit;
}
