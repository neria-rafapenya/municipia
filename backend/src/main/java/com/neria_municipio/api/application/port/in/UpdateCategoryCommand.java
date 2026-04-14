package com.neria_municipio.api.application.port.in;

public record UpdateCategoryCommand(Long categoryId, Long municipalityId, String name, String description, Boolean active) {
}
