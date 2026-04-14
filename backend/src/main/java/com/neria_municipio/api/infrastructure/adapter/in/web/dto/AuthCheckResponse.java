package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

public record AuthCheckResponse(
        Long userId,
        Long municipalityId,
        String email,
        String role
) {
}
