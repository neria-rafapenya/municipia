package com.municipia.api.domain.model;

import java.math.BigDecimal;

public record Incident(
        Long id,
        Long municipalityId,
        Long userId,
        Long assignedOperatorId,
        Long categoryId,
        String description,
        BigDecimal latitude,
        BigDecimal longitude,
        String imageUrl,
        String resolutionImageUrl,
        IncidentStatus status,
        Float aiConfidence
) {
}
