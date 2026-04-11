package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.GetIncidentUseCase;
import com.municipia.api.application.port.out.IncidentPort;
import com.municipia.api.domain.model.Incident;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class GetIncidentService implements GetIncidentUseCase {
    private final IncidentPort incidentPort;

    public GetIncidentService(IncidentPort incidentPort) {
        this.incidentPort = incidentPort;
    }

    @Override
    public Optional<Incident> getIncident(Long id) {
        return incidentPort.findById(id);
    }
}
