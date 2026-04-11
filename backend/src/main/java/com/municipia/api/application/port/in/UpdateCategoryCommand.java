package com.municipia.api.application.port.in;

public record UpdateCategoryCommand(Long categoryId, Long municipalityId, String name, String description, Boolean active) {
}
