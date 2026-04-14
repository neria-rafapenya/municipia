package com.neria_municipio.api.infrastructure.adapter.out.persistence.entity;

import com.neria_municipio.api.domain.model.IncidentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;


@Entity
@Table(name = "mun_incident_history")
public class IncidentHistoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private IncidentEntity incident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipality_id", nullable = false)
    private MunicipalityEntity municipality;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id")
    private UserEntity changedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", nullable = false, columnDefinition = "ENUM('OPEN','IN_PROGRESS','RESOLVED','REJECTED')")
    private IncidentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, columnDefinition = "ENUM('OPEN','IN_PROGRESS','RESOLVED','REJECTED')")
    private IncidentStatus newStatus;

    @Column(name = "changed_at", insertable = false, updatable = false)
    private Instant changedAt;

    @Column(name = "operator_comment", columnDefinition = "TEXT")
    private String operatorComment;

    public IncidentHistoryEntity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public IncidentEntity getIncident() {
        return incident;
    }

    public void setIncident(IncidentEntity incident) {
        this.incident = incident;
    }

    public MunicipalityEntity getMunicipality() {
        return municipality;
    }

    public void setMunicipality(MunicipalityEntity municipality) {
        this.municipality = municipality;
    }

    public UserEntity getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(UserEntity changedBy) {
        this.changedBy = changedBy;
    }

    public IncidentStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(IncidentStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public IncidentStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(IncidentStatus newStatus) {
        this.newStatus = newStatus;
    }

    public Instant getChangedAt() {
        return changedAt;
    }

    public String getOperatorComment() {
        return operatorComment;
    }

    public void setOperatorComment(String operatorComment) {
        this.operatorComment = operatorComment;
    }
}
