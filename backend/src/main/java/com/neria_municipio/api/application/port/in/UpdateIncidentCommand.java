package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.IncidentStatus;

public record UpdateIncidentCommand(
        Long incidentId,
        Long municipalityId,
        Long assignedOperatorId,
        IncidentStatus status,
        String comment,
        String imageUrl,
        String resolutionImageUrl,
        Long changedByUserId
) {
}
