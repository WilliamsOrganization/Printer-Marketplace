package com.ecommerce.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.service.StripeCatalogService;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * This is the controller for stripe checkout events. 
 * to initialize this endpoitn you need stripe-cli installed and listening to your local server. 
 * docs: https://stripe.com/docs/webhooks/signatures
 *
 * stripe login
 * 
 * stripe listen --forward-to localhost:8080/stripe/webhook
 * 
 * @author William Ewanchuk https://github.com/ewanchukwilliam
 */
@Slf4j
@RestController
@RequestMapping("/stripe")
@RequiredArgsConstructor
public class StripeController {
	private final StripeCatalogService stripeCatalogService;

	@Value("${stripe.webhook.secret}")
	private String webhookSecret;

	/**
	 * This is the webhook endpoint for stripe checkout events. 
	 * to initialize this endpoitn you need stripe-cli installed and listening to your local server. 
	 *
	 * stripe listen --forward-to localhost:8080/stripe/webhook
	 * 
	 * @author William Ewanchuk https://github.com/ewanchukwilliam
	 */
	@PostMapping("/webhook")
	public ResponseEntity<Void> webhook(@RequestBody String payload,
			@RequestHeader("Stripe-Signature") String sigHeader)
			throws SignatureVerificationException {
		Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
		// Stripe forwards every event type for a transaction (payment_intent.*,
		// charge.*, checkout.session.*, ...), not just the ones we act on - only
		// checkout.session.* events actually carry a Session, so deserializing
		// must happen inside those cases, not unconditionally up front.
		try {
			switch (event.getType()) {
			case "checkout.session.completed":
				stripeCatalogService.handleCompletedCheckoutEvent(deserializeSession(event));
				break;
			case "checkout.session.expired":
				stripeCatalogService.handleExpiredCheckoutEvent(deserializeSession(event));
				break;
			case "checkout.session.async_payment_failed":
				stripeCatalogService.handleFailedCheckoutEvent(deserializeSession(event));
				break;
			default:
				log.debug("Ignoring event type: {}", event.getType());
				break;
			}
		} catch (EventDataObjectDeserializationException e) {
			log.error("Failed to deserialize event {} ({}) data object: {}",
				event.getId(), event.getType(), e.getMessage());
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok().build();
	}

	/**
	 * getObject() can come back empty when the webhook's api_version doesn't
	 * match the one stripe-java is pinned to (e.g. a sandbox account on a
	 * newer API version) - deserializeUnsafe() ignores that mismatch and
	 * deserializes the payload regardless.
	 */
	private Session deserializeSession(Event event) throws EventDataObjectDeserializationException {
		return (Session) event.getDataObjectDeserializer().deserializeUnsafe();
	}
}
