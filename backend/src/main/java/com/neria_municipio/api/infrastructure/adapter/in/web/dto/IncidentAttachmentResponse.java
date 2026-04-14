package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import java.time.Instant;

public record IncidentAttachmentResponse(
        Long id,
        String fileUrl,
        String fileName,
        String fileType,
        Instant createdAt
) {
}
