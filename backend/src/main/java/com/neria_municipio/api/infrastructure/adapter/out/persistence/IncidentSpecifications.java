package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.domain.model.IncidentStatus;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentEntity;
import java.util.Locale;
import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;

final class IncidentSpecifications {
    private IncidentSpecifications() {
    }

    static Specification<IncidentEntity> byMunicipality(Long municipalityId) {
        return (root, query, builder) -> builder.equal(root.get("municipality").get("id"), municipalityId);
    }

    static Specification<IncidentEntity> byCategory(Optional<Long> categoryId) {
        return categoryId
                .map(id -> (Specification<IncidentEntity>) (root, query, builder) ->
                        builder.equal(root.get("category").get("id"), id))
                .orElse(null);
    }

    static Specification<IncidentEntity> byUser(Optional<Long> userId) {
        return userId
                .map(id -> (Specification<IncidentEntity>) (root, query, builder) ->
                        builder.equal(root.get("user").get("id"), id))
                .orElse(null);
    }

    static Specification<IncidentEntity> byStatus(Optional<String> status) {
        return status
                .map(value -> (Specification<IncidentEntity>) (root, query, builder) -> {
                    String normalized = value.trim().toUpperCase(Locale.ROOT);
                    IncidentStatus incidentStatus = IncidentStatus.valueOf(normalized);
                    return builder.equal(root.get("status"), incidentStatus);
                })
                .orElse(null);
    }
}
