package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.SearchIncidentsUseCase;
import com.municipia.api.application.port.out.IncidentQueryPort;
import com.municipia.api.domain.model.Incident;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class SearchIncidentsService implements SearchIncidentsUseCase {
    private final IncidentQueryPort incidentQueryPort;

    public SearchIncidentsService(IncidentQueryPort incidentQueryPort) {
        this.incidentQueryPort = incidentQueryPort;
    }

    @Override
    public Page<Incident> search(
            Long municipalityId,
            Optional<Long> categoryId,
            Optional<Long> userId,
            Optional<String> status,
            Pageable pageable
    ) {
        return incidentQueryPort.search(municipalityId, categoryId, userId, status, pageable);
    }
}
