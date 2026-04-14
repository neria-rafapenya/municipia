package com.neria_municipio.api.infrastructure.adapter.out.persistence.repository;

import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentAttachmentEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachmentEntity, Long> {
    List<IncidentAttachmentEntity> findByIncident_Id(Long incidentId);
    List<IncidentAttachmentEntity> findByIncident_IdIn(List<Long> incidentIds);
}
