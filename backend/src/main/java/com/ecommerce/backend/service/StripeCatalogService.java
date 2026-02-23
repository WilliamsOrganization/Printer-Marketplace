package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateCatalogRequest;
import com.ecommerce.backend.dto.CreateCatalogResponse;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Price;
import com.stripe.model.Product;
import com.stripe.param.PriceCreateParams;
import com.stripe.param.ProductCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * StripeCatalogService
 */
@Service
@RequiredArgsConstructor
public class StripeCatalogService {
    private final InventoryItemRepository inventoryItemRepository;

    public CreateCatalogResponse createProductAndPrice(CreateCatalogRequest req)
        throws StripeException {
        ProductCreateParams productCreateParams =
            ProductCreateParams.builder()
                .setName(req.getName())
                .setDescription(req.getDescription())
                .putMetadata("source", "springboot")
                .putMetadata("stock_qty_snapshot",
                             String.valueOf(req.getQuantity()))
                .build();
        Product product = Product.create(productCreateParams);

        PriceCreateParams priceCreateParams =
            PriceCreateParams.builder()
                .setProduct(product.getId())
                .setUnitAmount(req.getUnitAmount() * 100)
                .setCurrency(req.getCurrency().toLowerCase())
                .build();

        Price price = Price.create(priceCreateParams);

        return new CreateCatalogResponse(
            product.getId(), price.getId(), product.getName(),
            price.getUnitAmount(), price.getCurrency());
    }
}
