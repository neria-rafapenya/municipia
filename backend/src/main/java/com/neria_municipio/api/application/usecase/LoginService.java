package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.AuthToken;
import com.neria_municipio.api.application.port.in.LoginCommand;
import com.neria_municipio.api.application.port.in.LoginUseCase;
import com.neria_municipio.api.application.port.out.AuthTokenPort;
import com.neria_municipio.api.application.port.out.UserPort;
import com.neria_municipio.api.domain.model.User;
import java.util.Objects;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService implements LoginUseCase {
    private final UserPort userPort;
    private final AuthTokenPort authTokenPort;
    private final PasswordEncoder passwordEncoder;

    public LoginService(UserPort userPort, AuthTokenPort authTokenPort, PasswordEncoder passwordEncoder) {
        this.userPort = userPort;
        this.authTokenPort = authTokenPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthToken login(LoginCommand command) {
        User user = userPort.findByEmail(command.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        String storedHash = user.passwordHash();
        boolean matches;
        if (storedHash != null && storedHash.startsWith("$2")) {
            matches = passwordEncoder.matches(command.password(), storedHash);
        } else {
            matches = Objects.equals(command.password(), storedHash);
            if (matches) {
                String upgradedHash = passwordEncoder.encode(command.password());
                User upgraded = new User(
                        user.id(),
                        user.municipalityId(),
                        user.fullName(),
                        user.email(),
                        user.avatarUrl(),
                        upgradedHash,
                        user.role()
                );
                userPort.save(upgraded);
            }
        }

        if (!matches) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return authTokenPort.issueToken(user);
    }
}
