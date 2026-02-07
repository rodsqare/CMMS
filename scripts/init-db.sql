-- CreateTable usuarios
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "intentos_fallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueado_hasta" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable equipos
CREATE TABLE IF NOT EXISTS "equipos" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL UNIQUE,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "numero_serie" TEXT,
    "ubicacion" TEXT,
    "fecha_adquisicion" TIMESTAMP(3),
    "vida_util_anos" INTEGER,
    "valor_adquisicion" DECIMAL(65,30),
    "estado" TEXT NOT NULL,
    "criticidad" TEXT NOT NULL,
    "descripcion" TEXT,
    "especificaciones" JSONB,
    "ultima_mantencion" TIMESTAMP(3),
    "proxima_mantencion" TIMESTAMP(3),
    "horas_operacion" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable ordenes_trabajo
CREATE TABLE IF NOT EXISTS "ordenes_trabajo" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "numero_orden" TEXT NOT NULL UNIQUE,
    "equipo_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_programada" TIMESTAMP(3),
    "fecha_inicio" TIMESTAMP(3),
    "fecha_finalizacion" TIMESTAMP(3),
    "tiempo_estimado" INTEGER,
    "tiempo_real" INTEGER,
    "costo_estimado" DECIMAL(65,30),
    "costo_real" DECIMAL(65,30),
    "creado_por" INTEGER NOT NULL,
    "asignado_a" INTEGER,
    "notas" TEXT,
    "resultado" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ordenes_trabajo_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ordenes_trabajo_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios" ("id") ON UPDATE CASCADE,
    CONSTRAINT "ordenes_trabajo_asignado_a_fkey" FOREIGN KEY ("asignado_a") REFERENCES "usuarios" ("id") ON UPDATE CASCADE
);

-- CreateTable mantenimientos
CREATE TABLE IF NOT EXISTS "mantenimientos" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "equipo_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "frecuencia_dias" INTEGER NOT NULL,
    "ultima_realizacion" TIMESTAMP(3),
    "proxima_programada" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "procedimiento" TEXT,
    "tiempo_estimado" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_por" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "mantenimientos_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mantenimientos_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios" ("id") ON UPDATE CASCADE
);

-- CreateTable mantenimientos_realizados
CREATE TABLE IF NOT EXISTS "mantenimientos_realizados" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "mantenimiento_id" INTEGER NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "fecha_realizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "realizado_por" INTEGER NOT NULL,
    "tiempo_real" INTEGER,
    "costo" DECIMAL(65,30),
    "observaciones" TEXT,
    "tareas_realizadas" JSONB,
    "estado_equipo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "mantenimientos_realizados_mantenimiento_id_fkey" FOREIGN KEY ("mantenimiento_id") REFERENCES "mantenimientos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mantenimientos_realizados_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mantenimientos_realizados_realizado_por_fkey" FOREIGN KEY ("realizado_por") REFERENCES "usuarios" ("id") ON UPDATE CASCADE
);

-- CreateTable documentos
CREATE TABLE IF NOT EXISTS "documentos" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ruta_archivo" TEXT NOT NULL,
    "tipo_archivo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "equipo_id" INTEGER,
    "orden_id" INTEGER,
    "subido_por" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "documentos_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documentos_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_trabajo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documentos_subido_por_fkey" FOREIGN KEY ("subido_por") REFERENCES "usuarios" ("id") ON UPDATE CASCADE
);

-- CreateTable notificaciones
CREATE TABLE IF NOT EXISTS "notificaciones" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "usuario_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datos" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable logs
CREATE TABLE IF NOT EXISTS "logs" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "usuario_id" INTEGER,
    "accion" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "datos" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable configuracion
CREATE TABLE IF NOT EXISTS "configuracion" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "clave" TEXT NOT NULL UNIQUE,
    "valor" TEXT,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex usuarios
CREATE INDEX IF NOT EXISTS "usuarios_email_idx" ON "usuarios"("email");
CREATE INDEX IF NOT EXISTS "usuarios_rol_idx" ON "usuarios"("rol");

-- CreateIndex equipos
CREATE INDEX IF NOT EXISTS "equipos_codigo_idx" ON "equipos"("codigo");
CREATE INDEX IF NOT EXISTS "equipos_estado_idx" ON "equipos"("estado");
CREATE INDEX IF NOT EXISTS "equipos_tipo_idx" ON "equipos"("tipo");

-- CreateIndex ordenes_trabajo
CREATE INDEX IF NOT EXISTS "ordenes_trabajo_numero_orden_idx" ON "ordenes_trabajo"("numero_orden");
CREATE INDEX IF NOT EXISTS "ordenes_trabajo_equipo_id_idx" ON "ordenes_trabajo"("equipo_id");
CREATE INDEX IF NOT EXISTS "ordenes_trabajo_estado_idx" ON "ordenes_trabajo"("estado");
CREATE INDEX IF NOT EXISTS "ordenes_trabajo_prioridad_idx" ON "ordenes_trabajo"("prioridad");
CREATE INDEX IF NOT EXISTS "ordenes_trabajo_creado_por_idx" ON "ordenes_trabajo"("creado_por");
CREATE INDEX IF NOT EXISTS "ordenes_trabajo_asignado_a_idx" ON "ordenes_trabajo"("asignado_a");

-- CreateIndex mantenimientos
CREATE INDEX IF NOT EXISTS "mantenimientos_equipo_id_idx" ON "mantenimientos"("equipo_id");
CREATE INDEX IF NOT EXISTS "mantenimientos_proxima_programada_idx" ON "mantenimientos"("proxima_programada");
CREATE INDEX IF NOT EXISTS "mantenimientos_activo_idx" ON "mantenimientos"("activo");

-- CreateIndex mantenimientos_realizados
CREATE INDEX IF NOT EXISTS "mantenimientos_realizados_mantenimiento_id_idx" ON "mantenimientos_realizados"("mantenimiento_id");
CREATE INDEX IF NOT EXISTS "mantenimientos_realizados_equipo_id_idx" ON "mantenimientos_realizados"("equipo_id");
CREATE INDEX IF NOT EXISTS "mantenimientos_realizados_fecha_realizacion_idx" ON "mantenimientos_realizados"("fecha_realizacion");

-- CreateIndex documentos
CREATE INDEX IF NOT EXISTS "documentos_equipo_id_idx" ON "documentos"("equipo_id");
CREATE INDEX IF NOT EXISTS "documentos_orden_id_idx" ON "documentos"("orden_id");
CREATE INDEX IF NOT EXISTS "documentos_tipo_idx" ON "documentos"("tipo");

-- CreateIndex notificaciones
CREATE INDEX IF NOT EXISTS "notificaciones_usuario_id_idx" ON "notificaciones"("usuario_id");
CREATE INDEX IF NOT EXISTS "notificaciones_leida_idx" ON "notificaciones"("leida");
CREATE INDEX IF NOT EXISTS "notificaciones_tipo_idx" ON "notificaciones"("tipo");

-- CreateIndex logs
CREATE INDEX IF NOT EXISTS "logs_usuario_id_idx" ON "logs"("usuario_id");
CREATE INDEX IF NOT EXISTS "logs_accion_idx" ON "logs"("accion");
CREATE INDEX IF NOT EXISTS "logs_modulo_idx" ON "logs"("modulo");
CREATE INDEX IF NOT EXISTS "logs_created_at_idx" ON "logs"("created_at");

-- CreateIndex configuracion
CREATE INDEX IF NOT EXISTS "configuracion_clave_idx" ON "configuracion"("clave");
