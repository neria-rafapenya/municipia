package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import com.neria_municipio.api.domain.model.UserRole;

public record UserResponse(
        Long id,
        Long municipalityId,
        String fullName,
        String email,
        String avatarUrl,
        UserRole role
) {
}
