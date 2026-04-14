package com.neria_municipio.api.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

public record Incident(
        Long id,
        Long municipalityId,
        Long userId,
        Long assignedOperatorId,
        Long categoryId,
        String description,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal locationAccuracy,
        Instant locationCapturedAt,
        String imageUrl,
        String resolutionImageUrl,
        IncidentStatus status,
        Float aiConfidence
) {
}
