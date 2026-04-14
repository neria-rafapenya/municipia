package com.neria_municipio.api.infrastructure.adapter.out.persistence.repository;

import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentHistoryEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentHistoryRepository extends JpaRepository<IncidentHistoryEntity, Long> {
    List<IncidentHistoryEntity> findByIncident_IdOrderByChangedAtDesc(Long incidentId);
}
