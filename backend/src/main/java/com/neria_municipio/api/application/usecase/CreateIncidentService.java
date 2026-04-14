package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.CreateIncidentCommand;
import com.neria_municipio.api.application.port.in.CreateIncidentUseCase;
import com.neria_municipio.api.application.port.out.AiClassificationPort;
import com.neria_municipio.api.application.port.out.AiClassificationPort.AiClassificationResult;
import com.neria_municipio.api.application.port.out.CategoryPort;
import com.neria_municipio.api.application.port.out.IncidentPort;
import com.neria_municipio.api.application.port.out.MunicipalityPort;
import com.neria_municipio.api.application.port.out.UserPort;
import com.neria_municipio.api.domain.model.Category;
import com.neria_municipio.api.domain.model.Incident;
import com.neria_municipio.api.domain.model.IncidentStatus;
import com.neria_municipio.api.domain.model.Municipality;
import com.neria_municipio.api.domain.model.User;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CreateIncidentService implements CreateIncidentUseCase {
    private final MunicipalityPort municipalityPort;
    private final UserPort userPort;
    private final CategoryPort categoryPort;
    private final IncidentPort incidentPort;
    private final AiClassificationPort aiClassificationPort;

    public CreateIncidentService(
            MunicipalityPort municipalityPort,
            UserPort userPort,
            CategoryPort categoryPort,
            IncidentPort incidentPort,
            AiClassificationPort aiClassificationPort
    ) {
        this.municipalityPort = municipalityPort;
        this.userPort = userPort;
        this.categoryPort = categoryPort;
        this.incidentPort = incidentPort;
        this.aiClassificationPort = aiClassificationPort;
    }

    @Override
    public Long createIncident(CreateIncidentCommand command) {
        Municipality municipality = municipalityPort.findById(command.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));
        User user = userPort.findById(command.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Category category;
        Float aiConfidence = command.aiConfidence();
        if (command.categoryId() != null) {
            category = categoryPort.findById(command.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        } else {
            List<Category> categories = categoryPort.findByMunicipalityId(municipality.id());
            if (categories.isEmpty()) {
                throw new IllegalArgumentException("No categories configured for municipality");
            }
            List<String> categoryNames = categories.stream().map(Category::name).toList();
            AiClassificationResult result = aiClassificationPort.classify(command.description(), categoryNames);
            aiConfidence = result.confidence();
            category = categories.stream()
                    .filter(item -> item.name().equalsIgnoreCase(result.categoryName()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("AI category not found"));
        }

        if (!municipality.id().equals(user.municipalityId()) || !municipality.id().equals(category.municipalityId())) {
            throw new IllegalArgumentException("Municipality mismatch for user or category");
        }

        Incident incident = new Incident(
                null,
                municipality.id(),
                user.id(),
                null,
                category.id(),
                command.description(),
                command.latitude(),
                command.longitude(),
                command.locationAccuracy(),
                command.locationCapturedAt(),
                command.imageUrl(),
                null,
                IncidentStatus.OPEN,
                aiConfidence
        );

        Incident saved = incidentPort.save(incident);
        return saved.id();
    }
}
