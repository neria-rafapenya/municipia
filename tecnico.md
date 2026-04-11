

# MEMORIA TÉCNICA: PLATAFORMA MUNICIPIA

## 1. Stack Tecnológico y Arquitectura
* **Backend:** Java 17 / Spring Boot 3.4 (LTS).
* **Arquitectura:** Hexagonal (Ports & Adapters) para desacoplar la lógica de negocio de la base de datos y los servicios de IA.
* **Mobile:** React Native + Expo (Managed Workflow) para optimizar el despliegue en iOS y Android.
* **Persistencia:** MySQL 8.0 con soporte para *Multi-tenancy* (aislamiento de datos por municipio).

---

## 2. Mapa de Navegación (Sitemap Técnico)
Este mapa describe la jerarquía de vistas de la aplicación móvil y su conexión con los servicios del backend.

### A. Capa Pública (Sin autenticación)
* **Pantalla de Bienvenida (Onboarding):** Presentación del municipio detectado por GPS.
* **Registro / Login:**
    * Formulario de acceso.
    * Validación de identidad (Integración con API de SMS o Email).
    * *Backend:* `AuthService` -> `TokenProvider (JWT)`.

### B. Capa de Usuario (Vecino)
* **Dashboard Principal:**
    * Widget de clima y alertas locales.
    * Acceso directo a "Nueva Incidencia".
* **Módulo de Incidencias (IA Core):**
    * **Cámara:** Captura de imagen.
    * **Preview & AI Tagging:** La IA devuelve etiquetas sugeridas (ej. "Mobiliario Urbano", "Limpieza").
    * **Confirmación y Envío:** Envío de coordenadas GPS y metadatos.
* **Historial de Reportes:**
    * Listado con estados (Timeline de resolución).
* **Mapa de Ciudad:**
    * Visualización de puntos de interés y avisos activos.

### C. Capa de Administración (Operario/Gestor)
* **Bandeja de Entrada de Tareas:** Filtro por prioridad asignada por la IA.
* **Detalle de Orden de Trabajo:** Mapa de ruta para llegar a la incidencia y botón de "Finalizar" (con foto de prueba).

---

## 3. Estructura de Proyecto (Arquitectura Hexagonal)
Para que el equipo de desarrollo lo entienda, la estructura de carpetas en el backend Java debe seguir este patrón:

```text
com.municipia.api
├── domain (Reglas de negocio puras)
│   ├── model (User, Incident, Municipality)
│   └── service (IncidentLogic)
├── application (Casos de uso - Puertos)
│   ├── port
│   │   ├── in (Input: UseCases)
│   │   └── out (Output: Persistence/External Services)
│   └── usecase (CreateIncidentUseCase)
└── infrastructure (Adaptadores)
    ├── adapter
    │   ├── in
    │   │   └── web (Controllers REST)
    │   └── out
    │       ├── persistence (Spring Data JPA / MySQL)
    │       └── ai (Client OpenAI/TensorFlow)
    └── config (Bean definitions)
```

---

## 4. Diseño de Base de Datos (MySQL)
El esquema debe soportar el aislamiento de datos (Multi-tenancy). Cada tabla crítica incluye un `municipio_id`.

* **Tabla `municipios`:** `id (PK)`, `nombre`, `config_api_key`, `geofencing_coords`.
* **Tabla `incidencias`:** `id (PK)`, `municipio_id (FK)`, `usuario_id`, `categoria_ia`, `estado (ENUM)`, `latitud`, `longitud`, `evidencia_url`.

---















## 7. Diseño de Base de Datos (MySQL)

Para garantizar la organización y seguridad del esquema, todas las tablas del ecosistema **MunicipIA** utilizarán el prefijo `mun_`. La relación entre tablas está diseñada para mantener la integridad referencial y el aislamiento por municipio.

### 7.1. Diccionario de Tablas y Correspondencias

| Nombre de Tabla | Propósito | Relaciones Principales |
| :--- | :--- | :--- |
| **`mun_ayuntamientos`** | Almacena los datos maestros de cada municipio (Creixell, etc.). | Tabla raíz. |
| **`mun_usuarios`** | Ciudadanos, operarios y administradores. | Relacionada con `mun_ayuntamientos`. |
| **`mun_categorias`** | Tipos de incidencias (Luz, Agua, Limpieza). | Relacionada con `mun_ayuntamientos`. |
| **`mun_incidencias`** | El núcleo del sistema: reportes ciudadanos. | Relacionada con `mun_usuarios` y `mun_categorias`. |
| **`mun_incidencias_historial`** | Log de cambios de estado (Trazabilidad). | Relacionada con `mun_incidencias`. |
| **`mun_chatbot_logs`** | Registro de consultas IA para entrenamiento. | Relacionada con `mun_usuarios`. |

---

### 7.2. Definición Técnica de Correspondencias (Esquema)

A continuación, se detallan los campos clave para la implementación en el **Backend Java Spring Boot (JPA)**:

#### A. Tabla `mun_ayuntamientos` (Maestra)
* `id` (PK, BigInt)
* `nombre` (Varchar 100)
* `codigo_postal` (Varchar 10)
* `config_json` (Text): Almacena colores de la App, logos y coordenadas del geofencing.

#### B. Tabla `mun_usuarios`
* `id` (PK, BigInt)
* `mun_id` (FK -> `mun_ayuntamientos.id`): **Clave para el aislamiento de datos.**
* `email` (Varchar 100, Unique)
* `password_hash` (Varchar 255)
* `rol` (Enum: 'VECINO', 'OPERARIO', 'ADMIN')

#### C. Tabla `mun_incidencias`
* `id` (PK, BigInt)
* `mun_id` (FK -> `mun_ayuntamientos.id`)
* `user_id` (FK -> `mun_usuarios.id`)
* `cat_id` (FK -> `mun_categorias.id`)
* `descripcion` (Text)
* `latitud` / `longitud` (Decimal 10,8)
* `imagen_url` (Varchar 255)
* `estado` (Enum: 'ABIERTA', 'PROCESO', 'RESUELTA', 'RECHAZADA')
* `ia_confidence` (Float): Nivel de certeza del modelo de visión artificial.

#### D. Tabla `mun_incidencias_historial`
* `id` (PK, BigInt)
* `incidencia_id` (FK -> `mun_incidencias.id`)
* `estado_anterior` / `estado_nuevo` (Enum)
* `fecha_cambio` (Timestamp)
* `comentario_operario` (Text)

---

### 7.3. Implementación en Spring Boot (Entity Mapping)

Para que el desarrollador sepa cómo mapear esto en Java, deberá usar la anotación `@Table` de la siguiente manera:

```java
@Entity
@Table(name = "mun_incidencias")
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mun_id")
    private Municipality municipality;

    // Resto de atributos...
}
```


NOTA IMPORTANTE, las tablas y los campos deben crearse en inglés, aquneue en este inofrme aparezcan en español.
