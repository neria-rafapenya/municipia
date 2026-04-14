CREATE TABLE IF NOT EXISTS mun_news (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  municipality_id BIGINT NOT NULL,
  title VARCHAR(160) NOT NULL,
  summary VARCHAR(500),
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mun_news_municipality
    FOREIGN KEY (municipality_id) REFERENCES mun_municipalities(id)
);

CREATE INDEX idx_mun_news_municipality ON mun_news (municipality_id);
