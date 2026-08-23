package com.ecommerce.backend.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.service.AuthService;

import lombok.RequiredArgsConstructor;

/**
 * Authenticates the STOMP CONNECT frame for /chat.
 *
 * Why this exists instead of reusing SessionAuthFilter: the browser's
 * native WebSocket API has no way to attach a custom Authorization HTTP
 * header to the handshake request itself (this is a browser platform
 * limitation, not something fixable on our end). So SessionAuthFilter -
 * which only ever sees the HTTP layer - can never see a token for this
 * endpoint, no matter how the frontend sends it. SessionAuthFilter
 * explicitly skips /chat/** for this reason (see its shouldNotFilter).
 *
 * The token travels one layer up instead, inside the STOMP protocol's own
 * CONNECT frame (an application-level frame sent over the WebSocket after
 * the HTTP handshake already completed) - that's what @stomp/stompjs's
 * `connectHeaders: { Authorization: ... }` on the frontend Client actually
 * sends. This interceptor is the only place in the backend that can read
 * that value, since STOMP frame parsing happens in Spring's messaging
 * subsystem, after and separate from the servlet filter chain.
 *
 * WebSocketConfig wires this in via configureClientInboundChannel. The
 * WebSocket endpoint's origin is intentionally left open (see
 * WebSocketConfig.registerStompEndpoints) - this interceptor is what
 * actually gates who can act as an authenticated user on the connection,
 * not the origin check.
 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {
    private static final int BEARER_PREFIX_LENGTH = 7;

    private final AuthService authService;

    /**
     * Runs for every outbound STOMP frame on this channel, but we only care
     * about CONNECT - it's the one frame that opens a session and needs
     * authenticating. If resolveSession throws (missing/invalid token),
     * that exception propagates out of preSend and Spring aborts the
     * connection - the client sees the socket close, not a graceful STOMP
     * ERROR frame. That's acceptable here since a legitimate client always
     * has a token by the time it opens this dialog (see the frontend's
     * getSession() call before connecting).
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = getTokenFromStompHeaders(accessor);
            Sessions session = authService.resolveSession(token);
            // setUser attaches the Authentication to this STOMP session so
            // later frames (SEND, SUBSCRIBE, ...) on the same connection
            // carry a resolvable Principal without re-authenticating each
            // one - mirrors what SessionAuthFilter does per-HTTP-request.
            accessor.setUser(authService.buildAuthentication(session));
        }
        return message;
    }

    private String getTokenFromStompHeaders(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(BEARER_PREFIX_LENGTH);
        }
        return null;
    }
}
