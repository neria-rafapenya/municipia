package com.municipia.api.infrastructure.adapter.in.web;

import com.municipia.api.application.port.in.CreateCategoryCommand;
import com.municipia.api.application.port.in.CreateCategoryUseCase;
import com.municipia.api.application.port.in.ListCategoriesUseCase;
import com.municipia.api.application.port.in.UpdateCategoryCommand;
import com.municipia.api.application.port.in.UpdateCategoryUseCase;
import com.municipia.api.domain.model.Category;
import com.municipia.api.domain.model.UserRole;
import com.municipia.api.infrastructure.adapter.in.web.dto.CategoryCreateRequest;
import com.municipia.api.infrastructure.adapter.in.web.dto.CategoryResponse;
import com.municipia.api.infrastructure.adapter.in.web.dto.CategoryUpdateRequest;
import com.municipia.api.infrastructure.security.JwtPrincipal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/categories")
@Validated
public class CategoryController {
    private final ListCategoriesUseCase listCategoriesUseCase;
    private final CreateCategoryUseCase createCategoryUseCase;
    private final UpdateCategoryUseCase updateCategoryUseCase;

    public CategoryController(
            ListCategoriesUseCase listCategoriesUseCase,
            CreateCategoryUseCase createCategoryUseCase,
            UpdateCategoryUseCase updateCategoryUseCase
    ) {
        this.listCategoriesUseCase = listCategoriesUseCase;
        this.createCategoryUseCase = createCategoryUseCase;
        this.updateCategoryUseCase = updateCategoryUseCase;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> listCategories(
            @RequestParam(value = "municipalityId", required = false) Long municipalityId
    ) {
        JwtPrincipal principal = requirePrincipal();
        Long effectiveMunicipalityId = municipalityId != null ? municipalityId : principal.municipalityId();
        if (!effectiveMunicipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        List<CategoryResponse> response = listCategoriesUseCase.listByMunicipality(effectiveMunicipalityId).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        JwtPrincipal principal = requirePrincipal();
        requireAdmin(principal);

        Long municipalityId = request.municipalityId();
        if (!municipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        Category created = createCategoryUseCase.createCategory(new CreateCategoryCommand(
                municipalityId,
                request.name(),
                request.description()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        JwtPrincipal principal = requirePrincipal();
        requireAdmin(principal);

        Category updated = updateCategoryUseCase.updateCategory(new UpdateCategoryCommand(
                id,
                principal.municipalityId(),
                request.name(),
                request.description(),
                request.active()
        ));
        return ResponseEntity.ok(toResponse(updated));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<CategoryResponse> deactivateCategory(@PathVariable Long id) {
        JwtPrincipal principal = requirePrincipal();
        requireAdmin(principal);

        Category updated = updateCategoryUseCase.updateCategory(new UpdateCategoryCommand(
                id,
                principal.municipalityId(),
                null,
                null,
                false
        ));
        return ResponseEntity.ok(toResponse(updated));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.id(), category.name(), category.description(), category.active());
    }

    private JwtPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return principal;
    }

    private void requireAdmin(JwtPrincipal principal) {
        if (!UserRole.ADMIN.equals(principal.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
