package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.GetIncidentUseCase;
import com.neria_municipio.api.application.port.out.IncidentPort;
import com.neria_municipio.api.domain.model.Incident;
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
