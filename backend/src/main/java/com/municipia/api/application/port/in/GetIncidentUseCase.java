package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.Incident;
import java.util.Optional;

public interface GetIncidentUseCase {
    Optional<Incident> getIncident(Long id);
}
