package com.municipia.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateIncidentRequest(
        Long municipalityId,
        Long userId,
        Long categoryId,
        @NotBlank @Size(max = 2000) String description,
        @DecimalMin(value = "-90.0", inclusive = true) @DecimalMax(value = "90.0", inclusive = true) BigDecimal latitude,
        @DecimalMin(value = "-180.0", inclusive = true) @DecimalMax(value = "180.0", inclusive = true) BigDecimal longitude,
        @Size(max = 255) String imageUrl,
        Float aiConfidence
) {
}
