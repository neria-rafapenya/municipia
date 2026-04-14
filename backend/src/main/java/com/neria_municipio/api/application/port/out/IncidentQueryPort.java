package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.Incident;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IncidentQueryPort {
    Page<Incident> search(
            Long municipalityId,
            Optional<Long> categoryId,
            Optional<Long> userId,
            Optional<String> status,
            Pageable pageable
    );
}
