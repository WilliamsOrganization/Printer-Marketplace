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
 * InventoryItemFieldOptionsDropdown is a collection of options for a group of
 * InventoryItemFields, such as a size or weight category.
 *
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorValue("stl_color")
public class InventoryItemFieldOptionsStlColor extends InventoryItemFieldOptions {

    /**
     * These are the available colors for the STL file to print via (best guess as to what amy actually has)
     * 
     */
    public enum Color {
        BLACK("Black", "#000000"),
        BLUE("Blue", "#0000FF"),
        BROWN("Brown", "#A52A2A"),
        GREEN("Green", "#008000"),
        GREY("Grey", "#808080"),
        ORANGE("Orange", "#FFA500"),
        PINK("Pink", "#FFC0CB"),
        PURPLE("Purple", "#800080"),
        RED("Red", "#FF0000"),
        WHITE("White", "#FFFFFF"),
        YELLOW("Yellow", "#FFFF00");

        private final String name;
        private final String hex;

        Color(String name, String hex) {
            this.name = name;
            this.hex = hex;
        }

        /**
         * 
         * @return the name of the color
         */
        public String getName() {
            return name;
        }

        /**
         * 
         * @return the hex value of the color
         */
        public String getHex() {
            return hex;
        }
    }

    @NonNull
    @NotNull
    private Color selectedColor;

    @NonNull
    @NotNull
    private URL stlUrl;
}
