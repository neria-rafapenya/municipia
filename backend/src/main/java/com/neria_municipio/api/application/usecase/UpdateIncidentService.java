package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.UpdateIncidentCommand;
import com.neria_municipio.api.application.port.in.UpdateIncidentUseCase;
import com.neria_municipio.api.application.port.out.IncidentHistoryPort;
import com.neria_municipio.api.application.port.out.IncidentPort;
import com.neria_municipio.api.application.port.out.UserPort;
import com.neria_municipio.api.domain.model.Incident;
import com.neria_municipio.api.domain.model.IncidentHistory;
import com.neria_municipio.api.domain.model.IncidentStatus;
import com.neria_municipio.api.domain.model.User;
import com.neria_municipio.api.domain.model.UserRole;
import java.util.Objects;
import org.springframework.stereotype.Service;

@Service
public class UpdateIncidentService implements UpdateIncidentUseCase {
    private final IncidentPort incidentPort;
    private final IncidentHistoryPort incidentHistoryPort;
    private final UserPort userPort;

    public UpdateIncidentService(
            IncidentPort incidentPort,
            IncidentHistoryPort incidentHistoryPort,
            UserPort userPort
    ) {
        this.incidentPort = incidentPort;
        this.incidentHistoryPort = incidentHistoryPort;
        this.userPort = userPort;
    }

    @Override
    public Incident updateIncident(UpdateIncidentCommand command) {
        Incident current = incidentPort.findById(command.incidentId())
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));

        if (!current.municipalityId().equals(command.municipalityId())) {
            throw new IllegalArgumentException("Municipality mismatch");
        }

        Long assignedOperatorId = command.assignedOperatorId() != null
                ? command.assignedOperatorId()
                : current.assignedOperatorId();

        if (assignedOperatorId != null) {
            User operator = userPort.findById(assignedOperatorId)
                    .orElseThrow(() -> new IllegalArgumentException("Operator not found"));
            if (!operator.municipalityId().equals(command.municipalityId())) {
                throw new IllegalArgumentException("Operator municipality mismatch");
            }
            if (!(operator.role() == UserRole.OPERATOR || operator.role() == UserRole.ADMIN)) {
                throw new IllegalArgumentException("Assigned user is not operator");
            }
        }

        IncidentStatus newStatus = command.status() != null ? command.status() : current.status();
        String imageUrl = command.imageUrl() != null ? command.imageUrl() : current.imageUrl();
        String resolutionImageUrl = command.resolutionImageUrl() != null ? command.resolutionImageUrl() : current.resolutionImageUrl();

        Incident updated = new Incident(
                current.id(),
                current.municipalityId(),
                current.userId(),
                assignedOperatorId,
                current.categoryId(),
                current.description(),
                current.latitude(),
                current.longitude(),
                current.locationAccuracy(),
                current.locationCapturedAt(),
                imageUrl,
                resolutionImageUrl,
                newStatus,
                current.aiConfidence()
        );

        Incident saved = incidentPort.save(updated);

        boolean statusChanged = current.status() != newStatus;
        boolean hasComment = command.comment() != null && !command.comment().isBlank();

        if (statusChanged || hasComment) {
            IncidentHistory history = new IncidentHistory(
                    null,
                    saved.id(),
                    saved.municipalityId(),
                    command.changedByUserId(),
                    current.status(),
                    newStatus,
                    null,
                    command.comment()
            );
            incidentHistoryPort.save(history);
        }

        return saved;
    }
}
