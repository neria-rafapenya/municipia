package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.IncidentPort;
import com.neria_municipio.api.domain.model.Incident;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.CategoryEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.CategoryRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.IncidentRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.MunicipalityRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class IncidentPersistenceAdapter implements IncidentPort {
    private final IncidentRepository incidentRepository;
    private final MunicipalityRepository municipalityRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public IncidentPersistenceAdapter(
            IncidentRepository incidentRepository,
            MunicipalityRepository municipalityRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.municipalityRepository = municipalityRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public Incident save(Incident incident) {
        MunicipalityEntity municipality = municipalityRepository.findById(incident.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));
        UserEntity user = userRepository.findById(incident.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        CategoryEntity category = categoryRepository.findById(incident.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        UserEntity assignedOperator = null;
        if (incident.assignedOperatorId() != null) {
            assignedOperator = userRepository.findById(incident.assignedOperatorId())
                    .orElseThrow(() -> new IllegalArgumentException("Assigned operator not found"));
        }

        IncidentEntity entity = new IncidentEntity();
        entity.setId(incident.id());
        entity.setMunicipality(municipality);
        entity.setUser(user);
        entity.setCategory(category);
        entity.setAssignedOperator(assignedOperator);
        entity.setDescription(incident.description());
        entity.setLatitude(incident.latitude());
        entity.setLongitude(incident.longitude());
        entity.setLocationAccuracy(incident.locationAccuracy());
        entity.setLocationCapturedAt(incident.locationCapturedAt());
        entity.setImageUrl(incident.imageUrl());
        entity.setResolutionImageUrl(incident.resolutionImageUrl());
        entity.setStatus(incident.status());
        entity.setAiConfidence(incident.aiConfidence());

        return PersistenceMapper.toDomain(incidentRepository.save(entity));
    }

    @Override
    public Optional<Incident> findById(Long id) {
        return incidentRepository.findById(id).map(PersistenceMapper::toDomain);
    }

    @Override
    public List<Incident> findByMunicipalityId(Long municipalityId) {
        return incidentRepository.findByMunicipality_Id(municipalityId).stream()
                .map(PersistenceMapper::toDomain)
                .toList();
    }
}
