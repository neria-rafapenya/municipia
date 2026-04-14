package com.neria_municipio.api.domain.model;

public record ChatbotLog(
        Long municipalityId,
        Long userId,
        String prompt,
        String response
) {
}
