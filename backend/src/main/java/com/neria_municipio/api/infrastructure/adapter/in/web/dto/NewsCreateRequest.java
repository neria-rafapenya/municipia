package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NewsCreateRequest(
        @NotNull Long municipalityId,
        @NotBlank @Size(max = 160) String title,
        @Size(max = 500) String summary,
        @NotBlank String content,
        @Size(max = 500) String imageUrl
) {
}
