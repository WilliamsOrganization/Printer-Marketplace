package com.ecommerce.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.RequiredArgsConstructor;

/**
 * WebSocketConfig wires up the /chat STOMP endpoint used by the
 * customer-support chat feature (see ChatController and
 * ChatWithUserDialog.tsx on the frontend).
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	private final StompAuthChannelInterceptor stompAuthChannelInterceptor;

	/**
	 * Registers the STOMP CONNECT-frame authenticator. This is where
	 * per-connection auth actually happens for /chat - see
	 * StompAuthChannelInterceptor's class doc for why it can't be done in
	 * the usual HTTP-level SessionAuthFilter instead.
	 * @param registration
	 */
	@Override
	public void configureClientInboundChannel(ChannelRegistration registration) {
		registration.interceptors(stompAuthChannelInterceptor);
	}

	/**
	 * Configures the message broker.
	 *
	 * enableSimpleBroker's prefix must match what @SendTo/subscribe
	 * destinations actually use - ChatController broadcasts to
	 * "/topic/chat" and the frontend subscribes to the same, so this has
	 * to be "/topic", not "/ws" (which nothing else in the app
	 * references). Spring's simple broker only relays messages whose
	 * destination starts with one of these registered prefixes; anything
	 * else is silently never delivered to subscribers, even though the
	 * @MessageMapping handler itself still runs fine.
	 * @param config
	 */
	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		config.enableSimpleBroker("/topic");
		config.setApplicationDestinationPrefixes("/server");
	}

	/**
	 * Registers the STOMP endpoint.
	 *
	 * setAllowedOriginPatterns("*") is intentional, not a leftover from
	 * debugging: this chat is meant to be reachable by any visitor (public
	 * support chat), so origin is deliberately left unrestricted. That does
	 * NOT mean the endpoint is unauthenticated - StompAuthChannelInterceptor
	 * still requires a valid session token on every CONNECT frame regardless
	 * of origin. Origin controls who can *attempt* to open the socket;
	 * the interceptor controls who can actually act as an authenticated
	 * user on it. Without this wildcard, Spring rejects the handshake with
	 * a 403 for any page origin other than this server's own - which is
	 * what happens by default and is easy to hit as soon as the frontend is
	 * served from anything other than the exact same host:port (e.g. a
	 * different dev port, a forwarded/proxied dev URL, or prod behind a
	 * CDN/different domain).
	 * @param registry
	 */
	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/chat").setAllowedOriginPatterns("*").withSockJS();
	}
}
