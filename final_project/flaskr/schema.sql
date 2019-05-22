/* The sqlite database schema */

DROP TABLE IF EXISTS bikeracks;

CREATE TABLE bikeracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL UNIQUE NOT NULL,
    longitude REAL UNIQUE NOT NULL,
    address TEXT
);
