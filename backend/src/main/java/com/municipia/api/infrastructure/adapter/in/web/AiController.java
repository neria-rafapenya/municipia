package com.municipia.api.infrastructure.adapter.in.web;

import com.municipia.api.application.port.in.ClassifyIncidentUseCase;
import com.municipia.api.application.port.out.AiClassificationPort.AiClassificationResult;
import com.municipia.api.application.port.out.CategoryPort;
import com.municipia.api.domain.model.Category;
import com.municipia.api.infrastructure.adapter.in.web.dto.AiClassifyRequest;
import com.municipia.api.infrastructure.adapter.in.web.dto.AiClassifyResponse;
import com.municipia.api.infrastructure.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final ClassifyIncidentUseCase classifyIncidentUseCase;
    private final CategoryPort categoryPort;

    public AiController(ClassifyIncidentUseCase classifyIncidentUseCase, CategoryPort categoryPort) {
        this.classifyIncidentUseCase = classifyIncidentUseCase;
        this.categoryPort = categoryPort;
    }

    @PostMapping("/classify")
    public ResponseEntity<AiClassifyResponse> classify(@Valid @RequestBody AiClassifyRequest request) {
        JwtPrincipal principal = requirePrincipal();
        Long municipalityId = request.municipalityId() != null ? request.municipalityId() : principal.municipalityId();
        if (!municipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        List<Category> categories = categoryPort.findByMunicipalityId(municipalityId);
        if (categories.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No categories configured");
        }

        AiClassificationResult result = classifyIncidentUseCase.classify(
                request.description(),
                categories.stream().map(Category::name).toList()
        );
        Category matched = categories.stream()
                .filter(category -> category.name().equalsIgnoreCase(result.categoryName()))
                .findFirst()
                .orElse(null);

        return ResponseEntity.ok(new AiClassifyResponse(
                result.categoryName(),
                result.confidence(),
                matched != null ? matched.id() : null
        ));
    }

    private JwtPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return principal;
    }
}
