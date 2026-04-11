package com.municipia.api.application.port.in;

import java.time.Instant;

public record AuthToken(String accessToken, Instant expiresAt) {
}
