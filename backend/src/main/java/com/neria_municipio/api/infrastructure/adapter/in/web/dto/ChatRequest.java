package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ChatRequest(
        @NotBlank String message,
        List<ChatMessageRequest> history
) {
}
