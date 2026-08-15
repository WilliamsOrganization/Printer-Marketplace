package com.ecommerce.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.service.StripeCatalogService;
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
		Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
		switch (event.getType()) {
		case "checkout.session.completed":
			stripeCatalogService.handleCompletedCheckoutEvent(session);
			break;
		case "checkout.session.expired":
			stripeCatalogService.handleExpiredCheckoutEvent(session);
			break;
		case "checkout.session.async_payment_failed":
			stripeCatalogService.handleFailedCheckoutEvent(session);
			break;
		default:
			log.error("Unhandled event type: {}", event.getType());
			break;
		}
		return ResponseEntity.ok().build();
	}
}
