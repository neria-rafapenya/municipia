package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.ListIncidentsUseCase;
import com.municipia.api.application.port.out.IncidentPort;
import com.municipia.api.domain.model.Incident;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListIncidentsService implements ListIncidentsUseCase {
    private final IncidentPort incidentPort;

    public ListIncidentsService(IncidentPort incidentPort) {
        this.incidentPort = incidentPort;
    }

    @Override
    public List<Incident> listByMunicipality(Long municipalityId) {
        return incidentPort.findByMunicipalityId(municipalityId);
    }
}
