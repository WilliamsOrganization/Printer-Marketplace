package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CreateCatalogRequest;
import com.ecommerce.backend.dto.CreateCatalogResponse;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.ecommerce.backend.service.StripeCatalogService;
import com.stripe.exception.StripeException;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for product inventory operations.
 */

@Slf4j
@RestController
@RequestMapping("/server/inventoryitem")
@RequiredArgsConstructor
public class InventoryItemController {
    private final StripeCatalogService stripeCatalogService;
    private final InventoryItemRepository inventoryItemRepository;

    @GetMapping
    public List<InventoryItem> getAll() {
        return inventoryItemRepository.findAll(
            Sort.by(Sort.Direction.ASC, "id"));
    }

    @GetMapping("/{id}")
    public InventoryItem getOne(@PathVariable Long id) {
        return inventoryItemRepository.findById(id).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryItem create(@RequestBody InventoryItem inventoryitem) {
        InventoryItem item = inventoryItemRepository.save(inventoryitem);

        CreateCatalogRequest createCatalogRequest = new CreateCatalogRequest(
            item.getItemTitle(), item.getItemDescription(), item.getItemCost(),
            item.getCurrency(), item.getQuantity());

        try {
            CreateCatalogResponse stripeResponse = stripeCatalogService.createProductAndPrice(createCatalogRequest);
            item.setStripePriceId(stripeResponse.stripePriceId());
            item.setStripeProductId(stripeResponse.stripeProductId());
            log.info("Stripe Item was created");
            return inventoryItemRepository.save(item);
        } catch (StripeException e) {
            log.error("Stripe Item was not created: " + e.getMessage());
        }
        return item;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public InventoryItem update(@PathVariable Long id,
                                @RequestBody InventoryItem updated) {
        InventoryItem existing =
            inventoryItemRepository.findById(id).orElseThrow();
        existing.setItemTitle(updated.getItemTitle());
        existing.setItemDescription(updated.getItemDescription());
        existing.setItemCost(updated.getItemCost());
        existing.setImageUrls(updated.getImageUrls());
        existing.setQuantity(updated.getQuantity());
        existing.setCurrency(updated.getCurrency());
        existing.setCategory(updated.getCategory());
        existing.setBadge(updated.getBadge());
        existing.setSale(updated.getSale());
        return inventoryItemRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        inventoryItemRepository.deleteById(id);
    }
    // TODO: big todo to create the upload image route for the item creation
}
