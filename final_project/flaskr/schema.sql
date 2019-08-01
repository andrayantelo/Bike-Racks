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
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS bikeracks_archive;
DROP TABLE IF EXISTS votes_archive;

CREATE TABLE bikeracks (
    rack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT DEFAULT "pending",
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    CONSTRAINT coordinates UNIQUE(latitude, longitude),
    CHECK (status in ("approved", "pending", "rejected"))
    
);

/* vote_timestamp is type INTEGER as unix time, number of seconds since 1970-01-01 00:00:00 UTC */

CREATE TABLE votes (
    vote_timestamp INTEGER,
    vote_type TEXT,
    rack_id INTEGER NOT NULL,
    FOREIGN KEY (rack_id) REFERENCES bikeracks(rack_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
    CHECK (vote_type in ("upvote", "downvote"))
);

/* history tables, identical to regular table,
When a bikerack is added to bikeracks it also gets added to bikeracks_history
that way we can link old votes back to their bikerack */

CREATE TABLE bikeracks_history (
    rack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT DEFAULT "pending",
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    CONSTRAINT coordinates UNIQUE(latitude, longitude),
    CHECK (status in ("approved", "pending", "rejected"))
);

/* 
Potential problem: if a bike rack is deleted from the bikeracks table, say with a
rack_id of 3, and now exists in the bikeracks_archive table. Let's say another bikerack
gets added to the bikeracks table with a rack_id of 3, and why not because the previous
one isn't in that table anymore. we wouldn't be able to link the votes back to their original bikerack
if this happens. Actually, a bike rack would never be added with an id that was already
used because of AUTOINCREMENT
 */

CREATE TABLE votes_history (
    vote_timestamp INTEGER,
    vote_type TEXT,
    rack_id INTEGER NOT NULL,
    FOREIGN KEY (rack_id) REFERENCES bikeracks_history(rack_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
    CHECK (vote_type in ("upvote", "downvote"))
);

/* TODO Things to check:
- check that the foreign key on the regular tables bikeracks and votes works
- Maybe instead of having a foreign key on votes be the rack_id, have it be
the coordinates... Not needed. 
- add all bikeracks to the bikeracks_history 
- then you can have foreign key on it in votes_history
*/


