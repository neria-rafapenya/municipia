package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.Municipality;
import java.util.Optional;

public interface MunicipalityPort {
    Optional<Municipality> findById(Long id);
}
