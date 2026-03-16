BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS SPRING_SESSION (
    PRIMARY_ID CHAR(36) NOT NULL,
    SESSION_ID CHAR(36) NOT NULL,
    CREATION_TIME INTEGER NOT NULL,
    LAST_ACCESS_TIME INTEGER NOT NULL,
    MAX_INACTIVE_INTERVAL INTEGER NOT NULL,
    EXPIRY_TIME INTEGER NOT NULL,
    PRINCIPAL_NAME VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);
CREATE TABLE IF NOT EXISTS SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36) NOT NULL,
    ATTRIBUTE_NAME VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES BLOB NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID) REFERENCES SPRING_SESSION(PRIMARY_ID) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS actividad (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre_de_actividad TEXT

);
CREATE TABLE IF NOT EXISTS aplicaciones (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT
);
CREATE TABLE IF NOT EXISTS "aplicaciones_recibo_equipos" (
	"id"	INTEGER,
	"aplicaciones"	INTEGER,
	"recibo_de_equipos"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("aplicaciones") REFERENCES "aplicaciones"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS carpeta_de_red (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre_carpeta Text 
);
CREATE TABLE IF NOT EXISTS "carpeta_red_recibo" (
	"id"	INTEGER,
	"recibo_de_equipos"	INTEGER,
	"carpeta_de_red"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("carpeta_de_red") REFERENCES "carpeta_de_red"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS componentes_computadora_internos (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT
);
CREATE TABLE IF NOT EXISTS "componentes_internos_cpu_daet" (
	"id"	INTEGER,
	"entregas_al_daet"	INTEGER,
	"componentes_computadora_internos"	INTEGER,
	"cantidad"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("entregas_al_daet") REFERENCES "entregas_al_daet"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "componentes_recibo" (
	"id"	INTEGER,
	"recibo_de_equipos"	INTEGER,
	"componentes_computadora_internos"	INTEGER,
	"cantidad"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "control_stock" (
	"id"	INTEGER,
	"perifericos"	INTEGER,
	"componentes_computadora_internos"	INTEGER,
	"categoria"	TEXT,
	"marca"	TEXT,
	"caracteristicas"	TEXT,
	"serial" TEXT UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("perifericos") REFERENCES "perifericos"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT "check_tipo_item" CHECK(("componentes_computadora_internos" IS NOT NULL AND "perifericos" IS NULL) OR ("componentes_computadora_internos" IS NULL AND "perifericos" IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS encabezado_recibo (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	usuario INTEGER,
	fmo_equipo TEXT,
	solicitud_DAET TEXT,
	solicitud_ST TEXT,
	entregado_por TEXT,
	recibido_por TEXT,
	asignado_a TEXT,
	estatus TEXT,
	falla TEXT,
	fecha TEXT,
	observacion TEXT,
	FOREIGN KEY(usuario) REFERENCES usuario(id) ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "entregas_al_daet" (
	"id"	INTEGER,
	"encabezado_recibo"	INTEGER,
	"actividad"	TEXT,
	"perifericos"	TEXT,
	"fmo_serial"	TEXT,
	"estado"	TEXT,
	"identifique"	TEXT,
	"componentes_computadora_internos"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("encabezado_recibo") REFERENCES "encabezado_recibo"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("perifericos") REFERENCES "perifericos"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS perifericos (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT
);
CREATE TABLE IF NOT EXISTS "recibo_de_equipos" (
	"id"	INTEGER,
	"encabezado_recibo"	INTEGER,
	"respaldo"	TEXT,
	"marca"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("encabezado_recibo") REFERENCES "encabezado_recibo"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "recibo_de_perifericos" (
	"id"	INTEGER,
	"encabezado_recibo"	INTEGER,
	"componentes_computadora_internos"	INTEGER,
	"fmo_serial"	TEXT,
	"perifericos"	INTEGER,
	"otro"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("encabezado_recibo") REFERENCES "encabezado_recibo"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("perifericos") REFERENCES "perifericos"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "perifericos_del_equipo" (
	"id"	INTEGER,
	"recibo_de_equipos"	INTEGER,
	"perifericos"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("perifericos") REFERENCES "perifericos"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "serial_componentes" (
	"id"	INTEGER,
	"componentes_computadora_internos"	INTEGER,
	"marca"	TEXT,
	"serial"	TEXT,
	"capacidad"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "serial_recibo" (
	"id"	INTEGER,
	"recibo_de_equipos"	INTEGER,
	"serial_componentes"	INTEGER,
	"observacion"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY("serial_componentes") REFERENCES "serial_componentes"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS usuario (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	usuario TEXT,
	clave TEXT,
	ficha INTEGER UNIQUE,
	nombre TEXT,
	extension TEXT,
	gerencia TEXT
);
CREATE TABLE IF NOT EXISTS usuario_sistema (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE NOT NULL,
	clave TEXT NOT NULL,
	tipo TEXT 
);
CREATE TABLE IF NOT EXISTS casos_resueltos(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	usuario INTEGER,
	fecha TEXT,
	reporte TEXT,
	atendido_por TEXT,
	equipo TEXT,
	FOREIGN KEY(usuario) REFERENCES usuario(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS relacion_stock(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	control_stock INTEGER,
	encabezado_recibo INTEGER,
	FOREIGN KEY(control_stock) REFERENCES control_stock(id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY(encabezado_recibo) REFERENCES encabezado_recibo(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla para Institutos / Universidades
CREATE TABLE IF NOT EXISTS instituto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_instituto TEXT NOT NULL
);

-- Tabla Pasante (Hija de Usuario)
CREATE TABLE IF NOT EXISTS pasante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE NOT NULL, -- Relación 1 a 1 con Usuario
    instituto_id INTEGER NOT NULL,      -- Relación N a 1 con Instituto
    informe TEXT,                       -- Ruta del archivo PDF
    fotografia TEXT,                    -- Ruta del archivo PNG/JPG
    fecha_inicio TEXT,
    fecha_finalizacion TEXT,
    area_asignada INTEGER,
    fecha_de_nacimiento TEXT,
    titulo_pretendido TEXT,
	cedula TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (instituto_id) REFERENCES instituto(id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (area_asignada) REFERENCES departamento(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "gerencia" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"nombre" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "departamento" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"nombre" TEXT NOT NULL,
	"gerencia_id" INTEGER NOT NULL,
	FOREIGN KEY (gerencia_id) REFERENCES gerencia(id) ON UPDATE CASCADE ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS "marca" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"nombre" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "modelo" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"marca_id" INTEGER NOT NULL,
	"nombre" TEXT NOT NULL,
	FOREIGN KEY (marca_id) REFERENCES marca(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "dispositivo" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"fmo" TEXT NOT NULL,
	"modelo_id" INTEGER NOT NULL,
	"tipo" text NOT NULL,
	FOREIGN KEY (modelo_id) REFERENCES modelo(id) ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS "mantenimiento" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"gerencia_id" INTEGER NOT NULL,
	"analista" TEXT NOT NULL,
	"fecha" TEXT NOT NULL,
	FOREIGN KEY (gerencia_id) REFERENCES gerencia(id) ON UPDATE CASCADE ON DELETE CASCADE
); 

CREATE TABLE IF NOT EXISTS "mantenimiento_departamento" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"mantenimiento_id" INTEGER NOT NULL,
	"usuario_id" INTEGER NOT NULL,
	"departamento_id" INTEGER NOT NULL,
	"dispositivo_id" INTEGER NOT NULL,
	"so" TEXT NOT NULL,
	"observaciones" TEXT,
	FOREIGN KEY (mantenimiento_id) REFERENCES mantenimiento(id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (departamento_id) REFERENCES departamento(id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (dispositivo_id) REFERENCES dispositivo(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "mantenimiento_fotos"(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"mantenimiento_id" INTEGER NOT NULL,
	"foto_path" TEXT NOT NULL,
	FOREIGN KEY (mantenimiento_id) REFERENCES mantenimiento(id) ON UPDATE CASCADE ON DELETE CASCADE
);


INSERT INTO "perifericos" ("id","nombre") VALUES (1,'MONITOR');
INSERT INTO "perifericos" ("id","nombre") VALUES (2,'TECLADO');
INSERT INTO "perifericos" ("id","nombre") VALUES (3,'MOUSE');
INSERT INTO "perifericos" ("id","nombre") VALUES (4,'REGULADOR');
INSERT INTO "perifericos" ("id","nombre") VALUES (5,'IMPRESORA');
INSERT INTO "perifericos" ("id","nombre") VALUES (6,'SCANER');
INSERT INTO "perifericos" ("id","nombre") VALUES (7,'PENDRIVES');
INSERT INTO "perifericos" ("id","nombre") VALUES (8,'TONER');

INSERT INTO "aplicaciones" ("id","nombre") VALUES (1,'SIQUEL');
INSERT INTO "aplicaciones" ("id","nombre") VALUES (2,'SAP');
INSERT INTO "aplicaciones" ("id","nombre") VALUES (3,'AUTOCAD');
INSERT INTO "aplicaciones" ("id","nombre") VALUES (4,'PROJECT');


INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (3,'MEMORIA RAM');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (4,'DISCO DURO');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (5,'TARJETA MADRE');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (6,'PROCESADOR');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (7,'TARJETA DE VIDEO');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (8,'FUENTE DE PODER');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (9,'TARJETA DE RED');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (10,'FAN COOLER');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (11,'PILA');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (12,'WINDOWS');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (13,'CANAIMA');

COMMIT;
