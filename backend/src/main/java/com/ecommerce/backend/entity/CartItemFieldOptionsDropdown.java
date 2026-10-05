package com.ecommerce.backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * CartItemFieldOptionsDropdown is a plain labelled option selected for a
 * checklist or radio group CartItemField.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("dropdown")
public class CartItemFieldOptionsDropdown extends CartItemFieldOptions {
    public static CartItemFieldOptionsDropdown from(InventoryItemFieldOptions options) {
        return CartItemFieldOptionsDropdown.builder()
                .label(options.getLabel())
                .price(options.getPrice())
                .build();
    }
}
