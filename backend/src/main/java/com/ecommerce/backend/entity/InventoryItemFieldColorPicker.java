package com.ecommerce.backend.entity;

import java.net.URL;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonManagedReference;

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

    @OneToMany(mappedBy = "inventoryItemField", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @NonNull @NotNull private List<InventoryItemFieldOptionsStlColor> options;

    /**
     * Returns the options for this field.
     */
    public List<InventoryItemFieldOptionsStlColor> getOptions(){
        return options;
    };

}
