package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.Category;

public interface UpdateCategoryUseCase {
    Category updateCategory(UpdateCategoryCommand command);
}
