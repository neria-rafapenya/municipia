package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.Category;

public interface CreateCategoryUseCase {
    Category createCategory(CreateCategoryCommand command);
}
