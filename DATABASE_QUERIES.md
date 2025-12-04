# 🗄️ Consultas SQL y Scripts de Base de Datos

Este archivo contiene consultas SQL útiles para interactuar con la base de datos **MySQL/MariaDB** del sistema de eventos deportivos.

## 📊 Estructura de la Base de Datos

### Tablas Creadas Automáticamente por TypeORM

1. **teams** - Equipos deportivos
2. **events** - Eventos deportivos (entrenamientos, partidos, etc.)
3. **player_enrollments** - Inscripciones de jugadores
4. **attendances** - Asistencia y participación

---

## 🔍 Consultas de Lectura (SELECT)

### Ver todos los equipos

```sql
SELECT * FROM teams;
```

### Ver equipos con filtros específicos

```sql
-- Por categoría
SELECT * FROM teams WHERE category = 'sub-18';

-- Por tipo de deporte
SELECT * FROM teams WHERE sportType = 'fútbol';

-- Por entrenador
SELECT * FROM teams WHERE coach LIKE '%Juan%';

-- Equipos con más de 20 jugadores máximo
SELECT * FROM teams WHERE maxPlayers > 20;
```

### Ver todos los eventos

```sql
SELECT * FROM events;
```

### Ver eventos con sus equipos

```sql
SELECT 
    e.id,
    e.name AS event_name,
    e.startTime,
    e.endTime,
    e.type,
    e.status,
    e.location,
    t.name AS team_name,
    t.coach
FROM events e
LEFT JOIN teams t ON e.teamId = t.id;
```

### Ver eventos por estado

```sql
-- Eventos programados
SELECT * FROM events WHERE status = 'scheduled';

-- Eventos en vivo
SELECT * FROM events WHERE status = 'live';

-- Eventos finalizados
SELECT * FROM events WHERE status = 'finished';
```

### Ver eventos por fecha

```sql
-- Eventos de hoy en adelante
SELECT * FROM events 
WHERE startTime >= NOW();

-- Eventos del mes actual
SELECT * FROM events 
WHERE DATE_FORMAT(startTime, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m');
```

### Ver inscripciones de jugadores

```sql
SELECT * FROM player_enrollments;
```

### Ver inscripciones con detalles de equipo y evento

```sql
SELECT 
    pe.id,
    pe.playerId,
    pe.playerName,
    pe.playerEmail,
    pe.enrollmentType,
    pe.status,
    t.name AS team_name,
    e.name AS event_name,
    e.startTime
FROM player_enrollments pe
LEFT JOIN teams t ON pe.teamId = t.id
LEFT JOIN events e ON pe.eventId = e.id;
```

### Ver inscripciones aprobadas por equipo

```sql
SELECT 
    t.name AS team_name,
    t.maxPlayers,
    COUNT(pe.id) AS enrolled_players
FROM teams t
LEFT JOIN player_enrollments pe ON t.id = pe.teamId AND pe.status = 'approved'
GROUP BY t.id, t.name, t.maxPlayers;
```

### Ver asistencia de eventos

```sql
SELECT * FROM attendances;
```

### Ver asistencia con detalles del evento

```sql
SELECT 
    a.playerId,
    a.playerName,
    a.wasPresent,
    a.minutesConnected,
    a.participationCount,
    e.name AS event_name,
    e.startTime,
    e.status
FROM attendances a
LEFT JOIN events e ON a.eventId = e.id;
```

### Estadísticas de asistencia por evento

```sql
SELECT 
    e.name AS event_name,
    e.type,
    e.status,
    COUNT(a.id) AS total_registros,
    SUM(CASE WHEN a.wasPresent = 1 THEN 1 ELSE 0 END) AS presentes,
    SUM(CASE WHEN a.wasPresent = 0 THEN 1 ELSE 0 END) AS ausentes,
    ROUND(AVG(a.minutesConnected), 2) AS avg_minutos,
    ROUND(AVG(a.participationCount), 2) AS avg_participaciones
FROM events e
LEFT JOIN attendances a ON e.id = a.eventId
GROUP BY e.id, e.name, e.type, e.status;
```

---

## ➕ Consultas de Inserción (INSERT)

### Insertar equipos

