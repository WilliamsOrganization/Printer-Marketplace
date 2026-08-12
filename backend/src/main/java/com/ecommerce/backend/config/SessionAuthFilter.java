package com.ecommerce.backend.config;

import com.ecommerce.backend.entity.Sessions;
import com.ecommerce.backend.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * SessionAuthFilter resolves every request's session up front. Only the
 * bootstrap endpoint (/server/session/whoami) is allowed to create a brand
 * new session when no valid token is present - every other route either
 * resolves an existing token or proceeds with no Authentication set
 * (anonymous), so a stray request never mints a throwaway session. A user is
 * only attached to a session lazily, by whatever code path first needs one -
 * see UserService.getUserFromSession / AuthService.attachNewUserToSession.
 */
@Component
@RequiredArgsConstructor
public class SessionAuthFilter extends OncePerRequestFilter {

	private static final String BOOTSTRAP_PATH = "/server/session/whoami";

	private final AuthService authService;

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain)
			throws ServletException, IOException {
		String token = getTokenFromRequest(request);
		boolean isBootstrap = BOOTSTRAP_PATH.equals(request.getRequestURI());
		// BUG: fix this garbage. something is creating duplicate sessions for the application. should only be allowed from a single location shouldnt be creating accounts at all.
		// remove the ability to create sessions altogether from the doFilterInternal. this is bad. should just be altogether removed and only be set with a single tanstack query request.
		Sessions session = authService.resolveOrCreateSession(token, isBootstrap);
		if (session != null) {
			SecurityContextHolder.getContext()
					.setAuthentication(authService.buildAuthentication(session));
			response.setHeader("X-Session-Token", session.getToken());
		}
		filterChain.doFilter(request, response);
	}

	private String getTokenFromRequest(HttpServletRequest request){
		String authHeader = request.getHeader("Authorization");
		if (authHeader != null && authHeader.startsWith("Bearer ")){
			return authHeader.substring(7);
		}
		return null;
	}
}
