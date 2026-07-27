package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;

/**
 * Physical packaging dimensions and weight for a single InventoryItem,
 * used to quote shipping rates.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Data
@Entity
@Table(name = "inventoryItemParcelInfo")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class InventoryItemParcelInfo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @OneToOne
    @JoinColumn(name = "inventory_item_id", nullable = false)
    @NotNull
    @NonNull
    private InventoryItem inventoryItem;

    @NonNull @NotNull @Column(nullable = false) private Long height;

    @NonNull @NotNull @Column(nullable = false) private Long width;

    @NonNull @NotNull @Column(nullable = false) private Long length;

    @NonNull @NotNull @Column(nullable = false) private Long weight;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeightUnitEnum weightUnit;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DistanceUnitEnum distanceUnit;
}		
