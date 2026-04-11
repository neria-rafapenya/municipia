package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.IncidentHistory;
import java.util.List;

public interface ListIncidentHistoryUseCase {
    List<IncidentHistory> listByIncident(Long incidentId);
}
