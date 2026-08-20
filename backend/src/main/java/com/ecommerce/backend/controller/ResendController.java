package com.ecommerce.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.service.ResendService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ResendController
 */

@Slf4j
@RestController
@RequestMapping("/server/email")
@RequiredArgsConstructor
public class ResendController {
	private final ResendService resendService;

	/**
	 * Handles webhooks from Resend.com. 
	 *
	 * @param content the webhook content
	 */
	@PostMapping("/webhook")
	public void webookHandler(@RequestBody String content) {
		resendService.handleWebhook(content);
	}
}
