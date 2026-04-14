package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.IncidentHistory;
import java.util.List;

public interface ListIncidentHistoryUseCase {
    List<IncidentHistory> listByIncident(Long incidentId);
}
