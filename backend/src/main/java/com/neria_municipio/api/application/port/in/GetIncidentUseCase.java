package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.Incident;
import java.util.Optional;

public interface GetIncidentUseCase {
    Optional<Incident> getIncident(Long id);
}