```sql
-- Equipo de fútbol
INSERT INTO teams (id, name, category, coach, maxPlayers, sportType, tags, description, createdAt, updatedAt)
VALUES (
    UUID(),
    'Tigres FC',
    'sub-18',
    'Juan Pérez',
    25,
    'fútbol',
    'entrenamiento,torneo',
    'Equipo sub-18 de fútbol competitivo',
    NOW(),
    NOW()
);

-- Equipo de básquet
INSERT INTO teams (id, name, category, coach, maxPlayers, sportType, tags, description, createdAt, updatedAt)
VALUES (
    UUID(),
    'Leones Basketball',
    'libre',
    'María García',
    15,
    'básquet',
    'torneo,amistoso',
    'Equipo de básquetbol categoría libre',
    NOW(),
    NOW()
);

-- Equipo femenino de voleibol
INSERT INTO teams (id, name, category, coach, maxPlayers, sportType, tags, description, createdAt, updatedAt)
VALUES (
    UUID(),
    'Panteras Volleyball',
    'femenino',
    'Ana López',
    18,
    'voleibol',
    'entrenamiento',
    'Equipo femenino de voleibol',
    NOW(),
    NOW()
);
```

### Insertar eventos

```sql
-- Obtener ID de un equipo primero
-- SELECT id FROM teams WHERE name = 'Tigres FC';

-- Entrenamiento (reemplaza 'TEAM_ID_AQUI' con el ID real)
INSERT INTO events (id, name, startTime, endTime, location, type, status, maxAttendees, description, teamId, createdAt, updatedAt)
VALUES (
    UUID(),
    'Entrenamiento Táctico',
    DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 3 HOUR,
    DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 5 HOUR,
    'Estadio Municipal',
    'training',
    'scheduled',
    20,
    'Entrenamiento enfocado en táctica defensiva',
    'TEAM_ID_AQUI',
    NOW(),
    NOW()
);

-- Partido amistoso
INSERT INTO events (id, name, startTime, endTime, location, type, status, maxAttendees, description, teamId, createdAt, updatedAt)
VALUES (
    UUID(),
    'Partido Amistoso vs Águilas',
    DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 4 HOUR,
    DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 6 HOUR,
    'Estadio Principal',
    'friendly',
    'scheduled',
    22,
    'Partido amistoso de preparación',
    'TEAM_ID_AQUI',
    NOW(),
    NOW()
);
```

### Insertar inscripciones de jugadores

```sql
-- Inscripción a equipo (reemplaza IDs reales)
INSERT INTO player_enrollments (id, playerId, playerName, playerEmail, enrollmentType, status, teamId, eventId, notes, createdAt, updatedAt)
VALUES (
    UUID(),
    'player-001',
    'Carlos Martínez',
    'carlos@example.com',
    'team',
    'approved',
    'TEAM_ID_AQUI',
    NULL,
    'Jugador experimentado',
    NOW(),
    NOW()
);

-- Inscripción a evento específico
INSERT INTO player_enrollments (id, playerId, playerName, playerEmail, enrollmentType, status, teamId, eventId, notes, createdAt, updatedAt)
VALUES (
    lower(hex(randomblob(16))),
    'player-002',
    'Ana Silva',
    'ana@example.com',
    'event',
    'pending',
    NULL,
    'EVENT_ID_AQUI',
    'Invitada especial',
    datetime('now'),
    datetime('now')
);

-- Inscripción a ambos (equipo y evento)
INSERT INTO player_enrollments (id, playerId, playerName, playerEmail, enrollmentType, status, teamId, eventId, notes, createdAt, updatedAt)
VALUES (
    lower(hex(randomblob(16))),
    'player-003',
    'Luis Rodríguez',
    'luis@example.com',
    'both',
    'approved',
    'TEAM_ID_AQUI',
    'EVENT_ID_AQUI',
    NULL,
    datetime('now'),
    datetime('now')
);
```

### Insertar registros de asistencia

```sql
INSERT INTO attendances (id, playerId, playerName, eventId, wasPresent, minutesConnected, participationCount, participations, recordedAt)
VALUES (
    lower(hex(randomblob(16))),
    'player-001',
    'Carlos Martínez',
    'EVENT_ID_AQUI',
    1,
    75,
    8,
    '[{"type":"chat_message","content":"Listos para entrenar!","timestamp":"2025-12-03T10:30:00Z"},{"type":"substitution_request","content":"Necesito descanso","timestamp":"2025-12-03T11:15:00Z"}]',
    datetime('now')
);
```

