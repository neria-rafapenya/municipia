package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.GetMunicipalityUseCase;
import com.neria_municipio.api.application.port.out.MunicipalityPort;
import com.neria_municipio.api.domain.model.Municipality;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class GetMunicipalityService implements GetMunicipalityUseCase {
    private final MunicipalityPort municipalityPort;

    public GetMunicipalityService(MunicipalityPort municipalityPort) {
        this.municipalityPort = municipalityPort;
    }

    @Override
    public Optional<Municipality> getMunicipality(Long id) {
        return municipalityPort.findById(id);
    }
}
