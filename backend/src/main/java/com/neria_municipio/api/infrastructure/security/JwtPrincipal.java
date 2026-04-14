package com.neria_municipio.api.infrastructure.security;

import com.neria_municipio.api.domain.model.UserRole;

public record JwtPrincipal(Long userId, Long municipalityId, String email, UserRole role) {
}
