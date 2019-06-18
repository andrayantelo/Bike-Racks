/* The sqlite database schema */
/* Why is 'status' blue 
There are actually 3 states a bikerack can be in: "approved", "pending", and
"rejected". */

DROP TABLE IF EXISTS bikeracks;

CREATE TABLE bikeracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT DEFAULT "pending",
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    CONSTRAINT coordinates UNIQUE(latitude, longitude),
    CHECK (status in ("approved", "pending", "rejected"))
    
);


