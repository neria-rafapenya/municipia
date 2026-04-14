package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.ChangePasswordCommand;
import com.neria_municipio.api.application.port.in.ChangePasswordUseCase;
import com.neria_municipio.api.application.port.out.UserPort;
import com.neria_municipio.api.domain.model.User;
import java.util.Objects;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ChangePasswordService implements ChangePasswordUseCase {
    private final UserPort userPort;
    private final PasswordEncoder passwordEncoder;

    public ChangePasswordService(UserPort userPort, PasswordEncoder passwordEncoder) {
        this.userPort = userPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void changePassword(ChangePasswordCommand command) {
        User user = userPort.findById(command.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.municipalityId().equals(command.municipalityId())) {
            throw new IllegalArgumentException("Municipality mismatch");
        }

        String storedHash = user.passwordHash();
        boolean matches;
        if (storedHash != null && storedHash.startsWith("$2")) {
            matches = passwordEncoder.matches(command.currentPassword(), storedHash);
        } else {
            matches = Objects.equals(command.currentPassword(), storedHash);
        }

        if (!matches) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String newHash = passwordEncoder.encode(command.newPassword());
        User updated = new User(
                user.id(),
                user.municipalityId(),
                user.fullName(),
                user.email(),
                user.avatarUrl(),
                newHash,
                user.role()
        );
        userPort.save(updated);
    }
}
