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
 * SessionAuthFilter resolves every request's session up front - creating a
 * new (userless) session if the request carried no valid token - so
 * downstream code always has a session to work with, and the client always
 * learns which token to use via the X-Session-Token response header
 * (whether it's the one it sent, or a freshly-issued one). A user is only
 * attached to a session lazily, by whatever code path first needs one - see
 * UserService.getUserFromSession / AuthService.attachNewUserToSession.
 */
@Component
@RequiredArgsConstructor
public class SessionAuthFilter extends OncePerRequestFilter {

	private final AuthService authService;

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain)
			throws ServletException, IOException {
		String token = getTokenFromRequest(request);
		Sessions session = authService.resolveOrCreateSession(token);
		SecurityContextHolder.getContext()
				.setAuthentication(authService.buildAuthentication(session));
		response.setHeader("X-Session-Token", session.getToken());
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
