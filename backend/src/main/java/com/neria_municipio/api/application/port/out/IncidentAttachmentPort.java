package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.IncidentAttachment;
import java.util.List;

public interface IncidentAttachmentPort {
    List<IncidentAttachment> saveAll(List<IncidentAttachment> attachments);
    List<IncidentAttachment> findByIncidentId(Long incidentId);
    List<IncidentAttachment> findByIncidentIds(List<Long> incidentIds);
}
