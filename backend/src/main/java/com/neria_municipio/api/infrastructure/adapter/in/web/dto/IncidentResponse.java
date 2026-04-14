package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import com.neria_municipio.api.domain.model.IncidentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record IncidentResponse(
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
        Float aiConfidence,
        List<IncidentAttachmentResponse> attachments
) {
}
