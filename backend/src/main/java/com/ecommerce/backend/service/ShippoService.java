package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ShipmentFromValues;
import com.ecommerce.backend.dto.ShipmentToValues;
import com.goshippo.shippo_sdk.Shippo;
import com.goshippo.shippo_sdk.models.components.AddressCompleteCreateRequest;
import com.goshippo.shippo_sdk.models.components.AddressCreateRequest;
import com.goshippo.shippo_sdk.models.components.AddressFrom;
import com.goshippo.shippo_sdk.models.components.AddressTo;
import com.goshippo.shippo_sdk.models.components.DistanceUnitEnum;
import com.goshippo.shippo_sdk.models.components.LineItem;
import com.goshippo.shippo_sdk.models.components.LiveRateCreateRequest;
import com.goshippo.shippo_sdk.models.components.LiveRateCreateRequestAddressFrom;
import com.goshippo.shippo_sdk.models.components.LiveRateCreateRequestAddressTo;
import com.goshippo.shippo_sdk.models.components.ParcelCreateRequest;
import com.goshippo.shippo_sdk.models.components.Parcels;
import com.goshippo.shippo_sdk.models.components.ShipmentCreateRequest;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;
import com.goshippo.shippo_sdk.models.operations.CreateLiveRateResponse;
import com.goshippo.shippo_sdk.models.operations.CreateShipmentResponse;
import com.goshippo.shippo_sdk.models.operations.ListShipmentRatesResponse;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * ShippoService
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippoService {

	private final Shippo shippo;

	// TODO: DELETE ME FOR LATER
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

	public ListShipmentRatesResponse getShipmentRates(ShipmentFromValues from, ShipmentToValues to) throws Exception {
		CreateShipmentResponse shipment = shippo.shipments().create()
				.shippoApiVersion("2018-02-08")
				.shipmentCreateRequest(ShipmentCreateRequest.builder()
						.addressFrom(AddressFrom.of(AddressCreateRequest.builder()
								.name(from.getStore())
								.street1(from.getStreet1())
								.city(from.getCity())
								.state(from.getState())
								.zip(from.getZip())
								.country(from.getCountry())
								.build()))
						.addressTo(AddressTo.of(AddressCreateRequest.builder()
								.name(to.getName())
								.street1(to.getStreet1())
								.city(to.getCity())
								.state(to.getState())
								.zip(to.getZip())
								.country(to.getCountry())
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
						.build())
				.call();

		var shipmentObj = shipment.shipment().get();
		String shipmentId = shipmentObj.objectId();
		log.info("Shipment created: {}", shipmentId);

		return shippo.rates().listShipmentRates()
				.shipmentId(shipmentId)
				.page(1L)
				.results(25L)
				.shippoApiVersion("2018-02-08")
				.call();
	}
}