---

## ✏️ Consultas de Actualización (UPDATE)

### Actualizar estado de evento

```sql
-- Iniciar evento (cambiar a live)
UPDATE events 
SET status = 'live', updatedAt = NOW()
WHERE id = 'EVENT_ID_AQUI';

-- Finalizar evento
UPDATE events 
SET status = 'finished', updatedAt = NOW()
WHERE id = 'EVENT_ID_AQUI';

-- Cancelar evento
UPDATE events 
SET status = 'cancelled', updatedAt = NOW()
WHERE id = 'EVENT_ID_AQUI';
```

### Aprobar/rechazar inscripciones

```sql
-- Aprobar inscripción
UPDATE player_enrollments 
SET status = 'approved', updatedAt = NOW()
WHERE id = 'ENROLLMENT_ID_AQUI';

-- Rechazar inscripción
UPDATE player_enrollments 
SET status = 'rejected', updatedAt = NOW()
WHERE id = 'ENROLLMENT_ID_AQUI';
```

### Actualizar información de equipo

```sql
UPDATE teams 
SET 
    name = 'Tigres FC 2025',
    maxPlayers = 30,
    updatedAt = datetime('now')
WHERE id = 'TEAM_ID_AQUI';
```

---

## 🗑️ Consultas de Eliminación (DELETE)

### Eliminar inscripción

```sql
DELETE FROM player_enrollments WHERE id = 'ENROLLMENT_ID_AQUI';
```

### Eliminar evento

```sql
-- Solo si no está en vivo
DELETE FROM events WHERE id = 'EVENT_ID_AQUI' AND status != 'live';
```

### Eliminar equipo (cuidado: elimina eventos relacionados)

```sql
DELETE FROM teams WHERE id = 'TEAM_ID_AQUI';
```

---

## 📈 Consultas Avanzadas y Reportes

### Reporte de equipos con más inscripciones

```sql
SELECT 
    t.name AS team_name,
    t.coach,
    t.maxPlayers,
    COUNT(pe.id) AS total_inscripciones,
    SUM(CASE WHEN pe.status = 'approved' THEN 1 ELSE 0 END) AS aprobadas,
    SUM(CASE WHEN pe.status = 'pending' THEN 1 ELSE 0 END) AS pendientes,
    t.maxPlayers - SUM(CASE WHEN pe.status = 'approved' THEN 1 ELSE 0 END) AS espacios_disponibles
FROM teams t
LEFT JOIN player_enrollments pe ON t.id = pe.teamId
GROUP BY t.id
ORDER BY total_inscripciones DESC;
```

### Reporte de eventos próximos con inscripciones

```sql
SELECT 
    e.name AS event_name,
    e.type,
    e.startTime,
    e.location,
    e.maxAttendees,
    t.name AS team_name,
    COUNT(pe.id) AS inscripciones,
    e.maxAttendees - COUNT(pe.id) AS espacios_disponibles
FROM events e
LEFT JOIN teams t ON e.teamId = t.id
LEFT JOIN player_enrollments pe ON e.id = pe.eventId AND pe.status = 'approved'
WHERE e.status = 'scheduled' 
  AND datetime(e.startTime) >= datetime('now')
GROUP BY e.id
ORDER BY e.startTime ASC;
```

### Jugadores más participativos

```sql
SELECT 
    a.playerId,
    a.playerName,
    COUNT(DISTINCT a.eventId) AS eventos_asistidos,
    SUM(a.wasPresent) AS veces_presente,
    ROUND(AVG(a.minutesConnected), 2) AS avg_minutos,
    SUM(a.participationCount) AS total_participaciones
FROM attendances a
GROUP BY a.playerId, a.playerName
HAVING SUM(a.wasPresent) > 0
ORDER BY total_participaciones DESC;
```

### Tasa de asistencia por jugador

```sql
SELECT 
    a.playerId,
    a.playerName,
    COUNT(*) AS eventos_registrados,
    SUM(CASE WHEN a.wasPresent = 1 THEN 1 ELSE 0 END) AS eventos_presentes,
    ROUND(
        (SUM(CASE WHEN a.wasPresent = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
        2
    ) AS tasa_asistencia_porcentaje
FROM attendances a
GROUP BY a.playerId, a.playerName
ORDER BY tasa_asistencia_porcentaje DESC;
```

