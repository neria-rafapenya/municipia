package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.CreateCategoryCommand;
import com.municipia.api.application.port.in.CreateCategoryUseCase;
import com.municipia.api.application.port.out.CategoryPort;
import com.municipia.api.domain.model.Category;
import org.springframework.stereotype.Service;

@Service
public class CreateCategoryService implements CreateCategoryUseCase {
    private final CategoryPort categoryPort;

    public CreateCategoryService(CategoryPort categoryPort) {
        this.categoryPort = categoryPort;
    }

    @Override
    public Category createCategory(CreateCategoryCommand command) {
        Category category = new Category(
                null,
                command.municipalityId(),
                command.name(),
                command.description(),
                true
        );
        return categoryPort.save(category);
    }
}
