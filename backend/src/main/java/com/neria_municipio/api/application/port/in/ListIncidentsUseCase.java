package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.Incident;
import java.util.List;

public interface ListIncidentsUseCase {
    List<Incident> listByMunicipality(Long municipalityId);
}
