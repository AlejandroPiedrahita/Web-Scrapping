<div align="center">

# 🚗 AutoData ETL Pipeline
**Plataforma de ingeniería de datos y orquestación ETL para extracción masiva de vehículos**

Scraping headless con Playwright · Limpieza con Pandas · Persistencia PL/pgSQL (PostgreSQL) · Arquitectura limpia Ports & Adapters
![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>

---

## 📖 Descripción general
**AutoData ETL Pipeline** es una plataforma full-stack de ingeniería de datos para la **extracción masiva de listados de vehículos** desde portales como **AutoTrader**, **Cars.com** y **Carvana**. El sistema aplica un ciclo completo **ETL** (Extract → Transform → Load):

- **Extract**: scraping headless con Playwright, evasión antibot (stealth), rotación de User-Agents y proxys residenciales IPv6, y mitigación de límites de tasa HTTP 429.
- **Transform**: limpieza y normalización con Pandas aplicando el estándar `ISO-VIN-2024.B` (validación de checksum ISO 3779), conversión de divisas a USD, sanitización estricta anti-inyección y deducción algorítmica de taxonomía/trim.
- **Load**: persistencia idempotente en **PostgreSQL** mediante procedimientos almacenados **PL/pgSQL**, con enrutamiento de registros inválidos a una **Dead-Letter Queue (DLQ)**.

El proyecto expone, además, un **dashboard de monitoreo en tiempo real** (React + Vite) que visualiza métricas del pipeline, la consola de auditoría, la malla de proxys, la salud del esquema y el búfer de datos limpios.

---

## 🏗️ Arquitectura
El backend sigue una **arquitectura limpia (Ports & Adapters / Hexagonal)**, separando el dominio de la infraestructura:

```
backend/app/
├── core/                          # Núcleo del dominio (independiente de frameworks)
│   ├── entities.py                # Entidades canónicas Pydantic (VehicleRaw, VehicleClean, etc.)
│   ├── ports.py                   # Contratos abstractos (puertos de entrada/salida)
│   ├── config.py                  # Configuración tipada con Pydantic Settings
│   └── exceptions.py              # Excepciones de dominio en español técnico
├── domain/                        # Lógica de negocio pura
│   ├── cleaner.py                 # Motor de limpieza/normalización ISO-VIN-2024.B
│   └── strategies/                # Patrón Strategy por portal
│       ├── base_strategy.py       # Utilidades de stealth (UA, headers, TLS/JA3)
│       ├── autotrader.py          # Selectores y extracción AutoTrader
│       └── carscom.py             # Cars.com + Carvana
├── adapters/                      # Implementaciones concretas (driven adapters)
│   ├── scrapers/
│   │   └── playwright_scraper.py  # Flota de navegadores Playwright
│   └── persistence/
│       ├── models.py              # Modelos SQLAlchemy
│       └── postgres_repository.py # Repositorio + logger de auditoría PL/pgSQL
└── api/                           # Driving adapter (HTTP REST)
    ├── main.py                    # Aplicación FastAPI
    └── routes/                    # Endpoints REST por dominio
```

### Puertos arquitectónicos (`core/ports.py`)

| Puerto | Rol | Implementación |
|--------|-----|----------------|
| `ScraperStrategyPort` | Estrategia de scraping por portal | `AutoTraderScraperStrategy`, `CarsComScraperStrategy`, `CarvanaScraperStrategy` |
| `VehicleCleanerPort` | Limpieza y deducción de dominio | `VehicleCleanerService` |
| `VehicleRepositoryPort` | Persistencia en PostgreSQL | `PostgresVehicleRepository` |
| `AuditLoggerPort` | Telemetría y logs | `PostgresVehicleRepository` |

---

## ✨ Características principales
### 🔎 Extracción (Playwright + Stealth)
- Navegación **headless** con Chromium y soporte de proxies residenciales.
- **Anti-detección**: ocultamiento de `navigator.webdriver`, rotación de User-Agents y headers realistas (`Sec-Ch-Ua`, etc.).
- **Simulación humana**: movimiento de ratón con interpolación de curvas Bézier y scroll inercial con rebote.
- **Mitigación de HTTP 429**: detección de rate-limit y rotación automática de IP con backoff.
- **Selectores con heurística de rescate** ante deriva del DOM (`DOMSelectorDriftException`).

### 🧹 Transformación (Pandas + Reglas de negocio)
- **Validación de VIN ISO 3779** (17 caracteres, dígito verificador módulo 11, transliteración de caracteres).
- **Sanitización activa anti-XSS y anti-SQL Injection** con patrones de ataque conocidos.
- **Normalización de precios**: limpieza de símbolos, conversión FX (`CAD`, `EUR`, `GBP` → `USD`) y acotamiento `$500 – $250,000 USD`.
- **Normalización de odómetro**: conversión `km → millas` y acotamiento `0 – 350,000 mi`.
- **Deducción de taxonomía/Trim** por reglas léxicas (Porsche, BMW, Tesla, Ford, Toyota, etc.).
- **Valor depreciado estimado** por matriz algorítmica (edad + millaje).
- **Hash SHA-256 de idempotencia** por registro.
- **Procesamiento vectorizado** en lotes por `DataFrame`.

### 💾 Carga (PL/pgSQL + Idempotencia)
- **Upsert atómico** vía `ON CONFLICT (vin, source_portal)` para resolución idempotente.
- **Inserción masiva por lotes** con control transaccional (`proc_merge_batch`).
- **Dead-Letter Queue** (`vehicles_dlq`) para registros que fallan la cuarentena de calidad.
- **Registro de auditoría** automático en cada operación de escritura.

### 📊 Monitoreo (Dashboard React)
- Tarjetas Bento de métricas en tiempo real.
- Consola de auditoría con streaming de logs y filtros por severidad.
- Tabla de la malla de proxys y nodos de trabajadores.
- Tarjeta de salud del esquema con tasas de aprobación por regla.
- Previsualización del búfer de datos limpios.
- Vistas de Arquitectura, "Cómo funciona" y Simulador ETL interactivo.

---

## 🔌 API REST
Base URL por defecto: `http://localhost:8000`

### Salud
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Comprobación de salud (liveness/readiness para Kubernetes/Docker) |

### Métricas de clúster — `/api/v1/metrics`
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/metrics` | Métricas en tiempo real (tarjetas Bento) |
| `GET` | `/api/v1/metrics/schema-health` | Desglose de reglas de negocio y calidad |

### Control de pipeline — `/api/v1/pipeline`
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/pipeline/run` | Dispara una ejecución de ingestión |
| `POST` | `/api/v1/pipeline/emergency-stop` | Detiene todos los trabajadores Playwright |

### Previsualización de datos — `/api/v1/data`
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/data/preview` | Últimos vehículos limpios (buffer de ingesta) |
| `GET` | `/api/v1/data/export-csv` | Exporta los datos limpios en formato CSV |

### Telemetría — `/api/v1/telemetry`
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/telemetry/logs` | Stream de logs de auditoría (filtros: `level`, `limit`) |

Documentación interactiva disponible en `/docs` (Swagger UI) y `/redoc`.

---

## 🗄️ Esquema de base de datos
El esquema vive en el schema `autodata_core` (PostgreSQL 14+ / TimescaleDB):

| Tabla | Propósito |
|-------|-----------|
| `vehicles_clean` | Data warehouse / búfer de vehículos canónicos limpios |
| `vehicles_dlq` | Cola de mensajes muertos (cuarentena de registros inválidos) |
| `pipeline_audit_logs` | Logs de auditoría y telemetría del clúster |
| `proxy_nodes` | Estado del pool de proxys residenciales |
| `worker_nodes` | Nodos del clúster Kubernetes |

**Procedimientos y funciones PL/pgSQL** (`02_plsql_procedures.sql`):

| Objeto | Descripción |
|--------|-------------|
| `proc_merge_vehicle(...)` | Upsert idempotente de un vehículo + log de auditoría |
| `proc_merge_batch(...)` | Ingesta masiva por lotes desde JSONB |
| `proc_log_audit_event(...)` | Registro de eventos de telemetría |
| `proc_get_realtime_metrics()` | Métricas agregadas en tiempo real |

---

## 🚀 Puesta en marcha
### Requisitos previos
- **Node.js** ≥ 18 (frontend)
- **Python** ≥ 3.9 (backend) — el Dockerfile usa 3.11
- **PostgreSQL** 14+ (o usar Docker Compose)
- **Docker + Docker Compose** (opcional, recomendado)

### 🐳 Opción A — Docker Compose (recomendado)

Levanta PostgreSQL, la API FastAPI y la flota de trabajadores Playwright en una sola red:

```bash
cd backend
docker compose up --build
```

Servicios expuestos:
- PostgreSQL → `localhost:5432`
- API FastAPI → `http://localhost:8000`

> El esquema y los procedimientos PL/pgSQL se inicializan automáticamente desde `backend/database/` en el primer arranque.

### 🐍 Opción B — Backend manual
```bash
cd backend
# 1. Crear y activar entorno virtual
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate
# 2. Instalar dependencias
pip install -r requirements.txt
# 3. Instalar el navegador Chromium de Playwright
python -m playwright install --with-deps chromium
# 4. Configurar variables de entorno
copy .env.example .env      # Windows
# cp .env.example .env      # Linux/macOS
# 5. Ejecutar la API
uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### ⚛️ Frontend (Dashboard)

```bash
# Desde la raíz del proyecto
npm install
npm run dev
```

El dashboard queda disponible en `http://localhost:3000`.

### 📜 Scripts disponibles (frontend)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Vite en puerto 3000 |
| `npm run build` | Compila la aplicación para producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Verificación de tipos con `tsc --noEmit` |
| `npm run clean` | Limpia el directorio `dist` |

---

## ⚙️ Variables de entorno
El backend carga la configuración desde `backend/.env` (ver `backend/.env.example`). Valores principales:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `ENVIRONMENT` | `production` | Entorno activo |
| `LOG_LEVEL` | `INFO` | Nivel de logs de auditoría |
| `API_HOST` / `API_PORT` | `0.0.0.0` / `8000` | Enlace del servicio FastAPI |
| `DB_HOST` / `DB_PORT` | `postgres-primary` / `5432` | Conexión PostgreSQL |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `autodata_admin` / — / `autodata_db` | Credenciales DB |
| `DB_POOL_SIZE` / `DB_MAX_OVERFLOW` | `20` / `10` | Pool de conexiones SQLAlchemy |
| `PLAYWRIGHT_HEADLESS` | `true` | Modo sin interfaz gráfica |
| `PLAYWRIGHT_WORKER_CONCURRENCY` | `32` | Navegadores concurrentes |
| `PLAYWRIGHT_NAVIGATION_TIMEOUT_MS` | `30000` | Timeout de navegación |
| `STEALTH_PROFILE_VERSION` | `v4.2` | Perfil de evasión antibot |
| `PROXY_ROTATION_STRATEGY` | `residential_ipv6_auto` | Estrategia de rotación de IP |
| `RESIDENTIAL_PROXY_GATEWAY` | — | Pasarela de salida de proxys |
| `PROXY_MAX_RETRIES` | `5` | Reintentos ante HTTP 429 |
| `ADAPTIVE_JITTER_MIN_MS` / `_MAX_MS` | `300` / `1250` | Jitter adaptativo |
| `MAX_NULL_FIELD_LIMIT` | `3` | Nulos máximos antes de DLQ |
| `MIN_PRICE_USD` / `MAX_PRICE_USD` | `500` / `250000` | Cotas de precio |
| `DEAD_LETTER_QUEUE_ENABLED` | `true` | Enrutamiento a DLQ |

> ℹ️ La raíz del proyecto usa `GEMINI_API_KEY` y `APP_URL` (ver `.env.example`) para las capacidades de IA / despliegue.

---

## 🧪 Pruebas (QA)

La suite de pruebas valida la conformidad con `ISO-VIN-2024.B` y las reglas de calidad/seguridad:

```bash
cd backend
pytest -v
```

Cobertura de casos:
- ✅ Limpieza y normalización de un registro válido (`Clean Valid`).
- ✅ Conversión de divisas (`CAD → USD`) y odómetro (`km → millas`).
- ✅ Rechazo de VIN con checksum ISO 3779 inválido.
- ✅ Neutralización de XSS (`<script>`) y SQL Injection (`' OR '1'='1`, `DROP TABLE`, `UNION SELECT`).
- ✅ Rechazo de precios fuera de rango (`$500 – $250,000 USD`).
- ✅ Rechazo por umbral de nulos SLA excedido (`> 3` campos nulos).
- ✅ Procesamiento vectorizado por lotes con Pandas.

---

## 📂 Estructura del proyecto
```
autodata-etl-pipeline/
├── backend/                       # Backend FastAPI + ETL (Python)
│   ├── app/                       # Código fuente (arquitectura hexagonal)
│   ├── database/                  # Esquema SQL + procedimientos PL/pgSQL
│   ├── tests/                     # Suite de pruebas pytest
│   ├── Dockerfile                 # Build multi-stage (Python 3.11 + Playwright)
│   ├── docker-compose.yml         # Orquestación multi-contenedor
│   └── requirements.txt           # Dependencias Python
├── src/                           # Frontend React + TypeScript
│   ├── components/                # Componentes del dashboard
│   ├── data/                      # Datos mock
│   ├── types.ts                   # Tipos TypeScript
│   └── App.tsx                    # Componente raíz
├── index.html                     # Entry point Vite
├── package.json                   # Dependencias y scripts frontend
├── vite.config.ts                 # Configuración Vite + Tailwind
├── tsconfig.json                  # Configuración TypeScript
└── metadata.json                  # Metadatos del proyecto
```

---

## 🛠️ Stack tecnológico
**Backend**: Python · FastAPI · Uvicorn · Pydantic v2 · Playwright · Pandas · NumPy · SQLAlchemy (async) · asyncpg · PostgreSQL / PL/pgSQL · pytest
**Frontend**: React 19 · TypeScript · Vite · TailwindCSS v4 · lucide-react · motion
**Infraestructura**: Docker · Docker Compose · Chromium headless · Proxys residenciales IPv6
---

## 📄 Licencia
Este proyecto es de uso privado. Consulta con el autor para detalles de licencia.

---

<div align="center">

Desarrollado con ❤️ para ingeniería de datos automotriz
</div>
