CREATE TABLE IF NOT EXISTS mun_incident_attachments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  incident_id BIGINT NOT NULL,
  municipality_id BIGINT NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mun_incident_attachments_incident FOREIGN KEY (incident_id)
    REFERENCES mun_incidents(id) ON DELETE CASCADE,
  CONSTRAINT fk_mun_incident_attachments_municipality FOREIGN KEY (municipality_id)
    REFERENCES mun_municipalities(id) ON DELETE CASCADE,
  INDEX idx_mun_incident_attachments_incident (incident_id),
  INDEX idx_mun_incident_attachments_municipality (municipality_id)
);
