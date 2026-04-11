package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.UserRole;

public record RegisterUserCommand(
        Long municipalityId,
        String email,
        String password,
        UserRole role
) {
}
