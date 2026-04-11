CREATE TABLE IF NOT EXISTS mun_municipalities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  config_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mun_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  municipality_id BIGINT NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('NEIGHBOR','OPERATOR','ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_mun_users_email (email),
  INDEX idx_mun_users_municipality (municipality_id),
  CONSTRAINT fk_mun_users_municipality
    FOREIGN KEY (municipality_id) REFERENCES mun_municipalities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mun_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  municipality_id BIGINT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mun_categories_municipality (municipality_id),
  CONSTRAINT fk_mun_categories_municipality
    FOREIGN KEY (municipality_id) REFERENCES mun_municipalities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mun_incidents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  municipality_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  description TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  image_url VARCHAR(255),
  status ENUM('OPEN','IN_PROGRESS','RESOLVED','REJECTED') NOT NULL DEFAULT 'OPEN',
  ai_confidence FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mun_incidents_municipality (municipality_id),
  INDEX idx_mun_incidents_user (user_id),
  INDEX idx_mun_incidents_category (category_id),
  CONSTRAINT fk_mun_incidents_municipality
    FOREIGN KEY (municipality_id) REFERENCES mun_municipalities(id),
  CONSTRAINT fk_mun_incidents_user
    FOREIGN KEY (user_id) REFERENCES mun_users(id),
  CONSTRAINT fk_mun_incidents_category
    FOREIGN KEY (category_id) REFERENCES mun_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mun_incident_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  incident_id BIGINT NOT NULL,
  municipality_id BIGINT NOT NULL,
  previous_status ENUM('OPEN','IN_PROGRESS','RESOLVED','REJECTED') NOT NULL,
  new_status ENUM('OPEN','IN_PROGRESS','RESOLVED','REJECTED') NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  operator_comment TEXT,
  INDEX idx_mun_incident_history_incident (incident_id),
  INDEX idx_mun_incident_history_municipality (municipality_id),
  CONSTRAINT fk_mun_incident_history_incident
    FOREIGN KEY (incident_id) REFERENCES mun_incidents(id),
  CONSTRAINT fk_mun_incident_history_municipality
    FOREIGN KEY (municipality_id) REFERENCES mun_municipalities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mun_chatbot_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  municipality_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mun_chatbot_logs_municipality (municipality_id),
  INDEX idx_mun_chatbot_logs_user (user_id),
  CONSTRAINT fk_mun_chatbot_logs_municipality
    FOREIGN KEY (municipality_id) REFERENCES mun_municipalities(id),
  CONSTRAINT fk_mun_chatbot_logs_user
    FOREIGN KEY (user_id) REFERENCES mun_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
