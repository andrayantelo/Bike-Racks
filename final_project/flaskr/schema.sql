/* The sqlite database schema */
/* Why is 'status' blue 
There are actually 3 states a bikerack can be in: approved (1), pending (0), and
rejected (-1). */

DROP TABLE IF EXISTS bikeracks;

CREATE TABLE bikeracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status INTEGER DEFAULT 0,
    latitude REAL UNIQUE NOT NULL,
    longitude REAL UNIQUE NOT NULL,
    address TEXT
    
);


