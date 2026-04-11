package com.municipia.api.infrastructure.adapter.in.web;

import com.municipia.api.application.port.in.CreateIncidentCommand;
import com.municipia.api.application.port.in.CreateIncidentUseCase;
import com.municipia.api.application.port.in.GetIncidentUseCase;
import com.municipia.api.application.port.in.ListIncidentHistoryUseCase;
import com.municipia.api.application.port.in.ListIncidentsUseCase;
import com.municipia.api.application.port.in.SearchIncidentsUseCase;
import com.municipia.api.application.port.in.UpdateIncidentCommand;
import com.municipia.api.application.port.in.UpdateIncidentUseCase;
import com.municipia.api.domain.model.Incident;
import com.municipia.api.domain.model.IncidentStatus;
import com.municipia.api.domain.model.IncidentHistory;
import com.municipia.api.domain.model.UserRole;
import com.municipia.api.infrastructure.adapter.in.web.dto.CreateIncidentRequest;
import com.municipia.api.infrastructure.adapter.in.web.dto.IncidentHistoryResponse;
import com.municipia.api.infrastructure.adapter.in.web.dto.IncidentResponse;
import com.municipia.api.infrastructure.adapter.in.web.dto.PagedResponse;
import com.municipia.api.infrastructure.adapter.in.web.dto.UpdateIncidentRequest;
import com.municipia.api.infrastructure.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.util.Optional;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
    private final CreateIncidentUseCase createIncidentUseCase;
    private final ListIncidentsUseCase listIncidentsUseCase;
    private final GetIncidentUseCase getIncidentUseCase;
    private final SearchIncidentsUseCase searchIncidentsUseCase;
    private final UpdateIncidentUseCase updateIncidentUseCase;
    private final ListIncidentHistoryUseCase listIncidentHistoryUseCase;

    public IncidentController(
            CreateIncidentUseCase createIncidentUseCase,
            ListIncidentsUseCase listIncidentsUseCase,
            GetIncidentUseCase getIncidentUseCase,
            SearchIncidentsUseCase searchIncidentsUseCase,
            UpdateIncidentUseCase updateIncidentUseCase,
            ListIncidentHistoryUseCase listIncidentHistoryUseCase
    ) {
        this.createIncidentUseCase = createIncidentUseCase;
        this.listIncidentsUseCase = listIncidentsUseCase;
        this.getIncidentUseCase = getIncidentUseCase;
        this.searchIncidentsUseCase = searchIncidentsUseCase;
        this.updateIncidentUseCase = updateIncidentUseCase;
        this.listIncidentHistoryUseCase = listIncidentHistoryUseCase;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> createIncident(@Valid @RequestBody CreateIncidentRequest request) {
        JwtPrincipal principal = requirePrincipal();

        Long municipalityId = request.municipalityId() != null ? request.municipalityId() : principal.municipalityId();
        if (!municipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        Long userId = request.userId() != null ? request.userId() : principal.userId();
        if (!userId.equals(principal.userId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User access denied");
        }

        Long id = createIncidentUseCase.createIncident(new CreateIncidentCommand(
                municipalityId,
                userId,
                request.categoryId(),
                request.description(),
                request.latitude(),
                request.longitude(),
                request.imageUrl(),
                request.aiConfidence()
        ));

        return ResponseEntity.ok(Map.of("id", id));
    }

    @GetMapping
    public ResponseEntity<?> listIncidents(
            @RequestParam(value = "municipalityId", required = false) Long municipalityId,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size,
            @RequestParam(value = "sort", required = false, defaultValue = "") String sort
    ) {
        JwtPrincipal principal = requirePrincipal();
        Long effectiveMunicipalityId = municipalityId != null ? municipalityId : principal.municipalityId();
        if (!effectiveMunicipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        if (categoryId != null || userId != null || status != null || page > 0 || size != 20 || (sort != null && !sort.isBlank())) {
            Sort sortSpec = parseSort(sort);
            int safePage = Math.max(page, 0);
            int safeSize = Math.min(Math.max(size, 1), 200);
            PageRequest pageable = PageRequest.of(safePage, safeSize, sortSpec);
            Page<Incident> pageResult = searchIncidentsUseCase.search(
                    effectiveMunicipalityId,
                    Optional.ofNullable(categoryId),
                    Optional.ofNullable(userId),
                    Optional.ofNullable(status),
                    pageable
            );
            Page<IncidentResponse> mapped = pageResult.map(this::toResponse);
            PagedResponse<IncidentResponse> response = new PagedResponse<>(
                    mapped.getContent(),
                    mapped.getNumber(),
                    mapped.getSize(),
                    mapped.getTotalElements()
            );
            return ResponseEntity.ok(response);
        }

        List<IncidentResponse> response = listIncidentsUseCase.listByMunicipality(effectiveMunicipalityId).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncident(@PathVariable Long id) {
        JwtPrincipal principal = requirePrincipal();
        Incident incident = getIncidentUseCase.getIncident(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));

        if (!incident.municipalityId().equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        return ResponseEntity.ok(toResponse(incident));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<IncidentResponse> updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody UpdateIncidentRequest request
    ) {
        JwtPrincipal principal = requirePrincipal();
        if (!(principal.role() == UserRole.OPERATOR || principal.role() == UserRole.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Operator access required");
        }

        Incident updated = updateIncidentUseCase.updateIncident(new UpdateIncidentCommand(
                id,
                principal.municipalityId(),
                request.assignedOperatorId(),
                request.status(),
                request.comment(),
                request.imageUrl(),
                request.resolutionImageUrl(),
                principal.userId()
        ));

        return ResponseEntity.ok(toResponse(updated));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<IncidentHistoryResponse>> listHistory(@PathVariable Long id) {
        JwtPrincipal principal = requirePrincipal();
        if (!(principal.role() == UserRole.OPERATOR || principal.role() == UserRole.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Operator access required");
        }

        Incident incident = getIncidentUseCase.getIncident(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));
        if (!incident.municipalityId().equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        List<IncidentHistoryResponse> response = listIncidentHistoryUseCase.listByIncident(id).stream()
                .map(this::toHistoryResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    private IncidentResponse toResponse(Incident incident) {
        return new IncidentResponse(
                incident.id(),
                incident.municipalityId(),
                incident.userId(),
                incident.assignedOperatorId(),
                incident.categoryId(),
                incident.description(),
                incident.latitude(),
                incident.longitude(),
                incident.imageUrl(),
                incident.resolutionImageUrl(),
                incident.status(),
                incident.aiConfidence()
        );
    }

    private IncidentHistoryResponse toHistoryResponse(IncidentHistory history) {
        return new IncidentHistoryResponse(
                history.id(),
                history.incidentId(),
                history.municipalityId(),
                history.changedByUserId(),
                history.previousStatus(),
                history.newStatus(),
                history.changedAt(),
                history.operatorComment()
        );
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] parts = sort.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = Sort.Direction.DESC;
        if (parts.length > 1) {
            direction = Sort.Direction.fromOptionalString(parts[1].trim()).orElse(Sort.Direction.DESC);
        }
        return Sort.by(direction, property);
    }

    private JwtPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return principal;
    }
}
