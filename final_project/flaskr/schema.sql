/* The sqlite database schema */
/* Why is 'status' blue 
There are actually 3 states a bikerack can be in: "approved", "pending", and
"rejected".
separate table for votes, has foreign key on bike rack id
and this separate table has the data for voting: type of vote (1 ("upvote") or -1 ("downvote")),
user_id, index on the bikerack id (or user_id)
The relationship between bikeracks and votes is one to many, one bikerack
to many votes
The bikeracks table is the parent table, and is the table that the
foreign key constraint refers to.
The votes table is the child table, which is the table that a foreign key
consraint is applied.
The rack_id in bikeracks is the parent key, the rack_id column in
votes is called the child key.*/

DROP TABLE IF EXISTS bikeracks;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS bikeracks_history;
DROP TABLE IF EXISTS votes_history;

CREATE TABLE bikeracks (
    rack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT DEFAULT "pending",
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    upvote_count INTEGER NOT NULL DEFAULT 0,
    downvote_count INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT coordinates UNIQUE(latitude, longitude),
    CHECK (status in ("approved", "pending", "rejected"))
    
);

/* 
so when a user upvotes a bikerack, first we check, have they already upvoted this
particular bikerack? and we check this by looking up all votes using their user_id
and checking if the rack_id is already there for this rack. Because the front end side
doesn't know anything about rack ids, we'd first need to look up this rack in the
database using its coordinates


a user can vote only once per bikerack.  */

CREATE TABLE votes (
    vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    vote_type INTEGER,
    rack_id INTEGER NOT NULL,
    FOREIGN KEY (rack_id) REFERENCES bikeracks(rack_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
    CHECK (vote_type in (-1, 1))
);

/* history tables, identical to regular table except without upvote_count and downvote_count,
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
votes_history table identical to votes table except it also has a timestamp of
when the vote was made
vote_timestamp is type INTEGER as unix time, number of seconds since 1970-01-01 00:00:00 UTC
 */

CREATE TABLE votes_history (
    vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    vote_timestamp INTEGER,
    user_id INTEGER,
    vote_type INTEGER,
    rack_id INTEGER NOT NULL,
    FOREIGN KEY (rack_id) REFERENCES bikeracks_history(rack_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
    CHECK (vote_type in (1, -1))
);

/* TODO Things to check:
- check that the foreign key on the regular tables bikeracks and votes works 
- add all bikeracks to the bikeracks_history 
- then you can have foreign key on it in votes_history

TODO this weekend:
- ask about users table, and foreign key idea
*/


