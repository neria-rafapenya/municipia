package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryPort {
    Optional<Category> findById(Long id);
    List<Category> findByMunicipalityId(Long municipalityId);
    Category save(Category category);
}
