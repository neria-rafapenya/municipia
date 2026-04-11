INSERT INTO mun_users (municipality_id, email, password_hash, role)
VALUES
  (1, 'vecino1@creixell.cat', '$2y$10$UEuinE3zv5XnQ0suc2HtZO4V4R4l1AdpVQvtuJenz1erfHXsJBvUy', 'NEIGHBOR'),
  (1, 'operario@creixell.cat', '$2y$10$UEuinE3zv5XnQ0suc2HtZO4V4R4l1AdpVQvtuJenz1erfHXsJBvUy', 'OPERATOR'),
  (1, 'admin@creixell.cat', '$2y$10$UEuinE3zv5XnQ0suc2HtZO4V4R4l1AdpVQvtuJenz1erfHXsJBvUy', 'ADMIN'),
  (2, 'vecino1@altafulla.cat', '$2y$10$UEuinE3zv5XnQ0suc2HtZO4V4R4l1AdpVQvtuJenz1erfHXsJBvUy', 'NEIGHBOR'),
  (2, 'operario@altafulla.cat', '$2y$10$UEuinE3zv5XnQ0suc2HtZO4V4R4l1AdpVQvtuJenz1erfHXsJBvUy', 'OPERATOR'),
  (2, 'admin@altafulla.cat', '$2y$10$UEuinE3zv5XnQ0suc2HtZO4V4R4l1AdpVQvtuJenz1erfHXsJBvUy', 'ADMIN')
ON DUPLICATE KEY UPDATE
  municipality_id = VALUES(municipality_id),
  password_hash = VALUES(password_hash),
  role = VALUES(role);
