package com.municipia.api.application.port.in;

import java.math.BigDecimal;

public record CreateIncidentCommand(
        Long municipalityId,
        Long userId,
        Long categoryId,
        String description,
        BigDecimal latitude,
        BigDecimal longitude,
        String imageUrl,
        Float aiConfidence
) {
}
