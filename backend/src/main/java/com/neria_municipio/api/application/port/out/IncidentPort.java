package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.Incident;
import java.util.List;
import java.util.Optional;

public interface IncidentPort {
    Incident save(Incident incident);
    Optional<Incident> findById(Long id);
    List<Incident> findByMunicipalityId(Long municipalityId);
}