### Eventos con mejor asistencia

```sql
SELECT 
    e.name AS event_name,
    e.type,
    e.startTime,
    COUNT(pe.id) AS inscritos,
    SUM(CASE WHEN a.wasPresent = 1 THEN 1 ELSE 0 END) AS presentes,
    ROUND(
        (SUM(CASE WHEN a.wasPresent = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(pe.id),
        2
    ) AS tasa_asistencia
FROM events e
LEFT JOIN player_enrollments pe ON e.id = pe.eventId AND pe.status = 'approved'
LEFT JOIN attendances a ON e.id = a.eventId AND pe.playerId = a.playerId
WHERE e.status = 'finished'
GROUP BY e.id
HAVING COUNT(pe.id) > 0
ORDER BY tasa_asistencia DESC;
```

### Resumen por tipo de deporte

```sql
SELECT 
    t.sportType,
    COUNT(DISTINCT t.id) AS total_equipos,
    SUM(t.maxPlayers) AS capacidad_total,
    COUNT(DISTINCT e.id) AS total_eventos,
    SUM(CASE WHEN e.status = 'live' THEN 1 ELSE 0 END) AS eventos_en_vivo,
    SUM(CASE WHEN e.status = 'scheduled' THEN 1 ELSE 0 END) AS eventos_programados
FROM teams t
LEFT JOIN events e ON t.id = e.teamId
GROUP BY t.sportType
ORDER BY total_equipos DESC;
```

---

## 🔧 Utilidades MySQL/MariaDB

### Ver esquema de una tabla

```sql
DESCRIBE teams;
DESCRIBE events;
DESCRIBE player_enrollments;
DESCRIBE attendances;

-- O con más detalle
SHOW CREATE TABLE teams;
SHOW COLUMNS FROM teams;
```

### Ver todas las tablas

```sql
SHOW TABLES;
```

### Contar registros en todas las tablas

```sql
SELECT 'teams' AS tabla, COUNT(*) AS registros FROM teams
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'player_enrollments', COUNT(*) FROM player_enrollments
UNION ALL
SELECT 'attendances', COUNT(*) FROM attendances;
```

### Limpiar todas las tablas (usar con precaución)

```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE attendances;
TRUNCATE TABLE player_enrollments;
TRUNCATE TABLE events;
TRUNCATE TABLE teams;
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 📝 Cómo Ejecutar estas Consultas

### Opción 1: Desde la terminal con MySQL

```powershell
# Conectar a MySQL
mysql -u root -p

# Usar la base de datos
USE sports_events;

# Ejecutar consultas
SELECT * FROM teams;

# Salir
exit;
```

### Opción 2: Extensión de VS Code

Instalar la extensión **MySQL** en VS Code:
1. Abrir VS Code
2. Ir a Extensions (Ctrl+Shift+X)
3. Buscar "MySQL" (de Weijan Chen)
4. Instalar la extensión
5. Configurar conexión a MySQL

### Opción 3: Herramientas GUI

- **HeidiSQL**: https://www.heidisql.com/ (Recomendado para Windows)
- **MySQL Workbench**: https://dev.mysql.com/downloads/workbench/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/
- **phpMyAdmin**: https://www.phpmyadmin.net/ (basado en web)

---

## 🎯 Script de Datos de Prueba Completo

Aquí tienes un script completo para poblar la base de datos con datos de prueba:

```sql
-- ============================================
-- SCRIPT DE DATOS DE PRUEBA COMPLETO
-- ============================================

-- Limpiar datos existentes (opcional)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE attendances;
TRUNCATE TABLE player_enrollments;
TRUNCATE TABLE events;
TRUNCATE TABLE teams;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- EQUIPOS
-- ============================================

-- Equipo 1: Tigres FC (Fútbol Sub-18)
INSERT INTO teams (id, name, category, coach, maxPlayers, sportType, tags, description, createdAt, updatedAt)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Tigres FC',
    'sub-18',
    'Juan Pérez',
    25,
    'fútbol',
    'entrenamiento,torneo',
    'Equipo sub-18 de fútbol competitivo',
    datetime('now'),
    datetime('now')
);

