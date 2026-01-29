# Plataforma de Eventos Deportivos en Vivo

Sistema backend completo para gestión de eventos deportivos en tiempo real con seguimiento de asistencia y participación, construido con **NestJS**, **TypeORM**, **WebSockets (Socket.io)** y **Swagger**.

## Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución del Proyecto](#-ejecución-del-proyecto)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos y Funcionalidades](#-módulos-y-funcionalidades)
- [API REST Documentation](#-api-rest-documentation)
- [WebSocket Events](#-websocket-events)
- [Seguridad](#-seguridad)
- [Validaciones y Reglas de Negocio](#-validaciones-y-reglas-de-negocio)
- [Ejemplos de Uso](#-ejemplos-de-uso)
- [Testing](#-testing)

---

## Descripción

La **Plataforma de Eventos Deportivos en Vivo** es un sistema backend completo diseñado para:

- **Entrenadores**: Crear y gestionar equipos deportivos, programar eventos (entrenamientos, partidos, torneos), controlar asistencia y participación.
- **Jugadores**: Inscribirse en equipos y eventos, participar en salas de eventos en tiempo real con chat, solicitar cambios y tiempos fuera.
- **Administración en Tiempo Real**: Seguimiento de jugadores conectados, registro de participación, control de asistencia basado en tiempo de conexión.

El sistema implementa **WebSockets** para comunicación en tiempo real, permitiendo interacciones instantáneas durante eventos deportivos en vivo.

---

## Características Principales

### Gestión de Equipos (Teams)

- CRUD completo de equipos deportivos
- Categorías: sub-18, sub-21, libre, femenino, masculino, mixto
- Tipos de deporte: fútbol, básquet, voleibol, tenis, balonmano, otros
- Límite de jugadores por equipo configurable
- Etiquetas personalizables (entrenamiento, torneo, amistoso)
- Relación entrenador-equipo (un entrenador puede tener varios equipos)

### Gestión de Eventos (Events)

- Crear entrenamientos, partidos, amistosos y torneos
- Estados: scheduled, live, finished, cancelled
- Control de inicio/fin de eventos con validaciones temporales
- Límite opcional de asistentes por evento
- Solo el entrenador puede cambiar eventos a estado "live" o "finished"
- Restricción de edición para eventos live o finished

### Inscripción de Jugadores (PlayerEnrollment)

- Inscripción a equipos y/o eventos específicos
- Validación de límite máximo de jugadores
- Sistema de aprobación manual por el entrenador
- Estados: pending, approved, rejected
- Prevención de inscripciones duplicadas

### Asistencia y Participación (Attendance & Participation)

- **Asistencia automática**: El jugador es marcado presente si permanece conectado el tiempo mínimo configurado
- **Registro de participaciones**:
  - Mensajes en chat
  - Feedback táctico del entrenador
  - Solicitudes de cambio (substitution)
  - Solicitudes de tiempo fuera (timeout)
- Estadísticas detalladas: tasa de asistencia, tiempo promedio conectado, participaciones promedio
- Finalización automática de asistencia al terminar eventos

### WebSockets en Tiempo Real

- Salas independientes por evento (eventId)
- Chat en tiempo real del equipo
- Lista de jugadores conectados en vivo
- Notificaciones de eventos (inicio, fin, cambios de jugadores)
- Solicitudes de cambio y tiempo fuera en tiempo real
- Conteo de jugadores conectados actualizado constantemente

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        Clientes                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Frontend         │         │  Frontend         │          │
│  │  Jugadores        │         │  Entrenadores     │          │
│  │  (Port 4200)      │         │  (Port 4201)      │          │
│  └──────────────────┘         └──────────────────┘          │
└────────────┬─────────────────────────┬─────────────────────┘
             │                         │
             │ REST API + WebSocket    │
             │                         │
┌────────────▼─────────────────────────▼─────────────────────┐
│                    NestJS Backend                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Capa de Seguridad                      │   │
│  │  • Helmet • CORS • Rate Limiting • Throttling      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Middlewares                            │   │
│  │  • SportContext • Audit                            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌──────────┬──────────┬──────────┬──────────────────┐   │
│  │  Teams   │ Events   │ Player   │  Attendance      │   │
│  │  Module  │ Module   │Enrollment│  Module          │   │
│  │          │ +Gateway │ Module   │                  │   │
│  └──────────┴──────────┴──────────┴──────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TypeORM + SQLite                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologías Utilizadas

### Core Framework

- **NestJS 10.3**: Framework progresivo de Node.js
- **TypeScript 5.3**: Tipado estático
- **Node.js**: Runtime de JavaScript

### Base de Datos

- **TypeORM 0.3**: ORM para TypeScript y JavaScript
- **MySQL/MariaDB**: Base de datos relacional con soporte completo para ENUM y JSON

### Comunicación en Tiempo Real

- **Socket.io 4.6**: WebSockets bidireccionales
- **@nestjs/websockets**: Integración de WebSockets con NestJS
- **@nestjs/platform-socket.io**: Adaptador de Socket.io para NestJS

### Documentación

- **Swagger (OpenAPI) 7.2**: Documentación interactiva de API
- **@nestjs/swagger**: Integración de Swagger con NestJS

### Seguridad

- **Helmet 7.1**: Cabeceras de seguridad HTTP
- **@nestjs/throttler 5.1**: Rate limiting y throttling
- **CORS**: Control de acceso entre orígenes

### Validación

- **class-validator 0.14**: Validación de DTOs
- **class-transformer 0.5**: Transformación de objetos

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: Versión 18.x o superior
  - Descargar desde: https://nodejs.org/
  - Verificar instalación: `node --version`

- **npm**: Versión 9.x o superior (viene con Node.js)
  - Verificar instalación: `npm --version`

- **Git** (opcional, para clonar el repositorio)
  - Descargar desde: https://git-scm.com/

- **MySQL/MariaDB**: Base de datos relacional
  - MySQL: https://dev.mysql.com/downloads/installer/
  - MariaDB: https://mariadb.org/download/
  - HeidiSQL (cliente recomendado para Windows): https://www.heidisql.com/

---

## 🚀 Instalación

### Paso 1: Clonar o Descargar el Proyecto

Si tienes el código en un repositorio Git:

```powershell
git clone <URL_DEL_REPOSITORIO>
cd "Proyecto 4"
```

Si tienes el código comprimido, descomprímelo y navega a la carpeta.

### Paso 2: Instalar Dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```powershell
npm install
```

Este comando instalará todas las dependencias necesarias listadas en `package.json`. El proceso puede tomar algunos minutos.

### Paso 3: Configurar MySQL/MariaDB

1. Instala MySQL o MariaDB si aún no lo tienes
2. Crea una base de datos para el proyecto:

```sql
CREATE DATABASE sports_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Opcionalmente, crea un usuario específico:

```sql
CREATE USER 'sports_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON sports_events.* TO 'sports_user'@'localhost';
FLUSH PRIVILEGES;
```

4. Ejecuta el script de inicialización de la base de datos:

```powershell
mysql -u root -p sports_events < DATABASE_MYSQL_HEIDI.sql
```

---

## ⚙️ Configuración

### Paso 4: Crear Archivo de Variables de Entorno

Copia el archivo de ejemplo `.env.example` y renómbralo a `.env`:

```powershell
Copy-Item .env.example .env
```

### Paso 5: Configurar Variables de Entorno

Edita el archivo `.env` con tu editor de texto favorito y ajusta los valores según tus necesidades:

```env
# Application
PORT=3000
NODE_ENV=development

# CORS Origins - URLs de los frontends permitidos
CORS_ORIGIN_PLAYERS=http://localhost:4200
CORS_ORIGIN_COACHES=http://localhost:4201

# Rate Limiting
RATE_LIMIT_TTL=60          # Tiempo en segundos
RATE_LIMIT_MAX=100         # Máximo de requests por TTL
CHAT_RATE_LIMIT_TTL=10     # Tiempo para chat en segundos
CHAT_RATE_LIMIT_MAX=5      # Máximo de mensajes de chat por TTL

# Event Configuration
EVENT_START_MARGIN_MINUTES=15  # Margen de minutos antes de poder iniciar evento
MIN_ATTENDANCE_MINUTES=10      # Minutos mínimos conectado para marcar asistencia

# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=sports_events
```

**Descripción de las Variables**:

- `PORT`: Puerto donde correrá el servidor (por defecto 3000)
- `CORS_ORIGIN_PLAYERS`: URL del frontend de jugadores
- `CORS_ORIGIN_COACHES`: URL del frontend de entrenadores/administración
- `RATE_LIMIT_TTL`: Ventana de tiempo para rate limiting general (segundos)
- `RATE_LIMIT_MAX`: Número máximo de peticiones en la ventana de tiempo
- `CHAT_RATE_LIMIT_TTL`: Ventana de tiempo para mensajes de chat (segundos)
- `CHAT_RATE_LIMIT_MAX`: Número máximo de mensajes de chat permitidos
- `EVENT_START_MARGIN_MINUTES`: Minutos antes de la hora de inicio para poder iniciar un evento
- `MIN_ATTENDANCE_MINUTES`: Minutos mínimos que un jugador debe estar conectado para marcar asistencia
- `DB_TYPE`: Tipo de base de datos (mysql)
- `DB_HOST`: Host del servidor MySQL (localhost para desarrollo)
- `DB_PORT`: Puerto de MySQL (por defecto 3306)
- `DB_USERNAME`: Usuario de MySQL
- `DB_PASSWORD`: Contraseña de MySQL
- `DB_DATABASE`: Nombre de la base de datos
- `DB_TYPE`: Tipo de base de datos (mysql)
- `DB_HOST`: Host del servidor MySQL (localhost para desarrollo)
- `DB_PORT`: Puerto de MySQL (por defecto 3306)
- `DB_USERNAME`: Usuario de MySQL
- `DB_PASSWORD`: Contraseña de MySQL
- `DB_DATABASE`: Nombre de la base de datos

---

## 🎮 Ejecución del Proyecto

### Modo Desarrollo (con auto-reload)

Para desarrollo local con recarga automática al hacer cambios:

```powershell
npm run start:dev
```

**Salida esperada**:

```
[Nest] 12345  - 03/12/2025, 10:30:45     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 03/12/2025, 10:30:45     LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12345  - 03/12/2025, 10:30:45     LOG [InstanceLoader] ConfigModule dependencies initialized
...
[Nest] 12345  - 03/12/2025, 10:30:46     LOG [NestApplication] Nest application successfully started

🚀 Aplicación ejecutándose en: http://localhost:3000
📚 Documentación Swagger: http://localhost:3000/api/docs
🔌 WebSocket Server: ws://localhost:3000

🌐 CORS habilitado para:
   - http://localhost:4200
   - http://localhost:4201
```

### Modo Producción

Para compilar y ejecutar en producción:

```powershell
# Compilar el proyecto
npm run build

# Ejecutar la versión compilada
npm run start:prod
```

### Otros Comandos Útiles

```powershell
# Iniciar sin watch mode
npm start

# Iniciar con debugger
npm run start:debug

# Ejecutar tests
npm test

# Ejecutar tests con cobertura
npm run test:cov

# Linting del código
npm run lint

# Formatear código
npm run format
```

---

## 📁 Estructura del Proyecto

```
Proyecto 4/
├── src/
│   ├── main.ts                          # Punto de entrada de la aplicación
│   ├── app.module.ts                    # Módulo raíz
│   │
│   ├── common/                          # Recursos compartidos
│   │   └── middlewares/
│   │       ├── sport-context.middleware.ts   # Contexto deportivo
│   │       └── audit.middleware.ts           # Auditoría de acciones
│   │
│   ├── teams/                           # Módulo de equipos
│   │   ├── team.entity.ts               # Entidad Team
│   │   ├── teams.controller.ts          # Controlador REST
│   │   ├── teams.service.ts             # Lógica de negocio
│   │   ├── teams.module.ts              # Módulo Teams
│   │   └── dto/
│   │       ├── create-team.dto.ts
│   │       └── update-team.dto.ts
│   │
│   ├── events/                          # Módulo de eventos
│   │   ├── event.entity.ts              # Entidad Event
│   │   ├── events.controller.ts         # Controlador REST
│   │   ├── events.service.ts            # Lógica de negocio
│   │   ├── events.gateway.ts            # WebSocket Gateway
│   │   ├── events.module.ts             # Módulo Events
│   │   └── dto/
│   │       ├── create-event.dto.ts
│   │       ├── update-event.dto.ts
│   │       └── update-event-status.dto.ts
│   │
│   ├── player-enrollment/               # Módulo de inscripciones
│   │   ├── player-enrollment.entity.ts
│   │   ├── player-enrollment.controller.ts
│   │   ├── player-enrollment.service.ts
│   │   ├── player-enrollment.module.ts
│   │   └── dto/
│   │       ├── create-enrollment.dto.ts
│   │       └── update-enrollment-status.dto.ts
│   │
│   └── attendance/                      # Módulo de asistencia
│       ├── attendance.entity.ts
│       ├── attendance.controller.ts
│       ├── attendance.service.ts
│       ├── attendance.module.ts
│       └── dto/
│           └── record-participation.dto.ts
│
├── .env                                 # Variables de entorno (no en Git)
├── .env.example                         # Ejemplo de variables de entorno
├── .gitignore                           # Archivos ignorados por Git
├── nest-cli.json                        # Configuración de Nest CLI
├── package.json                         # Dependencias y scripts
├── tsconfig.json                        # Configuración de TypeScript
└── README.md                            # Esta documentación
```

---

## 📚 Módulos y Funcionalidades

### 1️⃣ Módulo Teams (Equipos)

**Entidad**: `Team`

**Campos principales**:

- `id`: UUID único
- `name`: Nombre del equipo
- `category`: Categoría (sub-18, sub-21, libre, femenino, masculino, mixto)
- `coach`: Nombre del entrenador
- `maxPlayers`: Número máximo de jugadores
- `sportType`: Tipo de deporte (fútbol, básquet, voleibol, etc.)
- `tags`: Etiquetas (entrenamiento, torneo, amistoso)
- `description`: Descripción opcional

**Endpoints REST**:

```
POST   /teams              - Crear equipo
GET    /teams              - Listar equipos (con filtros y paginación)
GET    /teams/:id          - Obtener equipo por ID
PATCH  /teams/:id          - Actualizar equipo
DELETE /teams/:id          - Eliminar equipo
```

**Filtros disponibles**:

- `coach`: Filtrar por entrenador
- `sportType`: Filtrar por tipo de deporte
- `category`: Filtrar por categoría
- `tags`: Filtrar por etiquetas
- `page` y `limit`: Paginación

---

### 2️⃣ Módulo Events (Eventos)

**Entidad**: `Event`

**Campos principales**:

- `id`: UUID único
- `name`: Nombre del evento
- `startTime`: Fecha y hora de inicio
- `endTime`: Fecha y hora de fin
- `location`: Ubicación
- `type`: Tipo (training, match, friendly, tournament)
- `status`: Estado (scheduled, live, finished, cancelled)
- `teamId`: ID del equipo asociado
- `maxAttendees`: Número máximo de asistentes (opcional)

**Endpoints REST**:

```
POST   /events             - Crear evento
GET    /events             - Listar eventos (con filtros y paginación)
GET    /events/:id         - Obtener evento por ID
PATCH  /events/:id         - Actualizar evento
PATCH  /events/:id/status  - Cambiar estado (solo coach)
DELETE /events/:id         - Eliminar evento
```

**Filtros disponibles**:

- `teamId`: Filtrar por equipo
- `type`: Filtrar por tipo de evento
- `status`: Filtrar por estado
- `startDate`: Filtrar desde fecha
- `endDate`: Filtrar hasta fecha
- `page` y `limit`: Paginación

**Estados del evento**:

- `scheduled`: Programado (estado inicial)
- `live`: En vivo (solo coach puede activar)
- `finished`: Finalizado (solo coach puede marcar)
- `cancelled`: Cancelado

**Reglas de negocio**:

1. Solo el entrenador puede cambiar un evento a `live` o `finished`
2. No se puede editar el horario de eventos `live` o `finished`
3. No se puede iniciar un evento antes del margen configurado (por defecto 15 minutos)
4. No se puede eliminar un evento en estado `live`

---

### 3️⃣ Módulo PlayerEnrollment (Inscripciones)

**Entidad**: `PlayerEnrollment`

**Campos principales**:

- `id`: UUID único
- `playerId`: ID del jugador
- `playerName`: Nombre del jugador
- `playerEmail`: Email del jugador
- `enrollmentType`: Tipo (team, event, both)
- `status`: Estado (pending, approved, rejected)
- `teamId`: ID del equipo (si aplica)
- `eventId`: ID del evento (si aplica)
- `notes`: Notas adicionales

**Endpoints REST**:

```
POST   /enrollments              - Inscribir jugador
GET    /enrollments              - Listar inscripciones (con filtros)
GET    /enrollments/:id          - Obtener inscripción por ID
PATCH  /enrollments/:id/status   - Aprobar/rechazar (coach)
DELETE /enrollments/:id           - Eliminar inscripción
```

**Filtros disponibles**:

- `playerId`: Filtrar por jugador
- `teamId`: Filtrar por equipo
- `eventId`: Filtrar por evento
- `status`: Filtrar por estado
- `page` y `limit`: Paginación

**Reglas de negocio**:

1. No se puede exceder `maxPlayers` del equipo
2. No se puede exceder `maxAttendees` del evento (si está configurado)
3. No se permiten inscripciones duplicadas
4. Las inscripciones pueden requerir aprobación manual del coach

---

### 4️⃣ Módulo Attendance (Asistencia y Participación)

**Entidad**: `Attendance`

**Campos principales**:

- `id`: UUID único
- `playerId`: ID del jugador
- `playerName`: Nombre del jugador
- `eventId`: ID del evento
- `wasPresent`: Booleano (presente/ausente)
- `minutesConnected`: Minutos conectado al evento
- `participationCount`: Número de participaciones
- `participations`: Array de participaciones detalladas
  - `type`: Tipo (chat_message, tactical_feedback, substitution_request, timeout_request)
  - `content`: Contenido del mensaje/feedback
  - `timestamp`: Marca de tiempo

**Endpoints REST**:

```
POST   /attendance/participation           - Registrar participación
POST   /attendance/mark/:eventId/:playerId - Marcar asistencia
GET    /attendance/event/:eventId          - Asistencias de un evento
GET    /attendance/player/:playerId        - Asistencias de un jugador
GET    /attendance/stats/:eventId          - Estadísticas del evento
POST   /attendance/finalize/:eventId       - Finalizar asistencia del evento
```

**Tipos de participación**:

- `chat_message`: Mensaje general en el chat
- `tactical_feedback`: Feedback táctico (generalmente del coach)
- `substitution_request`: Solicitud de cambio
- `timeout_request`: Solicitud de tiempo fuera

**Cálculo de asistencia**:

- Un jugador es marcado como `presente` si estuvo conectado al menos `MIN_ATTENDANCE_MINUTES` (por defecto 10 minutos)
- El tiempo se calcula desde que el jugador se conecta a la sala WebSocket hasta que se desconecta
- Al finalizar el evento, se registra automáticamente la asistencia de todos los jugadores conectados

**Estadísticas disponibles**:

- Total de inscritos
- Total de presentes
- Total de ausentes
- Tasa de asistencia (%)
- Promedio de minutos conectados
- Promedio de participaciones por jugador

---

## 📖 API REST Documentation

### Acceso a Swagger

Una vez que la aplicación esté ejecutándose, accede a la documentación interactiva:

**URL**: http://localhost:3000/api/docs

Swagger UI proporciona:

- 📝 Descripción completa de cada endpoint
- 🧪 Interfaz para probar las APIs directamente
- 📊 Esquemas de datos (DTOs)
- ✅ Códigos de respuesta esperados
- 📋 Ejemplos de requests y responses

### Estructura de Respuestas

#### Respuesta de Listados Paginados

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### Respuesta de Error

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

---

## 🔌 WebSocket Events

### Conexión WebSocket

**URL**: `ws://localhost:3000`

**Librerías cliente recomendadas**:

- JavaScript/TypeScript: `socket.io-client`
- Python: `python-socketio`
- Java: `socket.io-client-java`

### Ejemplo de Conexión (JavaScript)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket');
});
```

### Eventos del Cliente → Servidor

#### 1. `join_event` - Unirse a un evento

```javascript
socket.emit('join_event', {
  eventId: 'evento-uuid',
  playerId: 'jugador-uuid',
  playerName: 'Carlos Martínez',
});

// Respuesta
socket.on('join_event', (response) => {
  console.log(response);
  // { success: true, message: 'Unido al evento exitosamente', connectedPlayers: 5 }
});
```

#### 2. `leave_event` - Salir de un evento

```javascript
socket.emit('leave_event', {
  eventId: 'evento-uuid',
  playerId: 'jugador-uuid',
});
```

#### 3. `send_chat_message` - Enviar mensaje al chat

```javascript
socket.emit('send_chat_message', {
  eventId: 'evento-uuid',
  playerId: 'jugador-uuid',
  playerName: 'Carlos Martínez',
  message: 'Hola equipo!',
  isCoachFeedback: false, // true si es feedback táctico del coach
});
```

**Rate Limit**: 5 mensajes cada 10 segundos por defecto

#### 4. `request_substitution` - Solicitar cambio

```javascript
socket.emit('request_substitution', {
  eventId: 'evento-uuid',
  playerId: 'jugador-uuid',
  playerName: 'Carlos Martínez',
  reason: 'Cansancio', // Opcional
});
```

**Rate Limit**: 3 solicitudes cada 10 segundos

#### 5. `request_timeout` - Solicitar tiempo fuera

```javascript
socket.emit('request_timeout', {
  eventId: 'evento-uuid',
  playerId: 'jugador-uuid',
  playerName: 'Carlos Martínez',
  reason: 'Estrategia', // Opcional
});
```

**Rate Limit**: 3 solicitudes cada 10 segundos

---

### Eventos del Servidor → Cliente

#### 1. `player.joined_event` - Jugador se unió

```javascript
socket.on('player.joined_event', (data) => {
  console.log(`${data.playerName} se unió al evento`);
  // { eventId, playerId, playerName, timestamp }
});
```

#### 2. `player.left_event` - Jugador salió

```javascript
socket.on('player.left_event', (data) => {
  console.log(`${data.playerName} salió del evento`);
  // { eventId, playerId, playerName, timestamp }
});
```

#### 3. `event.chat_message` - Nuevo mensaje en chat

```javascript
socket.on('event.chat_message', (data) => {
  console.log(`${data.playerName}: ${data.message}`);
  // { eventId, playerId, playerName, message, isCoachFeedback, timestamp }
});
```

#### 4. `event.substitution_requested` - Solicitud de cambio

```javascript
socket.on('event.substitution_requested', (data) => {
  console.log(`${data.playerName} solicita cambio: ${data.reason}`);
  // { eventId, playerId, playerName, reason, timestamp }
});
```

#### 5. `event.timeout_requested` - Solicitud de tiempo fuera

```javascript
socket.on('event.timeout_requested', (data) => {
  console.log(`${data.playerName} solicita tiempo fuera: ${data.reason}`);
  // { eventId, playerId, playerName, reason, timestamp }
});
```

#### 6. `event.started` - Evento iniciado

```javascript
socket.on('event.started', (data) => {
  console.log('El evento ha comenzado');
  // { eventId, timestamp }
});
```

#### 7. `event.ended` - Evento finalizado

```javascript
socket.on('event.ended', (data) => {
  console.log('El evento ha finalizado');
  // { eventId, timestamp }
});
```

#### 8. `event.connected_players` - Actualización de jugadores conectados

```javascript
socket.on('event.connected_players', (data) => {
  console.log(`Jugadores conectados: ${data.connectedPlayers}`);
  // {
  //   eventId,
  //   connectedPlayers: 5,
  //   players: [
  //     { playerId, playerName, joinedAt },
  //     ...
  //   ]
  // }
});
```

---

## 🔒 Seguridad

### 1. CORS (Cross-Origin Resource Sharing)

El sistema permite solicitudes solo desde orígenes específicos configurados en `.env`:

```env
CORS_ORIGIN_PLAYERS=http://localhost:4200
CORS_ORIGIN_COACHES=http://localhost:4201
```

**Headers permitidos**:

- `Content-Type`
- `Authorization`
- `X-Team-Id`
- `X-Event-Id`

### 2. Helmet - Cabeceras de Seguridad HTTP

Helmet configura automáticamente cabeceras HTTP para proteger contra vulnerabilidades comunes:

- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `X-XSS-Protection`

### 3. Rate Limiting

**Rate Limiting General**:

- 100 peticiones cada 60 segundos por IP (configurable)

**Rate Limiting de Chat**:

- 5 mensajes cada 10 segundos por socket (configurable)

**Configuración en `.env`**:

```env
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
CHAT_RATE_LIMIT_TTL=10
CHAT_RATE_LIMIT_MAX=5
```

### 4. Validación de Datos

Todas las entradas son validadas usando `class-validator`:

- Tipos de datos correctos
- Longitudes mínimas y máximas
- Formatos de email
- Enums válidos
- UUIDs correctos

### 5. Middlewares de Auditoría

**SportContextMiddleware**:

- Extrae contexto deportivo de headers y params
- Añade `currentTeamId` y `currentEventId` al request

**AuditMiddleware**:

- Registra intentos de acceso no autorizado
- Log de inscripciones fallidas
- Auditoría de exceso de límites
- Almacena últimos 1000 eventos de auditoría

---

## ✅ Validaciones y Reglas de Negocio

### Equipos (Teams)

1. ✅ El nombre del equipo debe tener entre 3 y 100 caracteres
2. ✅ `maxPlayers` debe ser al menos 5
3. ✅ No se puede tener más jugadores inscritos que `maxPlayers`

### Eventos (Events)

1. ✅ `endTime` debe ser posterior a `startTime`
2. ✅ Solo el coach puede cambiar el estado a `live` o `finished`
3. ✅ No se puede editar horarios de eventos `live` o `finished`
4. ✅ No se puede iniciar un evento antes del margen configurado (15 min por defecto)
5. ✅ No se puede marcar asistencia después de que el evento esté `finished`
6. ✅ No se puede eliminar un evento en estado `live`

### Inscripciones (PlayerEnrollment)

1. ✅ No se puede exceder `maxPlayers` del equipo
2. ✅ No se puede exceder `maxAttendees` del evento (si está configurado)
3. ✅ No se permiten inscripciones duplicadas del mismo jugador al mismo equipo/evento
4. ✅ Requiere `teamId` si `enrollmentType` es `team` o `both`
5. ✅ Requiere `eventId` si `enrollmentType` es `event` o `both`

### Asistencia (Attendance)

1. ✅ Solo se puede registrar participación en eventos `live`
2. ✅ Un jugador es presente si estuvo conectado al menos 10 minutos (configurable)
3. ✅ No se puede finalizar asistencia de eventos no finalizados
4. ✅ Las participaciones se registran con timestamp automático

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear Equipo y Evento

```bash
# 1. Crear un equipo
curl -X POST http://localhost:3000/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tigres FC",
    "category": "sub-18",
    "coach": "Juan Pérez",
    "maxPlayers": 25,
    "sportType": "fútbol",
    "tags": ["entrenamiento", "torneo"],
    "description": "Equipo sub-18 de fútbol"
  }'

# Respuesta: { "id": "team-uuid", ... }

# 2. Crear un evento para ese equipo
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Entrenamiento Táctico",
    "startTime": "2025-12-10T15:00:00Z",
    "endTime": "2025-12-10T17:00:00Z",
    "location": "Estadio Principal",
    "type": "training",
    "teamId": "team-uuid",
    "maxAttendees": 20
  }'

# Respuesta: { "id": "event-uuid", "status": "scheduled", ... }
```

### Ejemplo 2: Inscribir Jugador

```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-123",
    "playerName": "Carlos Martínez",
    "playerEmail": "carlos@example.com",
    "enrollmentType": "both",
    "teamId": "team-uuid",
    "eventId": "event-uuid"
  }'

# Respuesta: { "id": "enrollment-uuid", "status": "pending", ... }

# Aprobar inscripción (coach)
curl -X PATCH http://localhost:3000/enrollments/enrollment-uuid/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "approved" }'
```

### Ejemplo 3: Iniciar Evento y Usar WebSocket

```javascript
// Cliente JavaScript
import { io } from 'socket.io-client';
import axios from 'axios';

// 1. Iniciar el evento (REST API - solo coach)
await axios.patch('http://localhost:3000/events/event-uuid/status', {
  status: 'live',
});

// 2. Conectar WebSocket
const socket = io('http://localhost:3000');

// 3. Unirse al evento
socket.emit('join_event', {
  eventId: 'event-uuid',
  playerId: 'player-123',
  playerName: 'Carlos Martínez',
});

// 4. Escuchar eventos
socket.on('player.joined_event', (data) => {
  console.log(`${data.playerName} se unió`);
});

socket.on('event.chat_message', (data) => {
  console.log(`${data.playerName}: ${data.message}`);
});

// 5. Enviar mensaje
socket.emit('send_chat_message', {
  eventId: 'event-uuid',
  playerId: 'player-123',
  playerName: 'Carlos Martínez',
  message: '¡Listos para entrenar!',
});

// 6. Solicitar cambio
socket.emit('request_substitution', {
  eventId: 'event-uuid',
  playerId: 'player-123',
  playerName: 'Carlos Martínez',
  reason: 'Necesito descansar',
});
```

### Ejemplo 4: Consultar Estadísticas de Asistencia

```bash
# Obtener estadísticas del evento
curl http://localhost:3000/attendance/stats/event-uuid

# Respuesta:
{
  "totalEnrolled": 20,
  "totalPresent": 18,
  "totalAbsent": 2,
  "attendanceRate": 90.00,
  "avgMinutesConnected": 75.50,
  "avgParticipations": 8.25
}
```

---

## 🧪 Testing

### Ejecutar Tests Unitarios

```powershell
npm test
```

### Ejecutar Tests con Cobertura

```powershell
npm run test:cov
```

### Ejecutar Tests en Modo Watch

```powershell
npm run test:watch
```

### Ejecutar Tests End-to-End

```powershell
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Problema: Error al instalar dependencias

**Solución**:

```powershell
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstalar
npm install
```

### Problema: Error al conectar a MySQL

**Solución**:

1. Verificar que MySQL/MariaDB esté ejecutándose:

   ```powershell
   # Para MySQL
   Get-Service MySQL*

   # Para MariaDB
   Get-Service MariaDB
   ```

2. Verificar credenciales en `.env`
3. Verificar que la base de datos existe:

   ```sql
   SHOW DATABASES;
   ```

4. Verificar permisos del usuario:
   ```sql
   SHOW GRANTS FOR 'tu_usuario'@'localhost';
   ```

### Problema: Puerto 3000 ya en uso

**Solución**:

1. Cambiar el puerto en `.env`:

   ```env
   PORT=3001
   ```

2. O matar el proceso que usa el puerto:

   ```powershell
   # Encontrar el proceso
   netstat -ano | findstr :3000

   # Matar el proceso (reemplaza PID)
   taskkill /PID <PID> /F
   ```

### Problema: WebSocket no conecta

**Verificar**:

1. CORS está configurado correctamente en `.env`
2. El cliente usa la URL correcta: `http://localhost:3000` (no `https`)
3. El firewall no bloquea el puerto

---

## 📞 Soporte y Contribución

Para reportar bugs o solicitar features:

1. Crea un issue en el repositorio
2. Incluye:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Versión de Node.js y npm

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 🎓 Recursos Adicionales

### Documentación Oficial

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Swagger/OpenAPI](https://swagger.io/specification/)

### Tutoriales Recomendados

- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [TypeORM Relations](https://typeorm.io/relations)
- [Class Validator](https://github.com/typestack/class-validator)

---

## 🏁 Conclusión

Este sistema proporciona una base sólida y escalable para gestión de eventos deportivos en tiempo real. Las características implementadas permiten:

✅ Gestión completa de equipos y eventos  
✅ Sistema de inscripciones con aprobación  
✅ Comunicación en tiempo real con WebSockets  
✅ Seguimiento automático de asistencia y participación  
✅ Seguridad robusta con rate limiting y CORS  
✅ Documentación interactiva con Swagger  
✅ Auditoría de acciones críticas  
✅ Validaciones exhaustivas de datos

**¡Listo para comenzar tu gestión deportiva profesional!** 🚀⚽🏀

---

**Fecha de última actualización**: 03/12/2025  
**Versión**: 1.0.0
