/* The sqlite database schema */

DROP TABLE IF EXISTS rack;

CREATE VIRTUAL TABLE rack (
    id INTEGER PRIMARY KEY UNIQUE AUTOINCREMENT,
    latitude REAL UNIQUE NOT NULL,
    longitude REAL UNIQUE NOT NULL
);
