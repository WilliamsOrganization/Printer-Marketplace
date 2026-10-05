package com.ecommerce.backend.entity;

import java.net.URL;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * OrderItemFieldOptionsDropdown is a collection of options for a group of
 * OrderItemFields, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("stl_color")
public class OrderItemFieldOptionsStlColor extends OrderItemFieldOptions {

    @NonNull
    @NotNull
    private InventoryItemFieldOptionsStlColor.Color selectedColor;

    @NonNull
    @NotNull
    private URL stlUrl;

    /**
     * Copies a cart color option into the order, including the STL file and color to print.
     */
    public static OrderItemFieldOptionsStlColor from(CartItemFieldOptionsStlColor source) {
        return builder()
                .label(source.getLabel())
                .price(source.getPrice())
                .selectedColor(source.getSelectedColor())
                .stlUrl(source.getStlUrl())
                .build();
    }
}
