package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.RegisterUserCommand;
import com.municipia.api.application.port.in.RegisterUserUseCase;
import com.municipia.api.application.port.out.MunicipalityPort;
import com.municipia.api.application.port.out.UserPort;
import com.municipia.api.domain.model.Municipality;
import com.municipia.api.domain.model.User;
import com.municipia.api.domain.service.PasswordPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterUserService implements RegisterUserUseCase {
    private final MunicipalityPort municipalityPort;
    private final UserPort userPort;
    private final PasswordEncoder passwordEncoder;

    public RegisterUserService(
            MunicipalityPort municipalityPort,
            UserPort userPort,
            PasswordEncoder passwordEncoder
    ) {
        this.municipalityPort = municipalityPort;
        this.userPort = userPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Long registerUser(RegisterUserCommand command) {
        Municipality municipality = municipalityPort.findById(command.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));

        PasswordPolicy.validate(command.password());
        String passwordHash = passwordEncoder.encode(command.password());
        User user = new User(
                null,
                municipality.id(),
                command.email(),
                passwordHash,
                command.role()
        );

        User saved = userPort.save(user);
        return saved.id();
    }
}
