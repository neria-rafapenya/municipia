package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.IncidentHistoryPort;
import com.neria_municipio.api.domain.model.IncidentHistory;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentHistoryEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.IncidentHistoryRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.IncidentRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.MunicipalityRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class IncidentHistoryPersistenceAdapter implements IncidentHistoryPort {
    private final IncidentHistoryRepository historyRepository;
    private final IncidentRepository incidentRepository;
    private final MunicipalityRepository municipalityRepository;
    private final UserRepository userRepository;

    public IncidentHistoryPersistenceAdapter(
            IncidentHistoryRepository historyRepository,
            IncidentRepository incidentRepository,
            MunicipalityRepository municipalityRepository,
            UserRepository userRepository
    ) {
        this.historyRepository = historyRepository;
        this.incidentRepository = incidentRepository;
        this.municipalityRepository = municipalityRepository;
        this.userRepository = userRepository;
    }

    @Override
    public IncidentHistory save(IncidentHistory history) {
        IncidentEntity incident = incidentRepository.findById(history.incidentId())
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        MunicipalityEntity municipality = municipalityRepository.findById(history.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));
        UserEntity changedBy = null;
        if (history.changedByUserId() != null) {
            changedBy = userRepository.findById(history.changedByUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }

        IncidentHistoryEntity entity = new IncidentHistoryEntity();
        entity.setId(history.id());
        entity.setIncident(incident);
        entity.setMunicipality(municipality);
        entity.setChangedBy(changedBy);
        entity.setPreviousStatus(history.previousStatus());
        entity.setNewStatus(history.newStatus());
        entity.setOperatorComment(history.operatorComment());

        return PersistenceMapper.toDomain(historyRepository.save(entity));
    }

    @Override
    public List<IncidentHistory> findByIncidentId(Long incidentId) {
        return historyRepository.findByIncident_IdOrderByChangedAtDesc(incidentId).stream()
                .map(PersistenceMapper::toDomain)
                .toList();
    }
}
