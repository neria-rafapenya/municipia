package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.Incident;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchIncidentsUseCase {
    Page<Incident> search(
            Long municipalityId,
            Optional<Long> categoryId,
            Optional<Long> userId,
            Optional<String> status,
            Pageable pageable
    );
}
