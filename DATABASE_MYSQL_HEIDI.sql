-- ============================================
-- SCRIPT SQL PARA MYSQL/MARIADB (HeidiSQL)
-- Base de Datos: sports_events
-- ============================================

-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS sports_events 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sports_events;

-- ============================================
-- TABLAS (Estas se crean automáticamente por TypeORM)
-- Solo necesitas ejecutar esto si quieres crear manualmente
-- ============================================

-- Tabla: teams
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('sub-18', 'sub-21', 'libre', 'femenino', 'masculino', 'mixto') NOT NULL,
    coach VARCHAR(100) NOT NULL,
    maxPlayers INT NOT NULL,
    sportType ENUM('fútbol', 'básquet', 'voleibol', 'tenis', 'balonmano', 'otro') NOT NULL,
    tags TEXT,
    description TEXT,
    createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    location VARCHAR(200) NOT NULL,
    type ENUM('training', 'match', 'friendly', 'tournament') NOT NULL,
    status ENUM('scheduled', 'live', 'finished', 'cancelled') DEFAULT 'scheduled',
    maxAttendees INT,
    description TEXT,
    teamId VARCHAR(36) NOT NULL,
    createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: player_enrollments
CREATE TABLE IF NOT EXISTS player_enrollments (
    id VARCHAR(36) PRIMARY KEY,
    playerId VARCHAR(100) NOT NULL,
    playerName VARCHAR(100) NOT NULL,
    playerEmail VARCHAR(100) NOT NULL,
    enrollmentType ENUM('team', 'event', 'both') NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    teamId VARCHAR(36),
    eventId VARCHAR(36),
    notes TEXT,
    createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: attendances
CREATE TABLE IF NOT EXISTS attendances (
    id VARCHAR(36) PRIMARY KEY,
    playerId VARCHAR(100) NOT NULL,
    playerName VARCHAR(100) NOT NULL,
    eventId VARCHAR(36) NOT NULL,
    wasPresent BOOLEAN DEFAULT FALSE,
    minutesConnected INT DEFAULT 0,
    participationCount INT DEFAULT 0,
    participations JSON,
    recordedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================

CREATE INDEX idx_teams_coach ON teams(coach);
CREATE INDEX idx_teams_sportType ON teams(sportType);
CREATE INDEX idx_events_teamId ON events(teamId);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_startTime ON events(startTime);
CREATE INDEX idx_enrollments_playerId ON player_enrollments(playerId);
CREATE INDEX idx_enrollments_teamId ON player_enrollments(teamId);
CREATE INDEX idx_enrollments_eventId ON player_enrollments(eventId);
CREATE INDEX idx_enrollments_status ON player_enrollments(status);
CREATE INDEX idx_attendances_playerId ON attendances(playerId);
CREATE INDEX idx_attendances_eventId ON attendances(eventId);

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- Limpiar datos existentes (opcional)
DELETE FROM attendances;
DELETE FROM player_enrollments;
DELETE FROM events;
DELETE FROM teams;

-- Resetear auto-increment (opcional, solo si usas auto-increment)
-- ALTER TABLE teams AUTO_INCREMENT = 1;

-- ============================================
-- EQUIPOS
-- ============================================

INSERT INTO teams (id, name, category, coach, maxPlayers, sportType, tags, description, createdAt, updatedAt)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Tigres FC', 'sub-18', 'Juan Pérez', 25, 'fútbol', 'entrenamiento,torneo', 'Equipo sub-18 de fútbol competitivo', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Leones Basketball', 'libre', 'María García', 15, 'básquet', 'torneo,amistoso', 'Equipo de básquetbol categoría libre', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Panteras Volleyball', 'femenino', 'Ana López', 18, 'voleibol', 'entrenamiento', 'Equipo femenino de voleibol', NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'Águilas FC', 'masculino', 'Roberto Díaz', 22, 'fútbol', 'torneo', 'Equipo masculino de fútbol profesional', NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', 'Tiburones Tennis', 'sub-21', 'Elena Morales', 12, 'tenis', 'entrenamiento,amistoso', 'Equipo sub-21 de tenis', NOW(), NOW());

-- ============================================
-- EVENTOS
-- ============================================

INSERT INTO events (id, name, startTime, endTime, location, type, status, maxAttendees, description, teamId, createdAt, updatedAt)
VALUES 
    -- Eventos programados (futuros)
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Entrenamiento Táctico', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 2 HOUR, 'Estadio Municipal', 'training', 'scheduled', 20, 'Entrenamiento enfocado en táctica defensiva', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Práctica de Tiros', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 2 HOUR, 'Polideportivo Central', 'training', 'scheduled', 12, 'Entrenamiento de tiros libres y triples', '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Partido Amistoso vs Tiburones', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 1 HOUR, 'Cancha Central', 'friendly', 'scheduled', 10, 'Partido amistoso de preparación', '55555555-5555-5555-5555-555555555555', NOW(), NOW()),
    
    -- Evento en vivo (para testing WebSocket)
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Partido vs Águilas', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_ADD(NOW(), INTERVAL 90 MINUTE), 'Estadio Principal', 'match', 'live', 22, 'Partido importante de torneo', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
    
    -- Evento finalizado (para estadísticas)
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Torneo Interescolar', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 3 HOUR, 'Gimnasio Municipal', 'tournament', 'finished', 16, 'Torneo interescolar de voleibol', '33333333-3333-3333-3333-333333333333', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ============================================
-- INSCRIPCIONES DE JUGADORES
-- ============================================

