/* The sqlite database schema */
/* Why is 'status' blue 
There are actually 3 states a bikerack can be in: "approved", "pending", and
"rejected".
for each vote also include it's time/date that it was voted
separate table for votes, foreign key on bike rack id
and this separate table has the data for voting: time/date, type of vote ("upvote" or "downvote"), index
on the bikerack id (or time/date)
The relationship between bikeracks and votes is one to many, one bikerack
to many votes
The bikeracks table is the parent table, and is the table that the
foreign key constraint refers to.
The votes table is the child table, which is the table that a foreign key
consraint is applied.
The rack_id in bikeracks is the parent key, the rack_id column in
votes is called the child key.
In sqlite the datatype of a value is associated with the value itself,
not with its container */

DROP TABLE IF EXISTS bikeracks;

CREATE TABLE bikeracks (
    rack_id INTEGER PRIMARY KEY AUTOINCREMENT;
    status TEXT DEFAULT "pending",
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    CONSTRAINT coordinates UNIQUE(latitude, longitude),
    CHECK (status in ("approved", "pending", "rejected"))
    
);

DROP TABLE IF EXISTS votes;

CREATE TABLE votes (
    vote_date INTEGER,
    vote_type TEXT,
    rack_id INTEGER NOT NULL,
        FOREIGN KEY (rack_id) REFERENCES bikeracks(rack_id)
    CHECK (vote_type in ("upvote", "downvote"))
);


