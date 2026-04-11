package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.CreateIncidentCommand;
import com.municipia.api.application.port.in.CreateIncidentUseCase;
import com.municipia.api.application.port.out.AiClassificationPort;
import com.municipia.api.application.port.out.AiClassificationPort.AiClassificationResult;
import com.municipia.api.application.port.out.CategoryPort;
import com.municipia.api.application.port.out.IncidentPort;
import com.municipia.api.application.port.out.MunicipalityPort;
import com.municipia.api.application.port.out.UserPort;
import com.municipia.api.domain.model.Category;
import com.municipia.api.domain.model.Incident;
import com.municipia.api.domain.model.IncidentStatus;
import com.municipia.api.domain.model.Municipality;
import com.municipia.api.domain.model.User;
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
                command.imageUrl(),
                null,
                IncidentStatus.OPEN,
                aiConfidence
        );

        Incident saved = incidentPort.save(incident);
        return saved.id();
    }
}
