package com.municipia.api.application.port.in;

public record CreateCategoryCommand(Long municipalityId, String name, String description) {
}
