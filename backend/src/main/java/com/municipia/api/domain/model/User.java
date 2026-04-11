package com.municipia.api.domain.model;

public record User(Long id, Long municipalityId, String email, String passwordHash, UserRole role) {
}
