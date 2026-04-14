UPDATE mun_users
SET password_hash = '$2y$10$K5EzX8tjDdZ.PaVnefJhXu0RPiot5DJSjxQxkuNI4rlqepbFvzcrS'
WHERE email IN (
  'vecino1@creixell.cat',
  'operario@creixell.cat',
  'admin@creixell.cat',
  'vecino1@altafulla.cat',
  'operario@altafulla.cat',
  'admin@altafulla.cat'
);
