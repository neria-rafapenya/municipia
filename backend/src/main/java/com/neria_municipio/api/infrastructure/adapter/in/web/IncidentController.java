package com.neria_municipio.api.infrastructure.adapter.in.web;

import com.neria_municipio.api.application.port.in.CreateIncidentCommand;
import com.neria_municipio.api.application.port.in.CreateIncidentUseCase;
import com.neria_municipio.api.application.port.in.GetIncidentUseCase;
import com.neria_municipio.api.application.port.in.ListIncidentHistoryUseCase;
import com.neria_municipio.api.application.port.in.ListIncidentsUseCase;
import com.neria_municipio.api.application.port.in.SearchIncidentsUseCase;
import com.neria_municipio.api.application.port.in.UpdateIncidentCommand;
import com.neria_municipio.api.application.port.in.UpdateIncidentUseCase;
import com.neria_municipio.api.application.port.out.IncidentAttachmentPort;
import com.neria_municipio.api.domain.model.Incident;
import com.neria_municipio.api.domain.model.IncidentAttachment;
import com.neria_municipio.api.domain.model.IncidentStatus;
import com.neria_municipio.api.domain.model.IncidentHistory;
import com.neria_municipio.api.domain.model.UserRole;
import com.neria_municipio.api.infrastructure.adapter.out.storage.CloudinaryUploadService;
import com.neria_municipio.api.infrastructure.adapter.out.storage.CloudinaryUploadService.UploadedFile;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.CreateIncidentRequest;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.IncidentAttachmentResponse;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.IncidentHistoryResponse;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.IncidentResponse;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.PagedResponse;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.UpdateIncidentRequest;
import com.neria_municipio.api.infrastructure.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.Optional;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {
    private final CreateIncidentUseCase createIncidentUseCase;
    private final ListIncidentsUseCase listIncidentsUseCase;
    private final GetIncidentUseCase getIncidentUseCase;
    private final SearchIncidentsUseCase searchIncidentsUseCase;
    private final UpdateIncidentUseCase updateIncidentUseCase;
    private final ListIncidentHistoryUseCase listIncidentHistoryUseCase;
    private final IncidentAttachmentPort incidentAttachmentPort;
    private final CloudinaryUploadService cloudinaryUploadService;

    public IncidentController(
            CreateIncidentUseCase createIncidentUseCase,
            ListIncidentsUseCase listIncidentsUseCase,
            GetIncidentUseCase getIncidentUseCase,
            SearchIncidentsUseCase searchIncidentsUseCase,
            UpdateIncidentUseCase updateIncidentUseCase,
            ListIncidentHistoryUseCase listIncidentHistoryUseCase,
            IncidentAttachmentPort incidentAttachmentPort,
            CloudinaryUploadService cloudinaryUploadService
    ) {
        this.createIncidentUseCase = createIncidentUseCase;
        this.listIncidentsUseCase = listIncidentsUseCase;
        this.getIncidentUseCase = getIncidentUseCase;
        this.searchIncidentsUseCase = searchIncidentsUseCase;
        this.updateIncidentUseCase = updateIncidentUseCase;
        this.listIncidentHistoryUseCase = listIncidentHistoryUseCase;
        this.incidentAttachmentPort = incidentAttachmentPort;
        this.cloudinaryUploadService = cloudinaryUploadService;
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
                request.locationAccuracy(),
                request.locationCapturedAt(),
                request.imageUrl(),
                request.aiConfidence()
        ));

        return ResponseEntity.ok(Map.of("id", id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentResponse> createIncidentWithFiles(
            @RequestParam(value = "municipalityId", required = false) Long municipalityId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "description") String description,
            @RequestParam(value = "latitude", required = false) BigDecimal latitude,
            @RequestParam(value = "longitude", required = false) BigDecimal longitude,
            @RequestParam(value = "locationAccuracy", required = false) BigDecimal locationAccuracy,
            @RequestParam(value = "locationCapturedAt", required = false) Instant locationCapturedAt,
            @RequestParam(value = "aiConfidence", required = false) Float aiConfidence,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) {
        JwtPrincipal principal = requirePrincipal();

        if (description == null || description.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
        }

        Long effectiveMunicipalityId = municipalityId != null ? municipalityId : principal.municipalityId();
        if (!effectiveMunicipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        Long effectiveUserId = userId != null ? userId : principal.userId();
        if (!effectiveUserId.equals(principal.userId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User access denied");
        }

        List<UploadedFile> uploadedFiles = cloudinaryUploadService.upload(files);
        String imageUrl = uploadedFiles.isEmpty() ? null : uploadedFiles.get(0).url();

        Long id = createIncidentUseCase.createIncident(new CreateIncidentCommand(
                effectiveMunicipalityId,
                effectiveUserId,
                categoryId,
                description,
                latitude,
                longitude,
                locationAccuracy,
                locationCapturedAt,
                imageUrl,
                aiConfidence
        ));

        if (!uploadedFiles.isEmpty()) {
            List<IncidentAttachment> attachments = uploadedFiles.stream()
                    .map(file -> new IncidentAttachment(
                            null,
                            id,
                            effectiveMunicipalityId,
                            file.url(),
                            file.fileName(),
                            file.fileType(),
                            null
                    ))
                    .toList();
            incidentAttachmentPort.saveAll(attachments);
        }

        Incident incident = getIncidentUseCase.getIncident(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));
        List<IncidentAttachmentResponse> attachments = toAttachmentResponses(
                incidentAttachmentPort.findByIncidentId(id)
        );

        return ResponseEntity.ok(toResponse(incident, attachments));
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
            List<IncidentResponse> mapped = mapWithAttachments(pageResult.getContent());
            PagedResponse<IncidentResponse> response = new PagedResponse<>(
                    mapped,
                    pageResult.getNumber(),
                    pageResult.getSize(),
                    pageResult.getTotalElements()
            );
            return ResponseEntity.ok(response);
        }

        List<Incident> incidents = listIncidentsUseCase.listByMunicipality(effectiveMunicipalityId);
        List<IncidentResponse> response = mapWithAttachments(incidents);
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

        List<IncidentAttachmentResponse> attachments = toAttachmentResponses(
                incidentAttachmentPort.findByIncidentId(id)
        );
        return ResponseEntity.ok(toResponse(incident, attachments));
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

        List<IncidentAttachmentResponse> attachments = toAttachmentResponses(
                incidentAttachmentPort.findByIncidentId(updated.id())
        );
        return ResponseEntity.ok(toResponse(updated, attachments));
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
                incident.locationAccuracy(),
                incident.locationCapturedAt(),
                incident.imageUrl(),
                incident.resolutionImageUrl(),
                incident.status(),
                incident.aiConfidence(),
                List.of()
        );
    }

    private IncidentResponse toResponse(Incident incident, List<IncidentAttachmentResponse> attachments) {
        return new IncidentResponse(
                incident.id(),
                incident.municipalityId(),
                incident.userId(),
                incident.assignedOperatorId(),
                incident.categoryId(),
                incident.description(),
                incident.latitude(),
                incident.longitude(),
                incident.locationAccuracy(),
                incident.locationCapturedAt(),
                incident.imageUrl(),
                incident.resolutionImageUrl(),
                incident.status(),
                incident.aiConfidence(),
                attachments
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

    private List<IncidentResponse> mapWithAttachments(List<Incident> incidents) {
        if (incidents == null || incidents.isEmpty()) {
            return List.of();
        }
        List<Long> ids = incidents.stream().map(Incident::id).toList();
        Map<Long, List<IncidentAttachmentResponse>> attachmentsByIncident = incidentAttachmentPort
                .findByIncidentIds(ids)
                .stream()
                .collect(Collectors.groupingBy(
                        IncidentAttachment::incidentId,
                        Collectors.mapping(this::toAttachmentResponse, Collectors.toList())
                ));

        return incidents.stream()
                .map(incident -> toResponse(
                        incident,
                        attachmentsByIncident.getOrDefault(incident.id(), List.of())
                ))
                .toList();
    }

    private List<IncidentAttachmentResponse> toAttachmentResponses(List<IncidentAttachment> attachments) {
        if (attachments == null) {
            return List.of();
        }
        return attachments.stream().map(this::toAttachmentResponse).toList();
    }

    private IncidentAttachmentResponse toAttachmentResponse(IncidentAttachment attachment) {
        return new IncidentAttachmentResponse(
                attachment.id(),
                attachment.fileUrl(),
                attachment.fileName(),
                attachment.fileType(),
                attachment.createdAt()
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
