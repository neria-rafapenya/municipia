package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.ListCategoriesUseCase;
import com.neria_municipio.api.application.port.out.CategoryPort;
import com.neria_municipio.api.domain.model.Category;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListCategoriesService implements ListCategoriesUseCase {
    private final CategoryPort categoryPort;

    public ListCategoriesService(CategoryPort categoryPort) {
        this.categoryPort = categoryPort;
    }

    @Override
    public List<Category> listByMunicipality(Long municipalityId) {
        return categoryPort.findByMunicipalityId(municipalityId);
    }
}
