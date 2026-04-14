package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.AiPromptPort;
import com.neria_municipio.api.domain.model.AiPrompt;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.AiPromptRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class AiPromptPersistenceAdapter implements AiPromptPort {
    private final AiPromptRepository repository;

    public AiPromptPersistenceAdapter(AiPromptRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<AiPrompt> findByMunicipalityIdAndKey(Long municipalityId, String promptKey) {
        return repository.findByMunicipality_IdAndPromptKey(municipalityId, promptKey)
                .map(PersistenceMapper::toDomain);
    }
}
