package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.IncidentHistory;
import java.util.List;

public interface IncidentHistoryPort {
    IncidentHistory save(IncidentHistory history);
    List<IncidentHistory> findByIncidentId(Long incidentId);
}
