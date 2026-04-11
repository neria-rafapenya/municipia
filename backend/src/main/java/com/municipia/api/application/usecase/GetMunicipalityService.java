package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.GetMunicipalityUseCase;
import com.municipia.api.application.port.out.MunicipalityPort;
import com.municipia.api.domain.model.Municipality;
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
