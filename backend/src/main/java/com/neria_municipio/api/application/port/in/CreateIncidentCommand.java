package com.neria_municipio.api.application.port.in;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateIncidentCommand(
        Long municipalityId,
        Long userId,
        Long categoryId,
        String description,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal locationAccuracy,
        Instant locationCapturedAt,
        String imageUrl,
        Float aiConfidence
) {
}
