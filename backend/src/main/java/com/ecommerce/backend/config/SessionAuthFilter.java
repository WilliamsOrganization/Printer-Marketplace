package com.ecommerce.backend.config;

import java.io.IOException;
import java.util.Set;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpMethod;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.exception.UserNotFoundException;
import com.ecommerce.backend.service.AuthService;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * SessionAuthFilter resolves every request's session up front, requiring a
 * valid token to already be present. Two kinds of routes are exempt and
 * bypass this filter entirely (see shouldNotFilter):
 *
 * 1. The bootstrap endpoint (/server/session), the single ingress point
 *    allowed to mint a brand new session - it handles the no-token case
 *    itself.
 * 2. Public GET routes that have no @PreAuthorize of their own (e.g. the
 *    catalog listing) - these can legitimately be hit with no session at
 *    all, such as a server-rendered page's first request on a cold visit,
 *    before the client has had a chance to bootstrap one.
 * 3. The Stripe webhook (/stripe/webhook) - Stripe calls this directly, with
 *    no session token at all. It authenticates via the Stripe-Signature
 *    header instead (see StripeController), verified independently of this
 *    filter.
 * 4. The STOMP/WebSocket endpoint (/chat/**) - the browser's native
 *    WebSocket API can't attach an Authorization header to the handshake
 *    request itself, so this filter has nothing to check there. Auth for
 *    this endpoint happens one layer up, on the STOMP CONNECT frame - see
 *    StompAuthChannelInterceptor.
 *
 * Every other route is expected to already carry a token from the bootstrap
 * call; a missing or invalid one there is treated as a hard failure, not
 * silently downgraded to anonymous. A user is only attached to a session
 * lazily, by whatever code path first needs one - see
 * UserService.getUserFromSession / SessionService.attachNewUserToSession.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionAuthFilter extends OncePerRequestFilter {
    private static final String SESSION_BOOTSTRAP_PATH = "/server/session";
    private static final String STRIPE_WEBHOOK_PATH = "/stripe/webhook";
    private static final String SHIPPING_WEBHOOK_PATH = "/server/shipping/webhook";
    private static final String AUTH_LOGIN_PATH = "/server/auth/login";
    private static final String CHAT_WEBSOCKET_PATH_PREFIX = "/chat";
	private static final int bearerSubstring = 7;

    // GET-only, unauthenticated-friendly routes - no @PreAuthorize guards
    // these on the controller side, so they must not be hard-rejected here
    // for lacking a session either.
    private static final Set<String> PUBLIC_GET_PATHS = Set.of(
        "/server/inventoryitem"
    );

    private final AuthService authService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (SESSION_BOOTSTRAP_PATH.equals(request.getRequestURI())) {
            return true;
        }
        if (STRIPE_WEBHOOK_PATH.equals(request.getRequestURI())) {
            return true;
        }
        if (SHIPPING_WEBHOOK_PATH.equals(request.getRequestURI())) {
            return true;
        }
		if (AUTH_LOGIN_PATH.equals(request.getRequestURI())) {
			return true;
		}
        if (request.getRequestURI().startsWith(CHAT_WEBSOCKET_PATH_PREFIX)) {
            return true;
        }
        return HttpMethod.GET.matches(request.getMethod())
            && PUBLIC_GET_PATHS.contains(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
        throws ServletException, IOException, UserNotFoundException {
        String token = getTokenFromRequest(request);
        Sessions session = authService.resolveSession(token);
        SecurityContextHolder.getContext().setAuthentication(
            authService.buildAuthentication(session));
        response.setHeader("X-Session-Token", session.getToken());
        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(bearerSubstring);
        }
        return null;
    }
}
