package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import java.time.Instant;

public record TokenResponse(String accessToken, String tokenType, Instant expiresAt) {
    public static TokenResponse of(String accessToken, Instant expiresAt) {
        return new TokenResponse(accessToken, "Bearer", expiresAt);
    }
}
