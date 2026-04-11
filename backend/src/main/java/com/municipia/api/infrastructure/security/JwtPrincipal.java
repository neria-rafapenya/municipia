package com.municipia.api.infrastructure.security;

import com.municipia.api.domain.model.UserRole;

public record JwtPrincipal(Long userId, Long municipalityId, String email, UserRole role) {
}
