package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.RequestPasswordResetCommand;
import com.municipia.api.application.port.in.RequestPasswordResetUseCase;
import com.municipia.api.application.port.in.ResetPasswordCommand;
import com.municipia.api.application.port.in.ResetPasswordUseCase;
import com.municipia.api.application.port.out.PasswordResetPort;
import com.municipia.api.application.port.out.UserPort;
import com.municipia.api.domain.model.User;
import com.municipia.api.domain.service.PasswordPolicy;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetService implements RequestPasswordResetUseCase, ResetPasswordUseCase {
    private static final int TOKEN_BYTES = 32;

    private final UserPort userPort;
    private final PasswordResetPort passwordResetPort;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(UserPort userPort, PasswordResetPort passwordResetPort, PasswordEncoder passwordEncoder) {
        this.userPort = userPort;
        this.passwordResetPort = passwordResetPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public ResetToken request(RequestPasswordResetCommand command) {
        User user = userPort.findByEmail(command.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = generateToken();
        Instant expiresAt = Instant.now().plus(30, ChronoUnit.MINUTES);
        passwordResetPort.create(user.id(), token, expiresAt);

        // TODO (4.3): send notification email/SMS with the token
        return new ResetToken(token, expiresAt);
    }

    @Override
    public void reset(ResetPasswordCommand command) {
        PasswordPolicy.validate(command.newPassword());

        PasswordResetPort.PasswordResetRecord record = passwordResetPort.findByToken(command.token())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (record.usedAt() != null) {
            throw new IllegalArgumentException("Reset token already used");
        }
        if (record.expiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Reset token expired");
        }

        User user = userPort.findById(record.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String hash = passwordEncoder.encode(command.newPassword());
        userPort.save(new User(user.id(), user.municipalityId(), user.email(), hash, user.role()));

        passwordResetPort.markUsed(record.id(), Instant.now());
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