INSERT INTO player_enrollments (id, playerId, playerName, playerEmail, enrollmentType, status, teamId, eventId, notes, createdAt, updatedAt)
VALUES 
    -- Jugadores Tigres FC
    ('e1111111-1111-1111-1111-111111111111', 'player-001', 'Carlos Martínez', 'carlos@example.com', 'both', 'approved', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Capitán del equipo', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
    ('e2222222-2222-2222-2222-222222222222', 'player-002', 'Luis Rodríguez', 'luis@example.com', 'both', 'approved', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Delantero', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY)),
    ('e3333333-3333-3333-3333-333333333333', 'player-003', 'Pedro Sánchez', 'pedro@example.com', 'team', 'approved', '11111111-1111-1111-1111-111111111111', NULL, 'Defensa', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
    ('e4444444-4444-4444-4444-444444444444', 'player-004', 'Miguel Torres', 'miguel@example.com', 'both', 'pending', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Portero', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
    ('e9999999-9999-9999-9999-999999999999', 'player-009', 'Diego Vargas', 'diego@example.com', 'both', 'approved', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mediocampista', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
    
    -- Jugadores Leones Basketball
    ('e5555555-5555-5555-5555-555555555555', 'player-005', 'Ana Silva', 'ana@example.com', 'both', 'approved', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Base', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
    ('e6666666-6666-6666-6666-666666666666', 'player-006', 'Roberto Méndez', 'roberto@example.com', 'team', 'approved', '22222222-2222-2222-2222-222222222222', NULL, 'Alero', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
    
    -- Jugadoras Panteras Volleyball
    ('e7777777-7777-7777-7777-777777777777', 'player-007', 'Laura Fernández', 'laura@example.com', 'both', 'approved', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Rematadora', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
    ('e8888888-8888-8888-8888-888888888888', 'player-008', 'Sofía Ramírez', 'sofia@example.com', 'both', 'approved', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Líbero', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
    ('eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'player-010', 'Valeria Castro', 'valeria@example.com', 'both', 'approved', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Colocadora', DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY));

-- ============================================
-- REGISTROS DE ASISTENCIA
-- ============================================

INSERT INTO attendances (id, playerId, playerName, eventId, wasPresent, minutesConnected, participationCount, participations, recordedAt)
VALUES 
    -- Asistencia evento en vivo (Partido vs Águilas)
    ('a1111111-1111-1111-1111-111111111111', 'player-001', 'Carlos Martínez', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', TRUE, 45, 5, 
     JSON_ARRAY(
         JSON_OBJECT('type', 'chat_message', 'content', '¡Vamos equipo!', 'timestamp', NOW()),
         JSON_OBJECT('type', 'tactical_feedback', 'content', 'Presión alta en defensa', 'timestamp', NOW()),
         JSON_OBJECT('type', 'chat_message', 'content', 'Buen juego', 'timestamp', NOW())
     ), NOW()),
    ('a2222222-2222-2222-2222-222222222222', 'player-002', 'Luis Rodríguez', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', TRUE, 42, 3,
     JSON_ARRAY(
         JSON_OBJECT('type', 'chat_message', 'content', 'Listos!', 'timestamp', NOW()),
         JSON_OBJECT('type', 'substitution_request', 'content', 'Necesito descanso', 'timestamp', NOW())
     ), NOW()),
    
    -- Asistencia evento finalizado (Torneo Panteras)
    ('a3333333-3333-3333-3333-333333333333', 'player-007', 'Laura Fernández', 'dddddddd-dddd-dddd-dddd-dddddddddddd', TRUE, 180, 12,
     JSON_ARRAY(
         JSON_OBJECT('type', 'chat_message', 'content', 'Excelente trabajo equipo', 'timestamp', DATE_SUB(NOW(), INTERVAL 5 DAY)),
         JSON_OBJECT('type', 'tactical_feedback', 'content', 'Rotación perfecta', 'timestamp', DATE_SUB(NOW(), INTERVAL 5 DAY))
     ), DATE_SUB(NOW(), INTERVAL 5 DAY)),
    ('a4444444-4444-4444-4444-444444444444', 'player-008', 'Sofía Ramírez', 'dddddddd-dddd-dddd-dddd-dddddddddddd', TRUE, 175, 8,
     JSON_ARRAY(
         JSON_OBJECT('type', 'chat_message', 'content', '¡A ganar!', 'timestamp', DATE_SUB(NOW(), INTERVAL 5 DAY)),
         JSON_OBJECT('type', 'timeout_request', 'content', 'Tomar agua', 'timestamp', DATE_SUB(NOW(), INTERVAL 5 DAY))
     ), DATE_SUB(NOW(), INTERVAL 5 DAY)),
    ('a5555555-5555-5555-5555-555555555555', 'player-010', 'Valeria Castro', 'dddddddd-dddd-dddd-dddd-dddddddddddd', TRUE, 165, 6,
     JSON_ARRAY(
         JSON_OBJECT('type', 'chat_message', 'content', '¡Sí se puede!', 'timestamp', DATE_SUB(NOW(), INTERVAL 5 DAY))
     ), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

SELECT 'EQUIPOS' as tipo, COUNT(*) as cantidad FROM teams
UNION ALL
SELECT 'EVENTOS', COUNT(*) FROM events
UNION ALL
SELECT 'INSCRIPCIONES', COUNT(*) FROM player_enrollments
UNION ALL
SELECT 'ASISTENCIAS', COUNT(*) FROM attendances;

-- ============================================
-- CONSULTAS ÚTILES PARA HEIDSQL
-- ============================================

-- Ver todos los equipos con sus estadísticas
SELECT 
    t.name AS equipo,
    t.coach AS entrenador,
    t.sportType AS deporte,
    t.category AS categoria,
    t.maxPlayers AS max_jugadores,
    COUNT(DISTINCT pe.id) AS jugadores_inscritos,
    COUNT(DISTINCT e.id) AS eventos_totales,
    SUM(CASE WHEN e.status = 'scheduled' THEN 1 ELSE 0 END) AS eventos_programados,
    SUM(CASE WHEN e.status = 'live' THEN 1 ELSE 0 END) AS eventos_en_vivo
FROM teams t
LEFT JOIN player_enrollments pe ON t.id = pe.teamId AND pe.status = 'approved'
LEFT JOIN events e ON t.id = e.teamId
GROUP BY t.id;

-- Ver eventos próximos
SELECT 
    e.name AS evento,
    e.type AS tipo,
    e.startTime AS inicio,
    e.location AS ubicacion,
    t.name AS equipo,
    COUNT(pe.id) AS inscritos
FROM events e
LEFT JOIN teams t ON e.teamId = t.id
LEFT JOIN player_enrollments pe ON e.id = pe.eventId AND pe.status = 'approved'
WHERE e.status = 'scheduled' AND e.startTime >= NOW()
GROUP BY e.id
ORDER BY e.startTime;

-- Estadísticas de asistencia
SELECT 
    e.name AS evento,
    COUNT(a.id) AS total_asistencias,
    SUM(CASE WHEN a.wasPresent = 1 THEN 1 ELSE 0 END) AS presentes,
    ROUND(AVG(a.minutesConnected), 2) AS minutos_promedio,
    ROUND(AVG(a.participationCount), 2) AS participaciones_promedio
FROM events e
LEFT JOIN attendances a ON e.id = a.eventId
WHERE e.status = 'finished'
GROUP BY e.id;
