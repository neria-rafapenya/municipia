package com.municipia.api.infrastructure.adapter.in.web.dto;

import com.municipia.api.domain.model.IncidentStatus;
import java.math.BigDecimal;

public record IncidentResponse(
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
