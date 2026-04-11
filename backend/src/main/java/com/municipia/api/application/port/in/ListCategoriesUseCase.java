package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.Category;
import java.util.List;

public interface ListCategoriesUseCase {
    List<Category> listByMunicipality(Long municipalityId);
}
