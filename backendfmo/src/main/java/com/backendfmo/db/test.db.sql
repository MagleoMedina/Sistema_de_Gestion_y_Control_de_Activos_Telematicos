BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "SPRING_SESSION" (
	"PRIMARY_ID"	CHAR(36) NOT NULL,
	"SESSION_ID"	CHAR(36) NOT NULL,
	"CREATION_TIME"	INTEGER NOT NULL,
	"LAST_ACCESS_TIME"	INTEGER NOT NULL,
	"MAX_INACTIVE_INTERVAL"	INTEGER NOT NULL,
	"EXPIRY_TIME"	INTEGER NOT NULL,
	"PRINCIPAL_NAME"	VARCHAR(100),
	CONSTRAINT "SPRING_SESSION_PK" PRIMARY KEY("PRIMARY_ID")
);
CREATE TABLE IF NOT EXISTS "SPRING_SESSION_ATTRIBUTES" (
	"SESSION_PRIMARY_ID"	CHAR(36) NOT NULL,
	"ATTRIBUTE_NAME"	VARCHAR(200) NOT NULL,
	"ATTRIBUTE_BYTES"	BLOB NOT NULL,
	CONSTRAINT "SPRING_SESSION_ATTRIBUTES_PK" PRIMARY KEY("SESSION_PRIMARY_ID","ATTRIBUTE_NAME"),
	CONSTRAINT "SPRING_SESSION_ATTRIBUTES_FK" FOREIGN KEY("SESSION_PRIMARY_ID") REFERENCES "SPRING_SESSION"("PRIMARY_ID") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "actividad" (
	"id"	INTEGER,
	"nombre_de_actividad"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "aplicaciones" (
	"id"	INTEGER,
	"nombre"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "aplicaciones_recibo_equipos" (
	"id"	INTEGER,
	"aplicaciones"	INTEGER,
	"recibo_de_equipos"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("aplicaciones") REFERENCES "aplicaciones"("id") ON UPDATE CASCADE,
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "carpeta_de_red" (
	"id"	INTEGER,
	"nombre_carpeta"	Text,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "carpeta_red_recibo" (
	"id"	INTEGER,
	"recibo_de_equipos"	INTEGER,
	"carpeta_de_red"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("carpeta_de_red") REFERENCES "carpeta_de_red"("id") ON UPDATE CASCADE,
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "componentes_computadora_internos" (
	"id"	INTEGER,
	"nombre"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "componentes_internos_cpu_daet" (
	"id"	INTEGER,
	"entregas_al_daet"	INTEGER,
	"componentes_computadora_internos"	INTEGER,
	"cantidad"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE,
	FOREIGN KEY("entregas_al_daet") REFERENCES "entregas_al_daet"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "componentes_recibo" (
	"id"	INTEGER,
	"recibo_de_equipos"	INTEGER,
	"componentes_computadora_internos"	INTEGER,
	"cantidad"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE,
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "encabezado_recibo" (
	"id"	INTEGER,
	"usuario"	INTEGER,
	"fmo_equipo"	TEXT,
	"solicitud_DAET"	TEXT,
	"solicitud_ST"	TEXT,
	"entregado_por"	TEXT,
	"recibido_por"	TEXT,
	"asignado_a"	TEXT,
	"estatus"	TEXT,
	"falla"	TEXT,
	"fecha"	TEXT,
	"observacion"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("usuario") REFERENCES "usuario"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "entregas_al_daet" (
	"id"	INTEGER,
	"encabezado_recibo"	INTEGER,
	"actividad"	TEXT,
	"perifericos"	INTEGER,
	"fmo_serial"	TEXT,
	"estado"	TEXT,
	"identifique"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("encabezado_recibo") REFERENCES "encabezado_recibo"("id") ON UPDATE CASCADE,
	FOREIGN KEY("perifericos") REFERENCES "perifericos"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "perifericos" (
	"id"	INTEGER,
	"nombre"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "recibo_de_equipos" (
	"id"	INTEGER,
	"encabezado_recibo"	INTEGER,
	"respaldo"	TEXT,
	"marca"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("encabezado_recibo") REFERENCES "encabezado_recibo"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "recibo_de_perifericos" (
	"id"	INTEGER,
	"encabezado_recibo"	INTEGER,
	"componentes_computadora_internos"	INTEGER,
	"fmo_serial"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("componentes_computadora_internos") REFERENCES "componentes_computadora_internos"("id") ON UPDATE CASCADE,
	FOREIGN KEY("encabezado_recibo") REFERENCES "encabezado_recibo"("id") ON UPDATE CASCADE
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
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE,
	FOREIGN KEY("serial_componentes") REFERENCES "serial_componentes"("id") ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "usuario" (
	"id"	INTEGER,
	"usuario"	TEXT,
	"clave"	TEXT,
	"ficha"	INTEGER,
	"nombre"	TEXT,
	"extension"	TEXT,
	"gerencia"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "usuario_sistema" (
	"id"	INTEGER,
	"username"	TEXT NOT NULL UNIQUE,
	"clave"	TEXT NOT NULL,
	"tipo"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "recibo_perifericos"(
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"recibo_de_equipos" INTEGER,
	"perifericos" INTEGER,
	FOREIGN KEY("recibo_de_equipos") REFERENCES "recibo_de_equipos"("id") ON UPDATE CASCADE,
	FOREIGN KEY("perifericos") REFERENCES "perifericos"("id") ON UPDATE CASCADE

);
INSERT INTO "aplicaciones" ("id","nombre") VALUES (1,'SIQUEL');
INSERT INTO "aplicaciones" ("id","nombre") VALUES (2,'SAP');
INSERT INTO "aplicaciones" ("id","nombre") VALUES (3,'AUTOCAD');
INSERT INTO "aplicaciones" ("id","nombre") VALUES (4,'PROJECT');


INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (1,'');
INSERT INTO "componentes_computadora_internos" ("id","nombre") VALUES (2,'');
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

CREATE UNIQUE INDEX IF NOT EXISTS "SPRING_SESSION_IX1" ON "SPRING_SESSION" (
	"SESSION_ID"
);
CREATE INDEX IF NOT EXISTS "SPRING_SESSION_IX2" ON "SPRING_SESSION" (
	"EXPIRY_TIME"
);
CREATE INDEX IF NOT EXISTS "SPRING_SESSION_IX3" ON "SPRING_SESSION" (
	"PRINCIPAL_NAME"
);
COMMIT;
