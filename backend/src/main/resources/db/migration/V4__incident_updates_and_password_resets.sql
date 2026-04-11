ALTER TABLE mun_incidents
  ADD COLUMN assigned_operator_id BIGINT NULL,
  ADD COLUMN resolution_image_url VARCHAR(255) NULL;

ALTER TABLE mun_incidents
  ADD INDEX idx_mun_incidents_assigned_operator (assigned_operator_id),
  ADD CONSTRAINT fk_mun_incidents_assigned_operator
    FOREIGN KEY (assigned_operator_id) REFERENCES mun_users(id);

ALTER TABLE mun_incident_history
  ADD COLUMN changed_by_user_id BIGINT NULL;

ALTER TABLE mun_incident_history
  ADD INDEX idx_mun_incident_history_changed_by (changed_by_user_id),
  ADD CONSTRAINT fk_mun_incident_history_changed_by
    FOREIGN KEY (changed_by_user_id) REFERENCES mun_users(id);

CREATE TABLE mun_password_resets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token VARCHAR(128) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_mun_password_resets_token (token),
  INDEX idx_mun_password_resets_user (user_id),
  CONSTRAINT fk_mun_password_resets_user
    FOREIGN KEY (user_id) REFERENCES mun_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
