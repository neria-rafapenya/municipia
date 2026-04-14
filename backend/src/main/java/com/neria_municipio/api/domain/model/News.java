package com.neria_municipio.api.domain.model;

public record News(
        Long id,
        Long municipalityId,
        String title,
        String summary,
        String content,
        String imageUrl,
        boolean active
) {
}
