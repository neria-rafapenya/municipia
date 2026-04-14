package com.neria_municipio.api.infrastructure.adapter.out.persistence.repository;

import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.CategoryEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    List<CategoryEntity> findByMunicipality_Id(Long municipalityId);
}
