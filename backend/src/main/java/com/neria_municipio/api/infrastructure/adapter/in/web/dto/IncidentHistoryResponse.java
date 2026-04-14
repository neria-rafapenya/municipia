package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import com.neria_municipio.api.domain.model.IncidentStatus;
import java.time.Instant;

public record IncidentHistoryResponse(
        Long id,
        Long incidentId,
        Long municipalityId,
        Long changedByUserId,
        IncidentStatus previousStatus,
        IncidentStatus newStatus,
        Instant changedAt,
        String comment
) {
}
