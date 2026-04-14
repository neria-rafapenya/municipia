package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.IncidentQueryPort;
import com.neria_municipio.api.domain.model.Incident;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.IncidentRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

@Repository
public class IncidentQueryAdapter implements IncidentQueryPort {
    private final IncidentRepository incidentRepository;

    public IncidentQueryAdapter(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @Override
    public Page<Incident> search(
            Long municipalityId,
            Optional<Long> categoryId,
            Optional<Long> userId,
            Optional<String> status,
            Pageable pageable
    ) {
        Specification<IncidentEntity> spec = Specification.where(IncidentSpecifications.byMunicipality(municipalityId))
                .and(IncidentSpecifications.byCategory(categoryId))
                .and(IncidentSpecifications.byUser(userId))
                .and(IncidentSpecifications.byStatus(status));

        return incidentRepository.findAll(spec, pageable).map(PersistenceMapper::toDomain);
    }
}
