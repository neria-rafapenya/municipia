package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.UserRole;

public record RegisterUserCommand(
        Long municipalityId,
        String fullName,
        String email,
        String password,
        UserRole role
) {
}
