package com.neria_municipio.api.application.port.out;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetPort {
    record PasswordResetRecord(Long id, Long userId, String token, Instant expiresAt, Instant usedAt) {
    }

    PasswordResetRecord create(Long userId, String token, Instant expiresAt);
    Optional<PasswordResetRecord> findByToken(String token);
    PasswordResetRecord markUsed(Long id, Instant usedAt);
}
