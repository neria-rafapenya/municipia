package com.neria_municipio.api.infrastructure.adapter.out.persistence.repository;

import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface IncidentRepository extends JpaRepository<IncidentEntity, Long>, JpaSpecificationExecutor<IncidentEntity> {
    List<IncidentEntity> findByMunicipality_Id(Long municipalityId);
}
