package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

public record NewsResponse(
        Long id,
        Long municipalityId,
        String title,
        String summary,
        String content,
        String imageUrl,
        boolean active
) {
}
