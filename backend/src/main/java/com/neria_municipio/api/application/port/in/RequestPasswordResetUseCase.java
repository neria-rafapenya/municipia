package com.neria_municipio.api.application.port.in;

import java.time.Instant;

public interface RequestPasswordResetUseCase {
    record ResetToken(String token, Instant expiresAt) {
    }

    ResetToken request(RequestPasswordResetCommand command);
}
