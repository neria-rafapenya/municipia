package com.neria_municipio.api.application.port.in;

public record CreateCategoryCommand(Long municipalityId, String name, String description) {
}
