-- Restore the shared demo password used by the backoffice.
UPDATE mun_users
SET password_hash = '$2y$10$RzH/YU3bs5D1ypai4zEZIeUyh4CL8yugpE7nmEmKdo5gkbxj25.7O'
WHERE email IN (
  'vecino1@creixell.cat',
  'operario@creixell.cat',
  'admin@creixell.cat',
  'vecino1@altafulla.cat',
  'operario@altafulla.cat',
  'admin@altafulla.cat'
);
