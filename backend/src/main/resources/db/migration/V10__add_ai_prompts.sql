CREATE TABLE IF NOT EXISTS mun_ai_prompts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  municipality_id BIGINT NOT NULL,
  prompt_key VARCHAR(50) NOT NULL,
  system_prompt TEXT NOT NULL,
  model VARCHAR(100),
  temperature FLOAT DEFAULT 0.2,
  max_history INT DEFAULT 16,
  enabled TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_mun_ai_prompts (municipality_id, prompt_key),
  INDEX idx_mun_ai_prompts_municipality (municipality_id),
  CONSTRAINT fk_mun_ai_prompts_municipality
    FOREIGN KEY (municipality_id) REFERENCES mun_municipalities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
