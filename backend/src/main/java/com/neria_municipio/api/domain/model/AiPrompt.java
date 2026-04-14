package com.neria_municipio.api.domain.model;

public record AiPrompt(
        Long id,
        Long municipalityId,
        String promptKey,
        String systemPrompt,
        String model,
        Double temperature,
        Integer maxHistory,
        boolean enabled
) {
}
