package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import com.neria_municipio.api.domain.model.IncidentStatus;
import jakarta.validation.constraints.Size;

public record UpdateIncidentRequest(
        Long assignedOperatorId,
        IncidentStatus status,
        @Size(max = 2000) String comment,
        @Size(max = 255) String imageUrl,
        @Size(max = 255) String resolutionImageUrl
) {
}
