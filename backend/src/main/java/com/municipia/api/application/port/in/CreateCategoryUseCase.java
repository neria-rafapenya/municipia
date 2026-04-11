package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.Category;

public interface CreateCategoryUseCase {
    Category createCategory(CreateCategoryCommand command);
}
