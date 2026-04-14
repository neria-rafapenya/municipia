package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.ListIncidentHistoryUseCase;
import com.neria_municipio.api.application.port.out.IncidentHistoryPort;
import com.neria_municipio.api.domain.model.IncidentHistory;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListIncidentHistoryService implements ListIncidentHistoryUseCase {
    private final IncidentHistoryPort incidentHistoryPort;

    public ListIncidentHistoryService(IncidentHistoryPort incidentHistoryPort) {
        this.incidentHistoryPort = incidentHistoryPort;
    }

    @Override
    public List<IncidentHistory> listByIncident(Long incidentId) {
        return incidentHistoryPort.findByIncidentId(incidentId);
    }
}
