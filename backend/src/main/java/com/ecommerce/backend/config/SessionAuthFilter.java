package com.ecommerce.backend.config;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.exception.UserNotFoundException;
import com.ecommerce.backend.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

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
			// single path
            return true;
        }
		// multiple paths
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
            return authHeader.substring(7);
        }
        return null;
    }
}
