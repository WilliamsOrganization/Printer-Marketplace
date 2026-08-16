package com.ecommerce.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ShipmentFromValues;
import com.ecommerce.backend.dto.ShipmentToValues;
import com.ecommerce.backend.entity.ShippingParcel;
import com.goshippo.shippo_sdk.Shipments;
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
import com.goshippo.shippo_sdk.models.components.Rate;
import com.goshippo.shippo_sdk.models.components.Shipment;
import com.goshippo.shippo_sdk.models.components.ShipmentCreateRequest;
import com.goshippo.shippo_sdk.models.components.ShipmentCreateRequestCustomsDeclaration;
import com.goshippo.shippo_sdk.models.components.WeightUnitEnum;
import com.goshippo.shippo_sdk.models.operations.CreateLiveRateResponse;
import com.goshippo.shippo_sdk.models.operations.CreateShipmentResponse;
import com.goshippo.shippo_sdk.models.operations.GetRateResponse;
import com.goshippo.shippo_sdk.models.operations.GetShipmentResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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

	/**
	 * Unimplemented stub for emailing a shipping label.
	 */
	public void testShippoLabel(String toEmail, String body) {
	}

	/**
	 * Builds the Shippo shipment creation request: origin/destination
	 * addresses, the given estimated parcel, and a hardcoded customs
	 * declaration.
	 *
	 * @param from   the origin address
	 * @param to     the destination address
	 * @param parcel the parcel size/weight to quote rates for (see
	 *               ShippingService.estimateParcel)
	 * @return the assembled shipment creation request
	 */
	private ShipmentCreateRequest buildShipmentRequest(ShipmentFromValues from, ShipmentToValues to, ShippingParcel parcel) {
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
								.weight(String.valueOf(parcel.getWeight()))
								.massUnit(parcel.getWeightUnit())
								.length(String.valueOf(parcel.getLength()))
								.width(String.valueOf(parcel.getWidth()))
								.height(String.valueOf(parcel.getHeight()))
								.distanceUnit(parcel.getDistanceUnit())
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


	/**
	 * Creates a Shippo shipment for the given addresses/parcel and returns
	 * its carrier rates.
	 *
	 * @param from   the origin address
	 * @param to     the destination address
	 * @param parcel the parcel size/weight to quote rates for
	 * @return the rates attached to the newly created shipment
	 */
	private List<Rate> createShipmentAndGetRates(ShipmentFromValues from, ShipmentToValues to, ShippingParcel parcel) throws Exception {
		CreateShipmentResponse shipment = shippo.shipments()
				.create()
				.shippoApiVersion("2018-02-08")
				.shipmentCreateRequest(buildShipmentRequest(from, to, parcel))
				.call();

		Shipment shipmentObj = shipment.shipment().get();
		log.info("Shipment created: {}", shipmentObj.objectId());
		log.info("Shipment status: {}", shipmentObj.status());
		log.info("Shipment rates count: {}", shipmentObj.rates().size());
		return shipmentObj.rates();
	}

	/**
	 * Creates a shipment and returns its rates, retrying once if the first
	 * attempt comes back empty (see KNOWN BUG above).
	 *
	 * @param from   the origin address
	 * @param to     the destination address
	 * @param parcel the parcel size/weight to quote rates for (see
	 *               ShippingService.estimateParcel)
	 * @return the shipment's carrier rates
	 */
	public List<Rate> getShipmentRates(ShipmentFromValues from, ShipmentToValues to, ShippingParcel parcel) throws Exception {
		List<Rate> rates = createShipmentAndGetRates(from, to, parcel);
		// TODO: this is fucking cursed.
		if (rates.isEmpty()) {
			log.info("Retrying shipment creation for rates...");
			rates = createShipmentAndGetRates(from, to, parcel);
		}
		return rates;
	}

	/**
	 * Fetches a single previously-quoted Shippo rate by its id, so its price
	 * can be re-read at checkout time.
	 *
	 * @param selectedRateId the Shippo rate object id the user selected
	 * @return the rate response
	 * @author William Ewanchuk https://www.github.com/ewanchukwilliam
	 */
	public GetRateResponse getShipmentRateById(String selectedRateId) throws Exception {
			return shippo.rates().get(selectedRateId);
	}

	/**
	 * Fetches the parent shipment for a previously-selected rate, by
	 * following the rate's shipment id. Exposes both addressFrom() and
	 * addressTo(), letting the backend read the shipping addresses Shippo
	 * already has on file instead of trusting whatever the client sends at
	 * checkout time.
	 *
	 * @param rate the rate the customer selected
	 * @return the rate's parent shipment
	 */
	public Shipment getShipmentForRate(Rate rate) throws Exception {
		GetShipmentResponse response = shippo.shipments().get(rate.shipment());
		return response.shipment().get();
	}

}
