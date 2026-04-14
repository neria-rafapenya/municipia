package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.MunicipalityPort;
import com.neria_municipio.api.domain.model.Municipality;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.MunicipalityRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class MunicipalityPersistenceAdapter implements MunicipalityPort {
    private final MunicipalityRepository municipalityRepository;

    public MunicipalityPersistenceAdapter(MunicipalityRepository municipalityRepository) {
        this.municipalityRepository = municipalityRepository;
    }

    @Override
    public Optional<Municipality> findById(Long id) {
        return municipalityRepository.findById(id).map(PersistenceMapper::toDomain);
    }
}
