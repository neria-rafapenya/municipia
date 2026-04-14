ALTER TABLE mun_incidents
    ADD COLUMN location_accuracy DECIMAL(10, 2) NULL AFTER longitude,
    ADD COLUMN location_captured_at TIMESTAMP NULL AFTER location_accuracy;
