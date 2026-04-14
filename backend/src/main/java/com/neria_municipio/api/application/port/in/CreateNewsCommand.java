package com.neria_municipio.api.application.port.in;

public record CreateNewsCommand(
        Long municipalityId,
        String title,
        String summary,
        String content,
        String imageUrl
) {
}
