package com.municipia.api.domain.model;

import java.time.Instant;

public record IncidentHistory(
        Long id,
        Long incidentId,
        Long municipalityId,
        Long changedByUserId,
        IncidentStatus previousStatus,
        IncidentStatus newStatus,
        Instant changedAt,
        String operatorComment
) {
}
