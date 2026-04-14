package com.neria_municipio.api.domain.model;

import java.time.Instant;

public record IncidentAttachment(
        Long id,
        Long incidentId,
        Long municipalityId,
        String fileUrl,
        String fileName,
        String fileType,
        Instant createdAt
) {
}
