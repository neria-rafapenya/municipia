package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.News;
import java.util.List;
import java.util.Optional;

public interface NewsPort {
    Optional<News> findById(Long id);

    List<News> findByMunicipalityId(Long municipalityId);

    News save(News news);

    void deleteById(Long id);
}
