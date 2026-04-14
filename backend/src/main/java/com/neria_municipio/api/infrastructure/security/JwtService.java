package com.neria_municipio.api.infrastructure.security;

import com.neria_municipio.api.application.port.in.AuthToken;
import com.neria_municipio.api.application.port.out.AuthTokenPort;
import com.neria_municipio.api.domain.model.User;
import com.neria_municipio.api.domain.model.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtService implements AuthTokenPort {
    private static final String CLAIM_USER_ID = "uid";
    private static final String CLAIM_MUNICIPALITY_ID = "mid";
    private static final String CLAIM_ROLE = "role";

    private final Key signingKey;
    private final long expirationMinutes;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-minutes:480}") long expirationMinutes
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    @Override
    public AuthToken issueToken(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User is required");
        }
        return issueToken(user.id(), user.municipalityId(), user.email(), user.role());
    }

    public AuthToken issueToken(Long userId, Long municipalityId, String email, UserRole role) {
        if (userId == null || municipalityId == null || email == null || role == null) {
            throw new IllegalArgumentException("Invalid user data for token issuance");
        }
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        String token = Jwts.builder()
                .setSubject(email)
                .claim(CLAIM_USER_ID, userId)
                .claim(CLAIM_MUNICIPALITY_ID, municipalityId)
                .claim(CLAIM_ROLE, role.name())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiresAt))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();

        return new AuthToken(token, expiresAt);
    }

    public JwtPrincipal parseToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Long userId = claims.get(CLAIM_USER_ID, Number.class).longValue();
        Long municipalityId = claims.get(CLAIM_MUNICIPALITY_ID, Number.class).longValue();
        String email = claims.getSubject();
        String roleValue = claims.get(CLAIM_ROLE, String.class);

        return new JwtPrincipal(userId, municipalityId, email, UserRole.valueOf(roleValue));
    }
}
