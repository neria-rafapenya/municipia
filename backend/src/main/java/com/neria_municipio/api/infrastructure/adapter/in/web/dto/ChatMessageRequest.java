package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(
        @NotBlank String role,
        @NotBlank String content
) {
}
