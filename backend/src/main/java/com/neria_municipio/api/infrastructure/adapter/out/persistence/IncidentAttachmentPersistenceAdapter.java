package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.IncidentAttachmentPort;
import com.neria_municipio.api.domain.model.IncidentAttachment;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentAttachmentEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.IncidentAttachmentRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.IncidentRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.MunicipalityRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class IncidentAttachmentPersistenceAdapter implements IncidentAttachmentPort {
    private final IncidentAttachmentRepository attachmentRepository;
    private final IncidentRepository incidentRepository;
    private final MunicipalityRepository municipalityRepository;

    public IncidentAttachmentPersistenceAdapter(
            IncidentAttachmentRepository attachmentRepository,
            IncidentRepository incidentRepository,
            MunicipalityRepository municipalityRepository
    ) {
        this.attachmentRepository = attachmentRepository;
        this.incidentRepository = incidentRepository;
        this.municipalityRepository = municipalityRepository;
    }

    @Override
    public List<IncidentAttachment> saveAll(List<IncidentAttachment> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return List.of();
        }
        Long incidentId = attachments.get(0).incidentId();
        Long municipalityId = attachments.get(0).municipalityId();
        IncidentEntity incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        MunicipalityEntity municipality = municipalityRepository.findById(municipalityId)
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));

        List<IncidentAttachmentEntity> entities = attachments.stream().map(att -> {
            IncidentAttachmentEntity entity = new IncidentAttachmentEntity();
            entity.setIncident(incident);
            entity.setMunicipality(municipality);
            entity.setFileUrl(att.fileUrl());
            entity.setFileName(att.fileName());
            entity.setFileType(att.fileType());
            return entity;
        }).toList();

        return attachmentRepository.saveAll(entities).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<IncidentAttachment> findByIncidentId(Long incidentId) {
        return attachmentRepository.findByIncident_Id(incidentId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<IncidentAttachment> findByIncidentIds(List<Long> incidentIds) {
        if (incidentIds == null || incidentIds.isEmpty()) {
            return List.of();
        }
        return attachmentRepository.findByIncident_IdIn(incidentIds).stream()
                .map(this::toDomain)
                .toList();
    }

    private IncidentAttachment toDomain(IncidentAttachmentEntity entity) {
        return new IncidentAttachment(
                entity.getId(),
                entity.getIncident().getId(),
                entity.getMunicipality().getId(),
                entity.getFileUrl(),
                entity.getFileName(),
                entity.getFileType(),
                entity.getCreatedAt()
        );
    }
}
