package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.IncidentStatus;

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
