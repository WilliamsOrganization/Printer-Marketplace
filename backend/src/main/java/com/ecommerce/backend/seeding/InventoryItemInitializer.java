package com.ecommerce.backend.seeding;

import java.util.List;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ecommerce.backend.dto.CreateCatalogRequest;
import com.ecommerce.backend.dto.CreateCatalogResponse;
import com.ecommerce.backend.entity.InventoryItem;
import com.ecommerce.backend.repository.InventoryItemRepository;
import com.ecommerce.backend.service.StripeCatalogService;
import com.stripe.exception.StripeException;
import com.stripe.model.ProductCollection;

import lombok.extern.slf4j.Slf4j;

/**
 * Seeds and cleans out the data for InventoryItems Stripe IDs and Image file
 * uploads in blob storage.
 */
@Slf4j
@Configuration
public class InventoryItemInitializer {
    private static final Long ID = 1L;
    private static final Long QUANTITY = 10L;
    private static final String CURRENCY = "CAD";
    // dollars, not cents - StripeCatalogService multiplies by 100 internally
    private static final Long UNIT_AMOUNT = 2L;
    private static final List<String> IMAGE_URLS =
	// TODO: make these local uploads 
        List.of("https://placehold.co/600x400.png");
	private static final Logger logger = LoggerFactory.getLogger(InventoryItemInitializer.class);

    @Value("${app.admin.password}") private String password;
    @Value("${app.admin.email}") private String email;
    @Value("${app.admin.phone}") private String phone;


	/**
	 * This is intended for managing inventory item seed data. Use this url to clear out stripe data https://dashboard.stripe.com/test/settings/data
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
    @Bean
    ApplicationRunner
    createDefaultInventory(InventoryItemRepository inventoryItemRepository,
                           StripeCatalogService stripeCatalogService) {
        return args -> {
            if (inventoryItemRepository.count() > 0) {
				logger.info("[INIT]: no seed data detected clearing out stripe. populating new data");
				ProductCollection products = stripeCatalogService.getAllProducts();
				// logger.info("[INIT]: ATTEMPTING TO DELETE: {}", products.getData().size());
				// CleanUnusedProductsAndArchive(stripeCatalogService, products);
				// TODO: FIX THIS
				// activateInventoryWithStripeProduct(inventoryItemRepository, stripeCatalogService, products);
				
                // ID, "Apple", "A delicious fruit",
                // seedItem(inventoryItemRepository, stripeCatalogService, ID,
                //          "Apple", "A delicious fruit",
                //          InventoryItem.Category.ELECTRONICS,
                //          InventoryItem.Badge.BESTSELLER);
                //
                // seedItem(inventoryItemRepository, stripeCatalogService, 1 + ID,
                //          "Banana", "A delicious fruit",
                //          InventoryItem.Category.PRINTS,
                //          InventoryItem.Badge.BESTSELLER);
                // seedItem(inventoryItemRepository, stripeCatalogService, 2 + ID,
                //          "Orange", "A delicious fruit",
                //          InventoryItem.Category.CUSTOM,
                //          InventoryItem.Badge.BESTSELLER);
            }else{
				logger.info("[INIT]: Seed data populated skipping");
			}
        };
    }

    /**
     * Creates one seed InventoryItem (and its matching Stripe product/price)
     * if it doesn't already exist by id.
     *
     * @param inventoryItemRepository repository to check for/save the item
     * @param stripeCatalogService    used to create the Stripe product/price
     * @param id                      the seed item's id
     * @param title                   the item's title
     * @param description             the item's description
     * @param category                the item's category
     * @param badge                   the item's badge
     */
    private void seedItem(InventoryItemRepository inventoryItemRepository,
                          StripeCatalogService stripeCatalogService, Long id,
                          String title, String description,
                          InventoryItem.Category category,
                          InventoryItem.Badge badge) {
        if (inventoryItemRepository.findById(id).isPresent()) {
            return;
        }
        try {
            CreateCatalogResponse catalog =
                stripeCatalogService.createProductAndPrice(
                    new CreateCatalogRequest(title, description, IMAGE_URLS,
                                             UNIT_AMOUNT, CURRENCY, QUANTITY));

            InventoryItem item =
                InventoryItem.builder()
                    .itemTitle(title)
                    .itemDescription(description)
                    // unitAmount comes back from Stripe in cents
                    .itemCost(catalog.unitAmount())
                    .stripePriceId(catalog.stripePriceId())
                    .stripeProductId(catalog.stripeProductId())
                    .quantity(QUANTITY)
                    .currency(CURRENCY)
                    .badge(badge)
                    .category(category)
                    .build();
            inventoryItemRepository.save(item);
        } catch (StripeException e) {
            log.error("Failed to seed inventory item '{}' via Stripe: {}",
                      title, e.getMessage());
        }
    }

    /**
     * Unimplemented stub for uploading an item's seed images to blob
     * storage.
     */
    private void seedS3Images(InventoryItem item) {
    }

	/**
	 * This method sucks. you cant delete many products at once. You have to delete one at a time. 
	 * its easy to hit rate limits with large deletes/archives so try to be better about nuking the test data 
	 * https://stripe.com/docs/api/products/delete
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	private void CleanUnusedProductsAndArchive(StripeCatalogService stripeCatalogService, ProductCollection products) {
		try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
			products.autoPagingIterable().forEach(product -> {
				executor.submit(() -> {
					try {
						stripeCatalogService.deleteProduct(product.getId());
					} catch (StripeException e) {
						logger.error("Failed to delete product: {}", e.getMessage());
					} finally {
						logger.info("[INIT]: deleted product: {}", product.getName());
					}
				});
			});
		}
	}

	/**
	 * This method is going to transform the ProductCollection our seeded data as it contains in parallel most of what we need then we require very little synchronizing logic. 
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	private void seedInventoryWithStripeProduct(InventoryItemRepository inventoryItemRepository
		, StripeCatalogService stripeCatalogService, ProductCollection products) {
		try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
			products.autoPagingIterable().forEach(product -> {
				executor.submit(() -> {
					try {
						stripeCatalogService.deleteProduct(product.getId());
					} catch (StripeException e) {
						logger.error("Failed to delete product: {}", e.getMessage());
					} finally {
						logger.info("[INIT]: deleted product: {}", product.getName());
					}
				});
			});
		}
	}

	/**
	 * Reactivates every archived Stripe product in the given collection,
	 * concurrently (one virtual thread per product).
	 *
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 * @param inventoryItemRepository unused - kept for signature symmetry
	 *                                with the other seeding helpers
	 * @param stripeCatalogService    used to activate each Stripe product
	 * @param products                the products to activate
	 */
	private void activateInventoryWithStripeProduct(InventoryItemRepository inventoryItemRepository
		, StripeCatalogService stripeCatalogService, ProductCollection products) {
		try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
			products.autoPagingIterable().forEach(product -> {
				executor.submit(() -> {
					try {
						
						stripeCatalogService.activateProduct(product.getId());
					} catch (StripeException e) {
						logger.error("[ERROR]: Failed to activate product: {}", e.getMessage());
					} finally {
						logger.info("[INIT]: activated product: {}", product.getName());
					}
				});
			});
		}
	}
}
