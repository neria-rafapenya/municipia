package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.UpdateCategoryCommand;
import com.municipia.api.application.port.in.UpdateCategoryUseCase;
import com.municipia.api.application.port.out.CategoryPort;
import com.municipia.api.domain.model.Category;
import org.springframework.stereotype.Service;

@Service
public class UpdateCategoryService implements UpdateCategoryUseCase {
    private final CategoryPort categoryPort;

    public UpdateCategoryService(CategoryPort categoryPort) {
        this.categoryPort = categoryPort;
    }

    @Override
    public Category updateCategory(UpdateCategoryCommand command) {
        Category existing = categoryPort.findById(command.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (!existing.municipalityId().equals(command.municipalityId())) {
            throw new IllegalArgumentException("Municipality mismatch");
        }

        String name = command.name() != null ? command.name() : existing.name();
        String description = command.description() != null ? command.description() : existing.description();
        boolean active = command.active() != null ? command.active() : existing.active();

        Category updated = new Category(existing.id(), existing.municipalityId(), name, description, active);
        return categoryPort.save(updated);
    }
}
