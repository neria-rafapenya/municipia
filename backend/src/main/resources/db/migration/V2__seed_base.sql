INSERT INTO mun_municipalities (id, name, postal_code, config_json)
SELECT 1, 'Sample Municipality', '00000', '{"theme":"default"}'
WHERE NOT EXISTS (SELECT 1 FROM mun_municipalities WHERE id = 1);

INSERT INTO mun_categories (municipality_id, name, description, active)
SELECT 1, 'Lighting', 'Street lighting issues', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM mun_categories WHERE municipality_id = 1 AND name = 'Lighting'
);

INSERT INTO mun_categories (municipality_id, name, description, active)
SELECT 1, 'Water', 'Water leaks or supply problems', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM mun_categories WHERE municipality_id = 1 AND name = 'Water'
);

INSERT INTO mun_categories (municipality_id, name, description, active)
SELECT 1, 'Cleaning', 'Street cleaning and waste', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM mun_categories WHERE municipality_id = 1 AND name = 'Cleaning'
);
