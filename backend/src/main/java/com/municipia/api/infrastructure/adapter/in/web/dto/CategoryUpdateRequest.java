package com.municipia.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.Size;

public record CategoryUpdateRequest(
        @Size(max = 100) String name,
        @Size(max = 2000) String description,
        Boolean active
) {
}
