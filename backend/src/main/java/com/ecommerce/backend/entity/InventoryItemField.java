package com.ecommerce.backend.entity;

import java.beans.Transient;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.experimental.SuperBuilder;


/**
 * An inventory item field contains a list of configurabel options that always contain a price.
 *
 */
@Data
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Table(name = "inventory_item_field")
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorColumn(name = "field_type")
public abstract class InventoryItemField {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @NonNull
    @NotNull
    @Column(nullable=false)
    private String label;

    @NonNull
    @NotNull
    @Column(nullable=false)
    private String description;

    /**
     * The price of the field in cents.
     */
    @Transient
    public abstract List<? extends InventoryItemFieldOptions> getOptions();

    /**
     * The price of the field in cents.
     */
    public long tallyOptionsPrice() {
        return getOptions().stream()
                .mapToLong(InventoryItemFieldOptions::getPrice)
                .sum();
    }
}
