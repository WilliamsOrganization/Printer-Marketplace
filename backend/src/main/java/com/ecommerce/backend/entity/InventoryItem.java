package com.ecommerce.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

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
     * Standard physical package footprint sizes an item ships in, width by
     * length in centimeters. A rough classification (not the item's exact
     * dimensions) so a whole order's items can be combined into one
     * estimated ShippingParcel at checkout - see ShippingService.estimateParcel.
     */
    public enum SizeCategory {
        SIZE_2X2(2, 2),
        SIZE_4X5(4, 5),
        SIZE_5X7(5, 7),
        SIZE_8X10(8, 10),
        SIZE_11X14(11, 14),
        SIZE_16X20(16, 20),
        SIZE_20X30(20, 30);

        public final int widthCm;
        public final int lengthCm;

        SizeCategory(int widthCm, int lengthCm) {
            this.widthCm = widthCm;
            this.lengthCm = lengthCm;
        }
    }

    /**
     * Standard weight tiers an item ships at, in grams - same rough,
     * checkout-estimate purpose as SizeCategory above.
     */
    public enum WeightCategory {
        LIGHT(100),
        MEDIUM(500),
        HEAVY(1000),
        EXTRA_HEAVY(2000);

        public final int grams;

        WeightCategory(int grams) {
            this.grams = grams;
        }
    }

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
    @Column(nullable = false, columnDefinition = "varchar(255) default 'SIZE_4X5'")
    private SizeCategory sizeCategory;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'MEDIUM'")
    private WeightCategory weightCategory;
}
