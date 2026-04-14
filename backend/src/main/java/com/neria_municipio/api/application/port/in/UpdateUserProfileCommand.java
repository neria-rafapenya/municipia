package com.neria_municipio.api.application.port.in;

public record UpdateUserProfileCommand(
        Long userId,
        Long municipalityId,
        String fullName,
        String email,
        String avatarUrl
) {
}
