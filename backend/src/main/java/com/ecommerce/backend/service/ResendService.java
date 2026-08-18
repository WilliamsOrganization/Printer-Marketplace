package com.ecommerce.backend.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.entity.EmailVerification;
import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.entity.EmailVerification.Reason;
import com.ecommerce.backend.repository.EmailVerificationRepository;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Resend
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class ResendService {
	// TODO: pull from the same env-configurable base url as
	// StripeCatalogService's SUCCESS_URL/CANCEL_URL once that's made configurable
	private static final String STORE_URL = "http://localhost:3000";
	private static final Long DOLLAR = 100L;
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private final EmailVerificationRepository emailVerificationRepository;
	private final Resend resend;

	@Value("${resend.email_from}")
	private String from;

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
				.html(buildConfirmationHtml(order))
				.build();

		try {
			CreateEmailResponse data = resend.emails().send(params);
			log.info("Email sent successfully to {} with id {}", user.getEmail(), data.getId());
		} catch (ResendException e) {
			log.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
		}
	}

	/**
	 * Builds the order confirmation email body, mirroring the frontend's
	 * order confirmation page: a confirmed-order header, the line items with
	 * thumbnail/quantity/price, and the order total.
	 *
	 * @param order the completed order, with its items loaded
	 * @return the email's HTML body
	 */
	private String buildConfirmationHtml(Orders order) {
		List<OrderItem> items = order.getItems() != null ? order.getItems() : List.of();

		StringBuilder itemRows = new StringBuilder();
		for (OrderItem orderItem : items) {
			String imageUrl = orderItem.getItem() != null
					&& orderItem.getItem().getImageUrls() != null
					&& orderItem.getItem().getImageUrls().length > 0
					? orderItem.getItem().getImageUrls()[0]
					: null;
			long lineTotal = orderItem.getUnitPrice() * orderItem.getQuantity();

			itemRows.append("<tr>")
					.append("<td style=\"padding:12px 0;border-bottom:1px solid #e5e5e5;\" width=\"64\">")
					.append(imageUrl != null
							? "<img src=\"" + imageUrl + "\" width=\"64\" height=\"64\" style=\"border-radius:8px;object-fit:cover;display:block;\" />"
							: "")
					.append("</td>")
					.append("<td style=\"padding:12px 16px;border-bottom:1px solid #e5e5e5;\">")
					.append("<div style=\"font-size:14px;color:#111;\">").append(orderItem.getItemTitle()).append("</div>")
					.append("<div style=\"font-size:12px;color:#888;\">$")
					.append(formatCents(orderItem.getUnitPrice())).append(" each &middot; Qty ")
					.append(orderItem.getQuantity()).append("</div>")
					.append("</td>")
					.append("<td style=\"padding:12px 0;border-bottom:1px solid #e5e5e5;text-align:right;font-size:14px;font-weight:600;color:#111;\">$")
					.append(formatCents(lineTotal))
					.append("</td>")
					.append("</tr>");
		}

		return "<div style=\"font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;color:#111;\">"
				+ "<p style=\"text-transform:uppercase;letter-spacing:2px;font-size:11px;color:#888;text-align:center;margin-bottom:8px;\">Order confirmed</p>"
				+ "<h1 style=\"font-size:26px;font-weight:normal;text-align:center;margin:0 0 12px;\">Thank you for your order.</h1>"
				+ "<p style=\"font-family:Arial,sans-serif;font-size:14px;color:#555;text-align:center;line-height:1.6;margin:0 0 32px;\">"
				+ "Your Order Confirmation number is<strong style=\"color:#111;\">" + order.getId() + "</strong>. We'll begin printing shortly.</p>"
				+ "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"font-family:Arial,sans-serif;border-collapse:collapse;\">"
				+ itemRows
				+ "<tr><td colspan=\"2\" style=\"padding:16px 16px 0 0;text-align:right;font-size:13px;color:#555;\">Subtotal</td>"
				+ "<td style=\"padding:16px 0 0;text-align:right;font-size:13px;color:#555;\">$" + formatCents(order.getSubtotal()) + "</td></tr>"
				+ "<tr><td colspan=\"2\" style=\"padding:4px 16px 0 0;text-align:right;font-size:13px;color:#555;\">Shipping</td>"
				+ "<td style=\"padding:4px 0 0;text-align:right;font-size:13px;color:#555;\">$" + formatCents(order.getShippingCost()) + "</td></tr>"
				+ "<tr><td colspan=\"2\" style=\"padding:8px 16px 0 0;text-align:right;font-size:15px;font-weight:600;color:#111;border-top:1px solid #e5e5e5;\">Total</td>"
				+ "<td style=\"padding:8px 0 0;text-align:right;font-size:15px;font-weight:600;color:#111;border-top:1px solid #e5e5e5;\">$"
				+ formatCents(order.getTotal()) + " <span style=\"font-size:11px;font-weight:normal;color:#888;text-transform:uppercase;\">"
				+ order.getCurrency() + "</span></td></tr>"
				+ "</table>"
				+ "<div style=\"text-align:center;margin-top:32px;\">"
				+ "<a href=\"" + STORE_URL + "/order-status?session_id=" + order.getStripeSessionId() + "\" style=\"font-family:Arial,sans-serif;display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;padding:10px 24px;border-radius:6px;\">View Order</a>"
				+ "&nbsp;&nbsp;"
				+ "<a href=\"" + STORE_URL + "\" style=\"font-family:Arial,sans-serif;display:inline-block;color:#555;text-decoration:none;font-size:13px;padding:10px 24px;\">Continue Shopping</a>"
				+ "</div>"
				+ "</div>";
	}

	private String formatCents(Long cents) {
		if (cents == null) return "0.00";
		return String.format("%.2f", cents / (double) DOLLAR);
	}

	/**
	 * Sends a shipping notification email to the user, once a label's been
	 * purchased and a real tracking number exists.
	 *
	 * @param user the user to send the email to
	 * @param order the order the shipment belongs to, for its order-status page link
	 * @param shipping the shipment, with its tracking info populated
	 */
	public void sendTrackingInformation(@NonNull Users user, Orders order, Shipping shipping) {
		CreateEmailOptions params = CreateEmailOptions.builder()
				.from(from)
				.to(user.getEmail())
				.subject("Your order has shipped")
				.html(buildTrackingHtml(order, shipping))
				.build();

		try {
			CreateEmailResponse data = resend.emails().send(params);
			log.info("Tracking email sent successfully to {} with id {}", user.getEmail(), data.getId());
		} catch (ResendException e) {
			log.error("Failed to send tracking email to {}: {}", user.getEmail(), e.getMessage());
		}
	}

	/**
	 * Builds the shipping notification email body, mirroring the order
	 * confirmation email's look: an uppercase eyebrow header, serif heading,
	 * a destination card, and the same button row (a primary action plus a
	 * secondary link back to the order's status page).
	 *
	 * @param order the order the shipment belongs to
	 * @param shipping the shipment, with its tracking info populated
	 * @return the email's HTML body
	 */
	private String buildTrackingHtml(Orders order, Shipping shipping) {
		String trackingNumber = shipping.getTrackingNumber() != null ? shipping.getTrackingNumber() : "N/A";
		String trackingUrl = shipping.getTrackingUrl();
		String orderUrl = STORE_URL + "/order-status?session_id=" + order.getStripeSessionId();

		String destination = shipping.getAddressTo() != null
				? "<div style=\"border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin:0 0 24px;font-family:Arial,sans-serif;\">"
						+ "<p style=\"text-transform:uppercase;letter-spacing:1px;font-size:10px;color:#888;margin:0 0 6px;\">Shipping to</p>"
						+ "<p style=\"font-size:13px;color:#111;margin:0;line-height:1.5;\">"
						+ shipping.getAddressTo().getStreet1()
						+ (shipping.getAddressTo().getStreet2() != null ? " " + shipping.getAddressTo().getStreet2() : "")
						+ "<br/>" + shipping.getAddressTo().getCity() + ", " + shipping.getAddressTo().getState()
						+ " " + shipping.getAddressTo().getZip()
						+ "</p>"
						+ "</div>"
				: "";

		return "<div style=\"font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;color:#111;\">"
				+ "<p style=\"text-transform:uppercase;letter-spacing:2px;font-size:11px;color:#888;text-align:center;margin-bottom:8px;\">Order shipped</p>"
				+ "<h1 style=\"font-size:26px;font-weight:normal;text-align:center;margin:0 0 12px;\">Your order is on its way.</h1>"
				+ "<p style=\"font-family:Arial,sans-serif;font-size:14px;color:#555;text-align:center;line-height:1.6;margin:0 0 24px;\">"
				+ "Order <strong style=\"color:#111;\">" + order.getId() + "</strong> has shipped. Tracking number "
				+ "<strong style=\"color:#111;\">" + trackingNumber + "</strong>.</p>"
				+ destination
				+ "<div style=\"text-align:center;margin-top:8px;\">"
				+ (trackingUrl != null
						? "<a href=\"" + trackingUrl + "\" style=\"font-family:Arial,sans-serif;display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;padding:10px 24px;border-radius:6px;\">Track Package</a>"
						: "")
				+ "&nbsp;&nbsp;"
				+ "<a href=\"" + orderUrl + "\" style=\"font-family:Arial,sans-serif;display:inline-block;color:#555;text-decoration:none;font-size:13px;padding:10px 24px;\">View Order</a>"
				+ "</div>"
				+ "</div>";
	}

	/**
	 * Sends a welcome/verification email to a newly created account.
	 *
	 * @param user the user to send the email to
	 */
	public void sendEmailVerification(Users user, Reason reason) throws ResendException {
		EmailVerification emailVerification = createEmailVerification(user, reason);
		CreateEmailOptions params = CreateEmailOptions.builder()
				.from(from)
				.to(user.getEmail())
				.subject(reason == Reason.RESET_PASSWORD ? "Reset your password" : "Confirm your email")
				.html(reason == Reason.RESET_PASSWORD
						? buildResetPasswordHtml(user, emailVerification.getCode())
						: buildVerificationHtml(user, emailVerification.getCode()))
				.build();

		try {
			CreateEmailResponse data = resend.emails().send(params);
			log.info("Verification email sent successfully to {} with id {}", user.getEmail(), data.getId());
		} catch (ResendException e) {
			log.error("Failed to send verification email to {}: {}", user.getEmail(), e.getMessage());
			throw e;
		}
	}

	/**
	 * Builds the verification email body, mirroring the confirmation and
	 * tracking emails' look: an uppercase eyebrow header, serif heading, and
	 * the 6-digit code the user types into the /verify-email form.
	 *
	 * @param user the newly created user
	 * @param code the verification code to display
	 * @return the email's HTML body
	 */
	private String buildVerificationHtml(Users user, String code) {
		String verifyUrl = STORE_URL + "/verify-email?email="
				+ URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);

		return "<div style=\"font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;color:#111;\">"
				+ "<p style=\"text-transform:uppercase;letter-spacing:2px;font-size:11px;color:#888;text-align:center;margin-bottom:8px;\">Confirm your email</p>"
				+ "<h1 style=\"font-size:26px;font-weight:normal;text-align:center;margin:0 0 12px;\">Welcome. Let's verify your email.</h1>"
				+ "<p style=\"font-family:Arial,sans-serif;font-size:14px;color:#555;text-align:center;line-height:1.6;margin:0 0 32px;\">"
				+ "Thanks for creating an account with <strong style=\"color:#111;\">" + user.getEmail() + "</strong>. "
				+ "Enter this code to finish setting up your account.</p>"
				+ "<div style=\"text-align:center;margin:0 0 32px;\">"
				+ "<span style=\"display:inline-block;font-family:'Courier New',monospace;font-size:32px;font-weight:600;letter-spacing:8px;color:#111;background:#f5f5f5;border-radius:8px;padding:16px 24px;\">"
				+ code
				+ "</span>"
				+ "</div>"
				+ "<div style=\"text-align:center;margin-top:8px;\">"
				+ "<a href=\"" + verifyUrl + "\" style=\"font-family:Arial,sans-serif;display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;padding:10px 24px;border-radius:6px;\">Confirm Email</a>"
				+ "</div>"
				+ "<p style=\"font-family:Arial,sans-serif;font-size:12px;color:#999;text-align:center;line-height:1.6;margin:24px 0 0;\">"
				+ "If you didn't create this account, you can safely ignore this email.</p>"
				+ "</div>";
	}

	/**
	 * Builds the password-reset email body. Unlike the account-verification
	 * email, the link here carries both the email and the code as query
	 * params - the reset page reads them off the URL rather than making the
	 * user type the code in by hand.
	 *
	 * @param user the user requesting a reset
	 * @param code the verification code to embed in the link
	 * @return the email's HTML body
	 */
	private String buildResetPasswordHtml(Users user, String code) {
		String resetUrl = STORE_URL + "/reset-password?email="
				+ URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8)
				+ "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8);

		return "<div style=\"font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;color:#111;\">"
				+ "<p style=\"text-transform:uppercase;letter-spacing:2px;font-size:11px;color:#888;text-align:center;margin-bottom:8px;\">Reset your password</p>"
				+ "<h1 style=\"font-size:26px;font-weight:normal;text-align:center;margin:0 0 12px;\">Let's get you back in.</h1>"
				+ "<p style=\"font-family:Arial,sans-serif;font-size:14px;color:#555;text-align:center;line-height:1.6;margin:0 0 32px;\">"
				+ "We got a request to reset the password for <strong style=\"color:#111;\">" + user.getEmail() + "</strong>. "
				+ "Click below to choose a new one.</p>"
				+ "<div style=\"text-align:center;margin-top:8px;\">"
				+ "<a href=\"" + resetUrl + "\" style=\"font-family:Arial,sans-serif;display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;padding:10px 24px;border-radius:6px;\">Reset Password</a>"
				+ "</div>"
				+ "<p style=\"font-family:Arial,sans-serif;font-size:12px;color:#999;text-align:center;line-height:1.6;margin:24px 0 0;\">"
				+ "If you didn't request this, you can safely ignore this email.</p>"
				+ "</div>";
	}

	private EmailVerification createEmailVerification(Users user, Reason reason) {
		EmailVerification emailVerification = EmailVerification.builder()
		.user(user)
		.email(user.getEmail())
		.code(generateVerificationCode())
		.reason(reason)
		.expiryDate(LocalDateTime.now().plusDays(1))
		.build();
		return emailVerificationRepository.save(emailVerification);
	}

	/**
	 * Generates a 6-digit numeric verification code, zero-padded (e.g. "003942").
	 *
	 * @return the generated code
	 */
	private String generateVerificationCode() {
		int value = SECURE_RANDOM.nextInt(1_000_000);
		return String.format("%06d", value);
	}

	/** 
	 * This will be used to handle webhooks from Resend.
	 * - there will be a handler for correspondance for returns
	 * - there will be a help/information handler
	 * - emails will be sorted by domain scoping. 
	 *   @author: William Ewanchuk
	 */
	public void handleWebhook(String content) {
		// TODO: implement this
		throw new UnsupportedOperationException("Unimplemented method 'handleWebhook'");
	}

}
