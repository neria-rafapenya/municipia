package com.neria_municipio.api.domain.model;

public record User(
        Long id,
        Long municipalityId,
        String fullName,
        String email,
        String avatarUrl,
        String passwordHash,
        UserRole role
) {
}
