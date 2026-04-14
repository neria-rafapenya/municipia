-- Mock data for mun_ tables

INSERT INTO mun_municipalities (id, name, postal_code, config_json)
VALUES
  (1, 'Creixell', '43839', '{"theme":"creixell","primary":"#1f7a8c"}'),
  (2, 'Altafulla', '43893', '{"theme":"altafulla","primary":"#ef476f"}')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  postal_code = VALUES(postal_code),
  config_json = VALUES(config_json);

INSERT INTO mun_users (id, municipality_id, email, password_hash, role)
VALUES
  (1, 1, 'vecino1@creixell.cat', '$2y$10$K5EzX8tjDdZ.PaVnefJhXu0RPiot5DJSjxQxkuNI4rlqepbFvzcrS', 'NEIGHBOR'),
  (2, 1, 'operario@creixell.cat', '$2y$10$K5EzX8tjDdZ.PaVnefJhXu0RPiot5DJSjxQxkuNI4rlqepbFvzcrS', 'OPERATOR'),
  (3, 1, 'admin@creixell.cat', '$2y$10$K5EzX8tjDdZ.PaVnefJhXu0RPiot5DJSjxQxkuNI4rlqepbFvzcrS', 'ADMIN'),
  (4, 2, 'vecino1@altafulla.cat', '$2y$10$K5EzX8tjDdZ.PaVnefJhXu0RPiot5DJSjxQxkuNI4rlqepbFvzcrS', 'NEIGHBOR'),
  (5, 2, 'operario@altafulla.cat', '$2y$10$K5EzX8tjDdZ.PaVnefJhXu0RPiot5DJSjxQxkuNI4rlqepbFvzcrS', 'OPERATOR'),
  (6, 2, 'admin@altafulla.cat', '$2y$10$K5EzX8tjDdZ.PaVnefJhXu0RPiot5DJSjxQxkuNI4rlqepbFvzcrS', 'ADMIN')
ON DUPLICATE KEY UPDATE
  municipality_id = VALUES(municipality_id),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role);

INSERT INTO mun_categories (id, municipality_id, name, description, active)
VALUES
  (1, 1, 'Lighting', 'Street lighting issues', TRUE),
  (2, 1, 'Water', 'Water leaks or supply problems', TRUE),
  (3, 1, 'Cleaning', 'Street cleaning and waste', TRUE),
  (4, 2, 'Roads', 'Potholes and road damage', TRUE),
  (5, 2, 'Parks', 'Parks maintenance', TRUE),
  (6, 2, 'Noise', 'Noise complaints', TRUE)
ON DUPLICATE KEY UPDATE
  municipality_id = VALUES(municipality_id),
  name = VALUES(name),
  description = VALUES(description),
  active = VALUES(active);

INSERT INTO mun_incidents (
  id, municipality_id, user_id, category_id, description,
  latitude, longitude, image_url, status, ai_confidence
)
VALUES
  (1, 1, 1, 1, 'Street light not working near the plaza', 41.05012345, 1.43781234, NULL, 'OPEN', 0.87),
  (2, 1, 2, 2, 'Water leak next to school', 41.05156789, 1.43651234, NULL, 'IN_PROGRESS', 0.91),
  (3, 1, 1, 3, 'Overflowing bins on main street', 41.04931234, 1.43811234, NULL, 'RESOLVED', 0.78),
  (4, 2, 4, 4, 'Pothole on coastal road', 41.14451234, 1.37221234, NULL, 'OPEN', 0.83),
  (5, 2, 5, 5, 'Broken bench in central park', 41.14561234, 1.37111234, NULL, 'IN_PROGRESS', 0.69),
  (6, 2, 4, 6, 'Loud noise at night from construction', 41.14671234, 1.37001234, NULL, 'REJECTED', 0.55)
ON DUPLICATE KEY UPDATE
  municipality_id = VALUES(municipality_id),
  user_id = VALUES(user_id),
  category_id = VALUES(category_id),
  description = VALUES(description),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude),
  image_url = VALUES(image_url),
  status = VALUES(status),
  ai_confidence = VALUES(ai_confidence);

INSERT INTO mun_incident_history (
  id, incident_id, municipality_id, previous_status, new_status, operator_comment
)
VALUES
  (1, 2, 1, 'OPEN', 'IN_PROGRESS', 'Assigned to water crew'),
  (2, 3, 1, 'OPEN', 'RESOLVED', 'Bins collected and area cleaned'),
  (3, 6, 2, 'OPEN', 'REJECTED', 'Issue outside municipality scope')
ON DUPLICATE KEY UPDATE
  incident_id = VALUES(incident_id),
  municipality_id = VALUES(municipality_id),
  previous_status = VALUES(previous_status),
  new_status = VALUES(new_status),
  operator_comment = VALUES(operator_comment);

INSERT INTO mun_chatbot_logs (id, municipality_id, user_id, prompt, response)
VALUES
  (1, 1, 1, 'How do I report a broken lamp?', '{"answer":"Open the app and create a new incident."}'),
  (2, 2, 4, 'Is there any update on my report?', '{"answer":"Your report is currently being reviewed."}')
ON DUPLICATE KEY UPDATE
  municipality_id = VALUES(municipality_id),
  user_id = VALUES(user_id),
  prompt = VALUES(prompt),
  response = VALUES(response);
