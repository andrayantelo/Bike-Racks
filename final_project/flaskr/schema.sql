/* The sqlite database schema */

DROP TABLE IF EXISTS rack;

CREATE TABLE rack (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL UNIQUE NOT NULL,
    longitude REAL UNIQUE NOT NULL
);
