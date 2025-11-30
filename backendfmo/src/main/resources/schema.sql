BEGIN TRANSACTION;

-- Create SPRING_SESSION table
CREATE TABLE SPRING_SESSION (
    PRIMARY_ID CHAR(36) NOT NULL,
    SESSION_ID CHAR(36) NOT NULL,
    CREATION_TIME INTEGER NOT NULL,
    LAST_ACCESS_TIME INTEGER NOT NULL,
    MAX_INACTIVE_INTERVAL INTEGER NOT NULL,
    EXPIRY_TIME INTEGER NOT NULL,
    PRINCIPAL_NAME VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);

CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

-- Create SPRING_SESSION_ATTRIBUTES table
CREATE TABLE SPRING_SESSION_ATTRIBUTES (
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
CREATE TABLE IF NOT EXISTS carpeta_de_red (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre_carpeta Text 
);
CREATE TABLE IF NOT EXISTS carpeta_red_recibo (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	recibo_de_equipos INTEGER,
	carpeta_de_red INTEGER,
	FOREIGN KEY(recibo_de_equipos) REFERENCES recibo_de_equipos(id) ON UPDATE CASCADE,
	FOREIGN KEY(carpeta_de_red)REFERENCES carpeta_de_red(id) ON UPDATE CASCADE

);
CREATE TABLE IF NOT EXISTS componentes_computadora_internos (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT
);
CREATE TABLE IF NOT EXISTS componentes_internos_cpu_daet (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	entregas_al_daet INTEGER,
	componentes_computadora_internos INTEGER,
	cantidad INTEGER,
	FOREIGN KEY(entregas_al_daet) REFERENCES entregas_al_daet(id) ON UPDATE CASCADE,
	FOREIGN KEY (componentes_computadora_internos) REFERENCES componentes_computadora_internos(id) ON UPDATE CASCADE

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
CREATE TABLE IF NOT EXISTS perifericos (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nombre TEXT
);
CREATE TABLE IF NOT EXISTS entregas_al_daet (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	encabezado_recibo INTEGER,
	actividad TEXT,
	perifericos INTEGER,
	fmo_serial TEXT,
	FOREIGN KEY(encabezado_recibo) REFERENCES encabezado_recibo(id) ON UPDATE CASCADE,
	FOREIGN KEY(perifericos)REFERENCES perifericos(id) ON UPDATE CASCADE

);
CREATE TABLE IF NOT EXISTS recibo_de_equipos(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	encabezado_recibo INTEGER,
	respaldo TEXT,
	marca TEXT,
	FOREIGN KEY(encabezado_recibo) REFERENCES encabezado_recibo(id) ON UPDATE CASCADE

);
CREATE TABLE IF NOT EXISTS recibo_de_perifericos (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	encabezado_recibo INTEGER,
	componentes_computadora_internos INTEGER,
	fmo_serial TEXT,
	FOREIGN KEY(encabezado_recibo) REFERENCES encabezado_recibo(id) ON UPDATE CASCADE,
	FOREIGN KEY(componentes_computadora_internos)REFERENCES componentes_computadora_internos(id) ON UPDATE CASCADE

);
CREATE TABLE IF NOT EXISTS serial_componentes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	componentes_computadora_internos INTEGER,
	marca TEXT,
	serial TEXT,
	capacidad TEXT,
	FOREIGN KEY(componentes_computadora_internos) REFERENCES componentes_computadora_internos(id) ON UPDATE CASCADE

);
CREATE TABLE IF NOT EXISTS serial_recibo (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	recibo_de_equipos INTEGER,
	serial_componentes INTEGER,
	FOREIGN KEY(recibo_de_equipos) REFERENCES recibo_de_equipos(id) ON UPDATE CASCADE,
	FOREIGN KEY(serial_componentes)REFERENCES serial_componentes(id) ON UPDATE CASCADE

);
CREATE TABLE IF NOT EXISTS usuario (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	usuario TEXT,
	clave TEXT,
	ficha INTEGER,
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
CREATE TABLE IF NOT EXISTS componentes_recibo (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	recibo_de_equipos INTEGER,
	componentes_computadora_internos INTEGER,
	cantidad INTEGER,
	FOREIGN KEY(recibo_de_equipos) REFERENCES recibo_de_equipos(id) ON UPDATE CASCADE,
	FOREIGN KEY(componentes_computadora_internos)REFERENCES componentes_computadora_internos(id) ON UPDATE CASCADE

);

COMMIT;
