package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.Category;
import java.util.List;

public interface ListCategoriesUseCase {
    List<Category> listByMunicipality(Long municipalityId);
}
