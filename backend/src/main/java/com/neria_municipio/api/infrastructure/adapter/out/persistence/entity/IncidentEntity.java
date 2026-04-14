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
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "mun_incidents")
public class IncidentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipality_id", nullable = false)
    private MunicipalityEntity municipality;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_operator_id")
    private UserEntity assignedOperator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "location_accuracy", precision = 10, scale = 2)
    private BigDecimal locationAccuracy;

    @Column(name = "location_captured_at")
    private Instant locationCapturedAt;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "resolution_image_url", length = 255)
    private String resolutionImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('OPEN','IN_PROGRESS','RESOLVED','REJECTED')")
    private IncidentStatus status = IncidentStatus.OPEN;

    @Column(name = "ai_confidence")
    private Float aiConfidence;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;

    public IncidentEntity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MunicipalityEntity getMunicipality() {
        return municipality;
    }

    public void setMunicipality(MunicipalityEntity municipality) {
        this.municipality = municipality;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public UserEntity getAssignedOperator() {
        return assignedOperator;
    }

    public void setAssignedOperator(UserEntity assignedOperator) {
        this.assignedOperator = assignedOperator;
    }

    public CategoryEntity getCategory() {
        return category;
    }

    public void setCategory(CategoryEntity category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getLocationAccuracy() {
        return locationAccuracy;
    }

    public void setLocationAccuracy(BigDecimal locationAccuracy) {
        this.locationAccuracy = locationAccuracy;
    }

    public Instant getLocationCapturedAt() {
        return locationCapturedAt;
    }

    public void setLocationCapturedAt(Instant locationCapturedAt) {
        this.locationCapturedAt = locationCapturedAt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getResolutionImageUrl() {
        return resolutionImageUrl;
    }

    public void setResolutionImageUrl(String resolutionImageUrl) {
        this.resolutionImageUrl = resolutionImageUrl;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public Float getAiConfidence() {
        return aiConfidence;
    }

    public void setAiConfidence(Float aiConfidence) {
        this.aiConfidence = aiConfidence;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
