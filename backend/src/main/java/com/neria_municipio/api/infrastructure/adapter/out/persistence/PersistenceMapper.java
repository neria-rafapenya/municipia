package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.domain.model.AiPrompt;
import com.neria_municipio.api.domain.model.Category;
import com.neria_municipio.api.domain.model.Incident;
import com.neria_municipio.api.domain.model.IncidentHistory;
import com.neria_municipio.api.domain.model.Municipality;
import com.neria_municipio.api.domain.model.News;
import com.neria_municipio.api.domain.model.User;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.CategoryEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.AiPromptEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.IncidentHistoryEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.NewsEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.UserEntity;

final class PersistenceMapper {
    private PersistenceMapper() {
    }

    static Municipality toDomain(MunicipalityEntity entity) {
        return new Municipality(
                entity.getId(),
                entity.getName(),
                entity.getPostalCode(),
                entity.getConfigJson()
        );
    }

    static User toDomain(UserEntity entity) {
        return new User(
                entity.getId(),
                entity.getMunicipality().getId(),
                entity.getFullName(),
                entity.getEmail(),
                entity.getAvatarUrl(),
                entity.getPasswordHash(),
                entity.getRole()
        );
    }

    static Category toDomain(CategoryEntity entity) {
        return new Category(
                entity.getId(),
                entity.getMunicipality().getId(),
                entity.getName(),
                entity.getDescription(),
                entity.isActive()
        );
    }

    static Incident toDomain(IncidentEntity entity) {
        return new Incident(
                entity.getId(),
                entity.getMunicipality().getId(),
                entity.getUser().getId(),
                entity.getAssignedOperator() != null ? entity.getAssignedOperator().getId() : null,
                entity.getCategory().getId(),
                entity.getDescription(),
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getLocationAccuracy(),
                entity.getLocationCapturedAt(),
                entity.getImageUrl(),
                entity.getResolutionImageUrl(),
                entity.getStatus(),
                entity.getAiConfidence()
        );
    }

    static IncidentHistory toDomain(IncidentHistoryEntity entity) {
        return new IncidentHistory(
                entity.getId(),
                entity.getIncident().getId(),
                entity.getMunicipality().getId(),
                entity.getChangedBy() != null ? entity.getChangedBy().getId() : null,
                entity.getPreviousStatus(),
                entity.getNewStatus(),
                entity.getChangedAt(),
                entity.getOperatorComment()
        );
    }

    static AiPrompt toDomain(AiPromptEntity entity) {
        return new AiPrompt(
                entity.getId(),
                entity.getMunicipality().getId(),
                entity.getPromptKey(),
                entity.getSystemPrompt(),
                entity.getModel(),
                entity.getTemperature(),
                entity.getMaxHistory(),
                entity.isEnabled()
        );
    }

    static News toDomain(NewsEntity entity) {
        return new News(
                entity.getId(),
                entity.getMunicipality().getId(),
                entity.getTitle(),
                entity.getSummary(),
                entity.getContent(),
                entity.getImageUrl(),
                entity.isActive()
        );
    }
}
