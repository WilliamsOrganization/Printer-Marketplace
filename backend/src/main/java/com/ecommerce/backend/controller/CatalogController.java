package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CreateCatalogRequest;
import com.ecommerce.backend.dto.CreateCatalogResponse;
import com.ecommerce.backend.service.StripeCatalogService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * CatalogController
 */

@RestController
@RequestMapping("/server/catalog")
@RequiredArgsConstructor
public class CatalogController {
    private final StripeCatalogService stripeCatalogService;

	/**
     * Creates a new catalog item.
     *
     * @param request the request
     * @return the response
     */
    @PostMapping("/items")
	@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?>
    createCatalogItem(@RequestBody CreateCatalogRequest request) {
        try {
            CreateCatalogResponse response =
                stripeCatalogService.createProductAndPrice(request);
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(
                java.util.Map.of("error", e.getMessage()));
        }
    }
}