-- Equipo 2: Leones Basketball (Libre)
INSERT INTO teams (id, name, category, coach, maxPlayers, sportType, tags, description, createdAt, updatedAt)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Leones Basketball',
    'libre',
    'María García',
    15,
    'básquet',
    'torneo,amistoso',
    'Equipo de básquetbol categoría libre',
    datetime('now'),
    datetime('now')
);

-- Equipo 3: Panteras Volleyball (Femenino)
INSERT INTO teams (id, name, category, coach, maxPlayers, sportType, tags, description, createdAt, updatedAt)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Panteras Volleyball',
    'femenino',
    'Ana López',
    18,
    'voleibol',
    'entrenamiento',
    'Equipo femenino de voleibol',
    datetime('now'),
    datetime('now')
);

-- ============================================
-- EVENTOS
-- ============================================

-- Evento 1: Entrenamiento Tigres FC (Programado)
INSERT INTO events (id, name, startTime, endTime, location, type, status, maxAttendees, description, teamId, createdAt, updatedAt)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Entrenamiento Táctico',
    datetime('now', '+2 days', '+3 hours'),
    datetime('now', '+2 days', '+5 hours'),
    'Estadio Municipal',
    'training',
    'scheduled',
    20,
    'Entrenamiento enfocado en táctica defensiva',
    '11111111-1111-1111-1111-111111111111',
    datetime('now'),
    datetime('now')
);

-- Evento 2: Partido Tigres FC (En vivo - para testing)
INSERT INTO events (id, name, startTime, endTime, location, type, status, maxAttendees, description, teamId, createdAt, updatedAt)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Partido vs Águilas',
    datetime('now', '-30 minutes'),
    datetime('now', '+1 hour'),
    'Estadio Principal',
    'match',
    'live',
    22,
    'Partido importante de torneo',
    '11111111-1111-1111-1111-111111111111',
    datetime('now'),
    datetime('now')
);

-- Evento 3: Entrenamiento Leones Basketball
INSERT INTO events (id, name, startTime, endTime, location, type, status, maxAttendees, description, teamId, createdAt, updatedAt)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Práctica de Tiros',
    datetime('now', '+3 days', '+2 hours'),
    datetime('now', '+3 days', '+4 hours'),
    'Polideportivo Central',
    'training',
    'scheduled',
    12,
    'Entrenamiento de tiros libres y triples',
    '22222222-2222-2222-2222-222222222222',
    datetime('now'),
    datetime('now')
);

-- Evento 4: Torneo Panteras (Finalizado)
INSERT INTO events (id, name, startTime, endTime, location, type, status, maxAttendees, description, teamId, createdAt, updatedAt)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Torneo Interescolar',
    datetime('now', '-5 days'),
    datetime('now', '-5 days', '+3 hours'),
    'Gimnasio Municipal',
    'tournament',
    'finished',
    16,
    'Torneo interescolar de voleibol',
    '33333333-3333-3333-3333-333333333333',
    datetime('now', '-6 days'),
    datetime('now', '-5 days')
);

-- ============================================
-- INSCRIPCIONES DE JUGADORES
-- ============================================

