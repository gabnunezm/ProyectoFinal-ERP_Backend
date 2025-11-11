-- ERP Académico - Script de creación de base de datos y tablas
-- Ejecutar en MySQL (ej: MySQL Workbench, phpMyAdmin o CLI)

DROP DATABASE IF EXISTS erp_academico;
CREATE DATABASE erp_academico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE erp_academico;

-- Roles de usuario (admin, docente, padre, estudiante, administrativo)
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
);

-- Usuarios generales (para login: admins, docentes, padres, administrativos)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabla de estudiantes (datos académicos / personales)
CREATE TABLE estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL, -- FK a usuarios
  codigo_estudiante VARCHAR(50) UNIQUE,
  fecha_nacimiento DATE,
  genero ENUM('M','F','O') DEFAULT 'O',
  telefono VARCHAR(50),
  direccion VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Docentes (puede mapearse a usuarios)
CREATE TABLE docentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  especialidad VARCHAR(150),
  telefono VARCHAR(50),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Cursos / Asignaturas
CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  creditos INT DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Secciones / Clases (curso + grupo + docente)
CREATE TABLE secciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  nombre_seccion VARCHAR(100),
  docente_id INT, -- FK a docentes
  jornada VARCHAR(50),
  horario VARCHAR(100),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id),
  FOREIGN KEY (docente_id) REFERENCES docentes(id)
);

-- Matrículas / Inscripciones (estudiante en sección)
CREATE TABLE inscripciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  seccion_id INT NOT NULL,
  fecha_inscripcion DATE DEFAULT (CURRENT_DATE),
  estado ENUM('inscrito','retirado','finalizado') DEFAULT 'inscrito',
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  FOREIGN KEY (seccion_id) REFERENCES secciones(id)
);

-- Periodos (ej: 2025-1)
CREATE TABLE periodos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE
);

-- Notas / Calificaciones (por inscripcion, por actividad)
CREATE TABLE calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inscripcion_id INT NOT NULL,
  periodo_id INT,
  tipo VARCHAR(100), -- ej: 'Parcial 1', 'Proyecto'
  nota DECIMAL(5,2) CHECK (nota >= 0),
  peso DECIMAL(5,2) DEFAULT 100,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id),
  FOREIGN KEY (periodo_id) REFERENCES periodos(id)
);

-- Asistencias (registro diario por materia/seccion)
CREATE TABLE asistencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inscripcion_id INT NOT NULL,
  seccion_id INT NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('presente','ausente','tarde','justificado') DEFAULT 'presente',
  anotaciones VARCHAR(255),
  registrado_por INT, -- usuario quien registró
  registrado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id),
  FOREIGN KEY (seccion_id) REFERENCES secciones(id),
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);

-- Pagos / Finanzas
CREATE TABLE pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  tipo_pago ENUM('matricula','mensualidad','otro') DEFAULT 'mensualidad',
  monto DECIMAL(12,2) NOT NULL,
  fecha_pago DATE DEFAULT (CURRENT_DATE),
  metodo_pago VARCHAR(50),
  referencia VARCHAR(150),
  estado ENUM('pagado','pendiente','anulado') DEFAULT 'pagado',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
);

-- Índices importantes
CREATE INDEX idx_usuario_email ON usuarios(email);
CREATE INDEX idx_estudiante_usuario ON estudiantes(usuario_id);
CREATE INDEX idx_inscripcion_estudiante ON inscripciones(estudiante_id);
CREATE INDEX idx_calificacion_inscripcion ON calificaciones(inscripcion_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);

-- Seed (ejemplos)
INSERT INTO roles (name, description) VALUES
('admin','Administrador del sistema'),
('docente','Docente'),
('padre','Padre / Tutor'),
('estudiante','Estudiante'),
('administrativo','Personal administrativo');

-- Usuario admin de ejemplo (nota: cambiar contraseña en producción)
-- Aquí usamos texto 'admin123' como ejemplo: en el backend debes hashear el password.
INSERT INTO usuarios (nombre, email, password_hash, role_id)
VALUES ('Administrador Principal','admin@ejemplo.com','$2a$10$EXAMPLEHASHPLACEHOLDER', 1);

-- Si quieres, puedes insertar algunos cursos y periodos de ejemplo:
INSERT INTO cursos (codigo, nombre, descripcion, creditos) VALUES
('MAT101','Matemáticas I','Matemáticas básicas',3),
('INF201','Programación I','Introducción a la programación',4);

INSERT INTO periodos (nombre, fecha_inicio, fecha_fin) VALUES
('2025-1','2025-02-01','2025-06-30');

-- Vistas
SELECT * FROM estudiantes;
SELECT * FROM usuarios;
-- SELECT * FROM
