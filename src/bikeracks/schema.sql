/* The sqlite database schema */
/* Why is 'status' blue 
There are actually 2 states a bikerack can be in: "approved" or "not_approved"
which will be calculated by using downvote_count and upvote_count
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
DROP TABLE IF EXISTS suggested_removals;
DROP TABLE IF EXISTS bikeracks_history;
DROP TABLE IF EXISTS votes_history;

CREATE TABLE bikeracks (
    rack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    upvote_count INTEGER NOT NULL DEFAULT 0,
    downvote_count INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT coordinates UNIQUE(latitude, longitude)
    
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
    user_id TEXT,
    vote_type INTEGER,
    rack_id INTEGER NOT NULL,
    FOREIGN KEY (rack_id) REFERENCES bikeracks(rack_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
    CHECK (vote_type in (-1, 1))
);

/* want to be able to look up vote by a user for a particular rack*/
CREATE UNIQUE INDEX rack_vote ON votes (user_id, rack_id);






/*
Table that holds the bike racks that people have suggested for removal
id, bike rack id, removal reason, user id, timestamp (in Unix Time)
LEGEND for REMOVAL REASON:
    A value of 1 means Duplicate
    A value of 2 means Doesn't Exist (as in the bike rack doesn't)
*/

CREATE TABLE suggested_removals (
    removal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    rack_id INTEGER NOT NULL,
    user_id TEXT,
    time_stamp INTEGER,
    reason INTEGER
)







/* history tables, identical to regular table except without upvote_count and downvote_count,
When a bikerack is added to bikeracks it also gets added to bikeracks_history
that way we can link old votes back to their bikerack */

CREATE TABLE bikeracks_history (
    rack_id INTEGER PRIMARY KEY,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    CONSTRAINT coordinates UNIQUE(latitude, longitude)
);

/* 
votes_history table identical to votes table except it also has a timestamp of
when the vote was made
vote_timestamp is type INTEGER as unix time, number of seconds since 1970-01-01 00:00:00 UTC
 */

CREATE TABLE votes_history (
    vote_id INTEGER PRIMARY KEY,
    vote_timestamp INTEGER,
    user_id INTEGER,
    vote_type INTEGER,
    rack_id INTEGER NOT NULL,
    FOREIGN KEY (rack_id) REFERENCES bikeracks_history(rack_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
    CHECK (vote_type in (1, -1))
);

/*want to be able to look up votes from a certain period in time */
CREATE UNIQUE INDEX old_votes ON votes_history (vote_timestamp);



