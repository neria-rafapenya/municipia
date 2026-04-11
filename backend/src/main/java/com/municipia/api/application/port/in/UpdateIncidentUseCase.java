package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.Incident;

public interface UpdateIncidentUseCase {
    Incident updateIncident(UpdateIncidentCommand command);
}
