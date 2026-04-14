package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.AiPrompt;
import java.util.Optional;

public interface AiPromptPort {
    Optional<AiPrompt> findByMunicipalityIdAndKey(Long municipalityId, String promptKey);
}
