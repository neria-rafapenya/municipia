package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.Municipality;
import java.util.Optional;

public interface GetMunicipalityUseCase {
    Optional<Municipality> getMunicipality(Long id);
}
