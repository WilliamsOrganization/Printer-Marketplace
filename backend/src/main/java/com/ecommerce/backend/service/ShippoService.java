package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ShipmentFromValues;
import com.ecommerce.backend.dto.ShipmentToValues;
import com.goshippo.shippo_sdk.Shippo;
import com.goshippo.shippo_sdk.models.components.AddressCompleteCreateRequest;
import com.goshippo.shippo_sdk.models.components.AddressCreateRequest;
import com.goshippo.shippo_sdk.models.components.AddressFrom;
import com.goshippo.shippo_sdk.models.components.AddressTo;
import com.goshippo.shippo_sdk.models.components.CustomsDeclarationContentsTypeEnum;
import com.goshippo.shippo_sdk.models.components.CustomsDeclarationCreateRequest;
import com.goshippo.shippo_sdk.models.components.CustomsDeclarationNonDeliveryOptionEnum;
import com.goshippo.shippo_sdk.models.components.CustomsItemCreateRequest;
import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
import com.goshippo.shippo_sdk.models.components.LineItem;
import com.goshippo.shippo_sdk.models.components.LiveRateCreateRequest;
import com.goshippo.shippo_sdk.models.components.LiveRateCreateRequestAddressFrom;
import com.goshippo.shippo_sdk.models.components.LiveRateCreateRequestAddressTo;
import com.goshippo.shippo_sdk.models.components.ParcelCreateRequest;
import com.goshippo.shippo_sdk.models.components.Parcels;
import com.goshippo.shippo_sdk.models.components.ShipmentCreateRequest;
import com.goshippo.shippo_sdk.models.components.ShipmentCreateRequestCustomsDeclaration;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;
import com.goshippo.shippo_sdk.models.operations.CreateLiveRateResponse;
import com.goshippo.shippo_sdk.models.operations.CreateShipmentResponse;
import com.goshippo.shippo_sdk.models.components.Rate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * ShippoService this whole class is fucking cursed. Shipping sucks ass dont know what is registered as "test" vs "live" vs "Shippo native" on their dashboard
 * I fucking hate out of date documentation. the fedex links were old as shit
 *
 * KNOWN BUG: Shippo intermittently returns an empty rates list on the first shipment creation
 * for a new address, even when the shipment status is SUCCESS and async is set to false.
 * A single retry currently resolves it, but this may not be sufficient in all cases.
 * Monitor getShipmentRates() for empty rate responses in production logs.
 * Suspect: createShipmentAndGetRates() - the Shippo SDK may not be honoring async(false),
 * or Shippo's backend has a cold-start delay for carrier rate lookups on new addresses.
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippoService {

	private final Shippo shippo;

	public void testShippoLabel(String toEmail, String body) {
	}

	public CreateLiveRateResponse createShipmentResponse(ShipmentFromValues shipmentFromValues,
			ShipmentToValues shipmentToValues) throws Exception {
		CreateLiveRateResponse shipmentResponse = shippo.ratesAtCheckout()
				.create()
				.shippoApiVersion("2018-02-08")
				.liveRateCreateRequest(
						LiveRateCreateRequest.builder()
								.addressFrom(LiveRateCreateRequestAddressFrom.of(
										AddressCompleteCreateRequest.builder()
												.name(shipmentFromValues.getStore())
												.street1(shipmentFromValues.getStreet1())
												.city(shipmentFromValues.getCity())
												.state(shipmentFromValues.getState())
												.zip(shipmentFromValues.getZip())
												.country(shipmentFromValues.getCountry())
												.build()))
								.addressTo(LiveRateCreateRequestAddressTo.of(
										AddressCompleteCreateRequest.builder()
												.name(shipmentToValues.getName())
												.street1(shipmentToValues.getStreet1())
												.city(shipmentToValues.getCity())
												.state(shipmentToValues.getState())
												.zip(shipmentToValues.getZip())
												.country(shipmentToValues.getCountry())
												.build()))
								.lineItems(List.of(LineItem.builder()
										.currency("CAD")
										.quantity(1L)
										.title("Print")
										.totalPrice("12.00")
										.weight("0.5")
										.weightUnit(WeightUnitEnum.LB)
										.build()))
								.build())
				.call();
		return shipmentResponse;
	}

	private ShipmentCreateRequest buildShipmentRequest(ShipmentFromValues from, ShipmentToValues to) {
		return ShipmentCreateRequest.builder()
				.addressFrom(
						AddressFrom.of(AddressCreateRequest.builder()
								.name(from.getStore())
								.street1(from.getStreet1())
								.city(from.getCity())
								.state(from.getState())
								.zip(from.getZip())
								.country(from.getCountry())
								.phone(from.getPhone())
								.build()))
				.addressTo(AddressTo.of(AddressCreateRequest.builder()
						.name(to.getName())
						.street1(to.getStreet1())
						.city(to.getCity())
						.state(to.getState())
						.zip(to.getZip())
						.country(to.getCountry())
						.phone(to.getPhone())
						.build()))
				.parcels(List.of(
						Parcels.of(ParcelCreateRequest.builder()
								.weight("1")
								.massUnit(WeightUnitEnum.LB)
								.length("10")
								.width("8")
								.height("4")
								.distanceUnit(DistanceUnitEnum.IN)
								.build())))
				.customsDeclaration(
						ShipmentCreateRequestCustomsDeclaration.of(
								CustomsDeclarationCreateRequest.builder()
										.contentsType(CustomsDeclarationContentsTypeEnum.MERCHANDISE)
										.nonDeliveryOption(CustomsDeclarationNonDeliveryOptionEnum.RETURN)
										.certify(true)
										.certifySigner("William Ewanchuk")
										.items(List.of(
												CustomsItemCreateRequest.builder()
														.description("Art Print")
														.quantity(1L)
														.netWeight("1")
														.massUnit(WeightUnitEnum.LB)
														.valueAmount("12.00")
														.valueCurrency("CAD")
														.originCountry("CA")
														.build()))
										.build()))
				.async(false)
				.build();
	}

	private List<Rate> createShipmentAndGetRates(ShipmentFromValues from, ShipmentToValues to) throws Exception {
		var shipment = shippo.shipments()
				.create()
				.shippoApiVersion("2018-02-08")
				.shipmentCreateRequest(buildShipmentRequest(from, to))
				.call();

		var shipmentObj = shipment.shipment().get();
		log.info("Shipment created: {}", shipmentObj.objectId());
		log.info("Shipment status: {}", shipmentObj.status());
		log.info("Shipment rates count: {}", shipmentObj.rates().size());
		return shipmentObj.rates();
	}

	public List<Rate> getShipmentRates(ShipmentFromValues from, ShipmentToValues to) throws Exception {
		List<Rate> rates = createShipmentAndGetRates(from, to);

		// Shippo sometimes returns empty rates on first request for a new address
		if (rates.isEmpty()) {
			log.info("Retrying shipment creation for rates...");
			rates = createShipmentAndGetRates(from, to);
		}

		return rates;
	}
}