-- Jugadores del equipo Tigres FC
INSERT INTO player_enrollments (id, playerId, playerName, playerEmail, enrollmentType, status, teamId, eventId, notes, createdAt, updatedAt)
VALUES 
    ('e1111111-1111-1111-1111-111111111111', 'player-001', 'Carlos Martínez', 'carlos@example.com', 'both', 'approved', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Capitán del equipo', datetime('now', '-10 days'), datetime('now', '-10 days')),
    ('e2222222-2222-2222-2222-222222222222', 'player-002', 'Luis Rodríguez', 'luis@example.com', 'both', 'approved', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Delantero', datetime('now', '-9 days'), datetime('now', '-9 days')),
    ('e3333333-3333-3333-3333-333333333333', 'player-003', 'Pedro Sánchez', 'pedro@example.com', 'team', 'approved', '11111111-1111-1111-1111-111111111111', NULL, 'Defensa', datetime('now', '-8 days'), datetime('now', '-8 days')),
    ('e4444444-4444-4444-4444-444444444444', 'player-004', 'Miguel Torres', 'miguel@example.com', 'both', 'pending', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Portero', datetime('now', '-2 days'), datetime('now', '-2 days'));

-- Jugadores del equipo Leones Basketball
INSERT INTO player_enrollments (id, playerId, playerName, playerEmail, enrollmentType, status, teamId, eventId, notes, createdAt, updatedAt)
VALUES 
    ('e5555555-5555-5555-5555-555555555555', 'player-005', 'Ana Silva', 'ana@example.com', 'both', 'approved', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Base', datetime('now', '-7 days'), datetime('now', '-7 days')),
    ('e6666666-6666-6666-6666-666666666666', 'player-006', 'Roberto Méndez', 'roberto@example.com', 'team', 'approved', '22222222-2222-2222-2222-222222222222', NULL, 'Alero', datetime('now', '-6 days'), datetime('now', '-6 days'));

-- Jugadoras del equipo Panteras Volleyball
INSERT INTO player_enrollments (id, playerId, playerName, playerEmail, enrollmentType, status, teamId, eventId, notes, createdAt, updatedAt)
VALUES 
    ('e7777777-7777-7777-7777-777777777777', 'player-007', 'Laura Fernández', 'laura@example.com', 'both', 'approved', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Rematadora', datetime('now', '-15 days'), datetime('now', '-15 days')),
    ('e8888888-8888-8888-8888-888888888888', 'player-008', 'Sofía Ramírez', 'sofia@example.com', 'both', 'approved', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Líbero', datetime('now', '-14 days'), datetime('now', '-14 days'));

-- ============================================
-- REGISTROS DE ASISTENCIA
-- ============================================

-- Asistencia del evento en vivo (Partido vs Águilas)
INSERT INTO attendances (id, playerId, playerName, eventId, wasPresent, minutesConnected, participationCount, participations, recordedAt)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'player-001', 'Carlos Martínez', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 45, 5, '[{"type":"chat_message","content":"¡Vamos equipo!","timestamp":"2025-12-03T10:30:00Z"},{"type":"tactical_feedback","content":"Presión alta en defensa","timestamp":"2025-12-03T10:45:00Z"},{"type":"chat_message","content":"Buen juego","timestamp":"2025-12-03T11:00:00Z"}]', datetime('now')),
    ('a2222222-2222-2222-2222-222222222222', 'player-002', 'Luis Rodríguez', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 42, 3, '[{"type":"chat_message","content":"Listos!","timestamp":"2025-12-03T10:32:00Z"},{"type":"substitution_request","content":"Necesito descanso","timestamp":"2025-12-03T11:10:00Z"}]', datetime('now'));

-- Asistencia del evento finalizado (Torneo Panteras)
INSERT INTO attendances (id, playerId, playerName, eventId, wasPresent, minutesConnected, participationCount, participations, recordedAt)
VALUES 
    ('a3333333-3333-3333-3333-333333333333', 'player-007', 'Laura Fernández', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 180, 12, '[{"type":"chat_message","content":"Excelente trabajo equipo","timestamp":"2025-11-28T10:00:00Z"},{"type":"tactical_feedback","content":"Rotación perfecta","timestamp":"2025-11-28T11:00:00Z"}]', datetime('now', '-5 days')),
    ('a4444444-4444-4444-4444-444444444444', 'player-008', 'Sofía Ramírez', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 175, 8, '[{"type":"chat_message","content":"¡A ganar!","timestamp":"2025-11-28T10:05:00Z"},{"type":"timeout_request","content":"Tomar agua","timestamp":"2025-11-28T12:00:00Z"}]', datetime('now', '-5 days'));

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver resumen de datos insertados
SELECT 'EQUIPOS' as tipo, COUNT(*) as cantidad FROM teams
UNION ALL
SELECT 'EVENTOS', COUNT(*) FROM events
UNION ALL
SELECT 'INSCRIPCIONES', COUNT(*) FROM player_enrollments
UNION ALL
SELECT 'ASISTENCIAS', COUNT(*) FROM attendances;
```

---

## 🚀 Ejecutar el Script Completo

```powershell
# Desde PowerShell (ejecutar el script SQL completo)
mysql -u root -p sports_events < DATABASE_MYSQL_HEIDI.sql

# O desde MySQL interactivo
mysql -u root -p
USE sports_events;
source DATABASE_MYSQL_HEIDI.sql;
```

---

¡Con este script tendrás una base de datos completamente poblada con datos de prueba realistas! 🎉
