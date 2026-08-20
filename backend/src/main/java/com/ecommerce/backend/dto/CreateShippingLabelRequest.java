package com.ecommerce.backend.dto;

/**
 * The admin's chosen real-world box dimensions/weight for purchasing a
 * shipping label - deliberately separate from the estimated parcel used to
 * quote the customer at checkout (see ShippingService.estimateParcel),
 * since the actual box packed for fulfilment can end up a different size.
 * The frontend offers ShippingParcel.SizeCategory/WeightCategory as presets
 * to prefill these, but any custom values are accepted here too.
 */
public record CreateShippingLabelRequest(
		Long lengthCm,
		Long widthCm,
		Long heightCm,
		Long weightGrams
) {}
