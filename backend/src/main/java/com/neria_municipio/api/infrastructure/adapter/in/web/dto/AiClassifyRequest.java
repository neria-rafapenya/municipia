package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiClassifyRequest(
        Long municipalityId,
        @NotBlank @Size(max = 2000) String description
) {
}
