package com.ecommerce.backend.service;

import com.ecommerce.backend.config.ResendConfig;
import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Orders;
import com.ecommerce.backend.entity.Shipping;
import com.ecommerce.backend.entity.Users;
import com.resend.*;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

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
				+ "<a href=\"" + STORE_URL + "/success?session_id=" + order.getStripeSessionId() + "\" style=\"font-family:Arial,sans-serif;display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;padding:10px 24px;border-radius:6px;\">View Order</a>"
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
	 * @param shipping the shipment, with its tracking info populated
	 */
	public void sendTrackingInformation(@NonNull Users user, Shipping shipping) {
		CreateEmailOptions params = CreateEmailOptions.builder()
				.from(from)
				.to(user.getEmail())
				.subject("Your order has shipped")
				.html(buildTrackingHtml(shipping))
				.build();

		try {
			CreateEmailResponse data = resend.emails().send(params);
			log.info("Tracking email sent successfully to {} with id {}", user.getEmail(), data.getId());
		} catch (ResendException e) {
			log.error("Failed to send tracking email to {}: {}", user.getEmail(), e.getMessage());
		}
	}

	private String buildTrackingHtml(Shipping shipping) {
		String trackingNumber = shipping.getTrackingNumber() != null ? shipping.getTrackingNumber() : "N/A";
		String trackingUrl = shipping.getTrackingUrl();

		return "<div style=\"font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;color:#111;\">"
				+ "<p style=\"text-transform:uppercase;letter-spacing:2px;font-size:11px;color:#888;text-align:center;margin-bottom:8px;\">Order shipped</p>"
				+ "<h1 style=\"font-size:26px;font-weight:normal;text-align:center;margin:0 0 12px;\">Your order is on its way.</h1>"
				+ "<p style=\"font-family:Arial,sans-serif;font-size:14px;color:#555;text-align:center;line-height:1.6;margin:0 0 24px;\">"
				+ "Tracking number <strong style=\"color:#111;\">" + trackingNumber + "</strong></p>"
				+ "<div style=\"text-align:center;margin-top:8px;\">"
				+ (trackingUrl != null
						? "<a href=\"" + trackingUrl + "\" style=\"font-family:Arial,sans-serif;display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:13px;padding:10px 24px;border-radius:6px;\">Track Package</a>"
						: "")
				+ "</div>"
				+ "</div>";
	}
}
