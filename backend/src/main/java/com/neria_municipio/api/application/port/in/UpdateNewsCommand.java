package com.neria_municipio.api.application.port.in;

public record UpdateNewsCommand(
        Long newsId,
        Long municipalityId,
        String title,
        String summary,
        String content,
        String imageUrl,
        Boolean active
) {
}
