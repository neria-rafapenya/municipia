package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.Incident;

public interface UpdateIncidentUseCase {
    Incident updateIncident(UpdateIncidentCommand command);
}
