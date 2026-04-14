package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.Size;

public record NewsUpdateRequest(
        @Size(max = 160) String title,
        @Size(max = 500) String summary,
        String content,
        @Size(max = 500) String imageUrl,
        Boolean active
) {
}
