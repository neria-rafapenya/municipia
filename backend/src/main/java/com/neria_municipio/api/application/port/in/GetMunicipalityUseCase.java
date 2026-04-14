package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.Municipality;
import java.util.Optional;

public interface GetMunicipalityUseCase {
    Optional<Municipality> getMunicipality(Long id);
}
