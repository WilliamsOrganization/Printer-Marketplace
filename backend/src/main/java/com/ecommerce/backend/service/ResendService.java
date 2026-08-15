package com.ecommerce.backend.service;

import com.ecommerce.backend.config.ResendConfig;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Users;
import com.resend.*;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Resend
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class ResendService {
	private final Resend resend;
	@Value("${resend.email_from}")
	private String from;

	// TODO: DELETE ME FOR LATER
	public void testEmailEndpoint(String toEmail, String body) {
		CreateEmailOptions params = CreateEmailOptions.builder()
				.from("Support@printmarket.ca")
				.to(toEmail)
				.subject("it works!")
				.html("<strong>" + body + "</strong>")
				.build();

		try {
			CreateEmailResponse data = resend.emails().send(params);
			log.info("Email sent successfully to {} with id {}", toEmail, data.getId());
		} catch (ResendException e) {
			log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
		}
	}

	/**
	 * Sends an order confirmation email to the user.
	 *
	 * @param user the user to send the email to
	 * @param order the order to send the email for
	 */
	public void sendConfirmationEmail(Users user, Orders order){
		CreateEmailOptions params = CreateEmailOptions.builder()
				.from(from)
				.to(user.getEmail())
				.subject("Order Confirmation")
				.html("<strong>Your order has been placed!</strong>")
				.build();

		try {
			CreateEmailResponse data = resend.emails().send(params);
			log.info("Email sent successfully to {} with id {}", user.getEmail(), data.getId());
		} catch (ResendException e) {
			log.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
		}
		
	}
}
