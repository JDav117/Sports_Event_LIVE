-- ============================================
-- SCRIPT PARA RESETEAR LA BASE DE DATOS
-- Ejecuta este script en HeidiSQL o MySQL Workbench
-- ============================================

-- Eliminar la base de datos si existe
DROP DATABASE IF EXISTS sports_events;

-- Crear la base de datos nueva
CREATE DATABASE sports_events 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos
USE sports_events;

-- Las tablas se crearán automáticamente por TypeORM cuando inicies la aplicación
-- con synchronize: true en app.module.ts
