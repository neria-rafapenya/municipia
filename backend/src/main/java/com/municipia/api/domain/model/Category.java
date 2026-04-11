package com.municipia.api.domain.model;

public record Category(Long id, Long municipalityId, String name, String description, boolean active) {
}
