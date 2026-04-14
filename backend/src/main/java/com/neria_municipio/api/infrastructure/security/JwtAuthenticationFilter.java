package com.neria_municipio.api.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = null;
        boolean usedQueryToken = false;
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }
        if (token == null || token.isBlank()) {
            String fallback = request.getParameter("access_token");
            if (fallback == null || fallback.isBlank()) {
                fallback = extractTokenFromQuery(request.getQueryString());
            }
            if (fallback != null && !fallback.isBlank()) {
                token = fallback;
                usedQueryToken = true;
            }
        }

        if (token != null && !token.isBlank()) {
            try {
                JwtPrincipal principal = jwtService.parseToken(token);
                String role = "ROLE_" + principal.role().name();
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, List.of(new SimpleGrantedAuthority(role)));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ex) {
                SecurityContextHolder.clearContext();
                if (logger.isDebugEnabled()) {
                    logger.debug(
                            "JWT parse failed: reason={}, path={}, hasAuthHeader={}, usedQueryToken={}, tokenLen={}",
                            ex.getClass().getSimpleName(),
                            request.getRequestURI(),
                            header != null,
                            usedQueryToken,
                            token.length()
                    );
                }
            }
        } else if (logger.isDebugEnabled()) {
            logger.debug(
                    "JWT missing: path={}, hasAuthHeader={}, usedQueryToken={}",
                    request.getRequestURI(),
                    header != null,
                    usedQueryToken
            );
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf('=');
            if (idx <= 0) continue;
            String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
            if (!"access_token".equals(key)) continue;
            String value = pair.substring(idx + 1);
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        }
        return null;
    }
}
