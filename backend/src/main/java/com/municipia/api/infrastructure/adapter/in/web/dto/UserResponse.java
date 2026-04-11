package com.municipia.api.infrastructure.adapter.in.web.dto;

import com.municipia.api.domain.model.UserRole;

public record UserResponse(Long id, Long municipalityId, String email, UserRole role) {
}
