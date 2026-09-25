package com.ecommerce.backend.entity;

import java.net.URL;
import java.util.List;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
@DiscriminatorValue("color_picker")
public class InventoryItemFieldColorPicker extends InventoryItemField {

    @NonNull
    @NotNull
    private URL stlUrl;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "inventory_color_picker_options",
        joinColumns = @JoinColumn(name = "color_picker_id"),
        inverseJoinColumns = @JoinColumn(name = "options_id")
    )
    @NonNull @NotNull private List<InventoryItemFieldOptionsStlColor> options;

    /**
     * Returns the options for this field.
     */
    public List<InventoryItemFieldOptionsStlColor> getOptions(){
        return options;
    };

}
