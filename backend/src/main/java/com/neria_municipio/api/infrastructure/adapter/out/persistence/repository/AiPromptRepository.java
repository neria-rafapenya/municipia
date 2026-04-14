package com.neria_municipio.api.infrastructure.adapter.out.persistence.repository;

import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.AiPromptEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiPromptRepository extends JpaRepository<AiPromptEntity, Long> {
    Optional<AiPromptEntity> findByMunicipality_IdAndPromptKey(Long municipalityId, String promptKey);
}
