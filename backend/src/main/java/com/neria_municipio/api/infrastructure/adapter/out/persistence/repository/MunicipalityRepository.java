package com.neria_municipio.api.infrastructure.adapter.out.persistence.repository;

import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MunicipalityRepository extends JpaRepository<MunicipalityEntity, Long> {
}
