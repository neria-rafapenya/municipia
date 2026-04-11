package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.Category;

public interface UpdateCategoryUseCase {
    Category updateCategory(UpdateCategoryCommand command);
}
