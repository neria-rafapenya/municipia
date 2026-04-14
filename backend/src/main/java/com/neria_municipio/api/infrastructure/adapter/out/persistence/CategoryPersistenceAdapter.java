package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.CategoryPort;
import com.neria_municipio.api.domain.model.Category;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.CategoryEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.CategoryRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.MunicipalityRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class CategoryPersistenceAdapter implements CategoryPort {
    private final CategoryRepository categoryRepository;
    private final MunicipalityRepository municipalityRepository;

    public CategoryPersistenceAdapter(CategoryRepository categoryRepository, MunicipalityRepository municipalityRepository) {
        this.categoryRepository = categoryRepository;
        this.municipalityRepository = municipalityRepository;
    }

    @Override
    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id).map(PersistenceMapper::toDomain);
    }

    @Override
    public List<Category> findByMunicipalityId(Long municipalityId) {
        return categoryRepository.findByMunicipality_Id(municipalityId).stream()
                .map(PersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public Category save(Category category) {
        CategoryEntity entity = categoryRepository.findById(category.id() != null ? category.id() : -1L)
                .orElseGet(CategoryEntity::new);
        MunicipalityEntity municipality = municipalityRepository.findById(category.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));

        entity.setId(category.id());
        entity.setMunicipality(municipality);
        entity.setName(category.name());
        entity.setDescription(category.description());
        entity.setActive(category.active());

        return PersistenceMapper.toDomain(categoryRepository.save(entity));
    }
}
