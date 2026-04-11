package com.municipia.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(
        @NotNull Long municipalityId,
        @NotBlank @Size(max = 100) String name,
        @Size(max = 2000) String description
) {
}
