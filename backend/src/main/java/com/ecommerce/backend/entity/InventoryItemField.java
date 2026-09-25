package com.ecommerce.backend.entity;

import jakarta.persistence.Transient;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.experimental.SuperBuilder;


/**
 * An inventory item field contains a list of configurable options that always contain a price.
 * Each field belongs to exactly one InventoryItem.
 */
@Data
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Table(name = "inventory_item_field")
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@DiscriminatorColumn(name = "field_type")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "field_type", visible = true)
@JsonSubTypes({
    @JsonSubTypes.Type(value = InventoryItemFieldRadioGroup.class, name = "radio_group"),
    @JsonSubTypes.Type(value = InventoryItemFieldChecklist.class, name = "checklist"),
    @JsonSubTypes.Type(value = InventoryItemFieldColorPicker.class, name = "color_picker"),
})
public abstract class InventoryItemField {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @JsonProperty("field_type")
    @Column(name = "field_type", insertable = false, updatable = false)
    private String fieldType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id")
    @JsonIgnore
    private InventoryItem inventoryItem;

    @NonNull
    @NotNull
    @Column(nullable=false)
    private String label;

    @NonNull
    @NotNull
    @Column(nullable=false)
    private String description;

    @Transient
    public abstract List<? extends InventoryItemFieldOptions> getOptions();

    public long tallyOptionsPrice() {
        long total = 0;
        for (InventoryItemFieldOptions opt : getOptions()) {
            total += opt.getPrice();
        }
        return total;
    }
}
