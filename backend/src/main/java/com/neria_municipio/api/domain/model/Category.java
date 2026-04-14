package com.neria_municipio.api.domain.model;

public record Category(Long id, Long municipalityId, String name, String description, boolean active) {
}
