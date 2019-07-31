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

/* vote_date is type INTEGER as unix time, number of seconds since 1970-01-01 00:00:00 UTC */

CREATE TABLE votes (
    vote_date INTEGER,
    vote_type TEXT,
    rack_id INTEGER NOT NULL,
    FOREIGN KEY (rack_id) REFERENCES bikeracks(rack_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
    CHECK (vote_type in ("upvote", "downvote"))
);

/* archive tables, identical to regular table,
no coordinates restraint in case a bikerack gets added to bikeracks, is 
later determined to not be a bikerack at all, but a spot in the ocean, is deleted,
is moved to bikeracks_archive. then again that spot gets added to bikeracks by
someone, is deleted again, but it's already in archives so it doesn't get added
into archives and that's fine because it's already there, keep unique restraint on coordinates */

CREATE TABLE bikeracks_archive (
    rack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT DEFAULT "pending",
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    CONSTRAINT coordinates UNIQUE(latitude, longitude),
    CHECK (status in ("approved", "pending", "rejected"))
);

/* do not apply the rack_id as a foreign key in the votes_archive table because
if you delete old votes from a bike rack and they get archived, the actual
bike rack that these votes belong to may not be archived, it may still be in the
bikeracks table. So, we don't need a foreign key that refers to rack_id in bikeracks_archive

Potential problem: if a bike rack is deleted from the bikeracks table, say with a
rack_id of 3, and now exists in the bikeracks_archive table. Let's say another bikerack
gets added to the bikeracks table with a rack_id of 3, and why not because the previous
one isn't in that table anymore. we wouldn't be able to link the votes back to their original bikerack
if this happens. Actually, a bike rack would never be added with an id that was already
used because of AUTOINCREMENT
 */

CREATE TABLE votes_archive (
    vote_date INTEGER,
    vote_type TEXT,
    rack_id INTEGER NOT NULL
    CHECK (vote_type in ("upvote", "downvote"))
);

/* TODO Things to check:
- check that the foreign key on the regular tables bikeracks and votes works
- Maybe instead of having a foreign key on votes be the rack_id, have it be
the coordinates... Not needed. 
*/


