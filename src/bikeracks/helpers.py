from flask import jsonify
import sqlite3
from math import floor

# Helper functions
class Error(Exception):
    """Base class for exceptions in this module."""
    pass

class RangeError(Error):
    """Exception raised for value being out of a particular range.
    
    Attributes:
        expression -- input expression in which the error occured
        message -- explanation of the error
    """
    
    def __init__(self, value, message):
        self.value = value
        self.message = message
        
    def __str__(self):
        return(repr(self.value))

# makes a dictionary out of a row object
def dict_from_row(row):
    return dict(zip(row.keys(), row))     

# function that validates coordinate data
def validate_coordinates(coordinates):
    # verify that lat and lng are floats
    lat, lng = coordinates
    # verify that they fall within their ranges
    if lat < -90 and lat > 90:
        #print("{} not in range.".format(lat))
        raise RangeError(lat, "lat not in range")
    if lng < -180 and lng > 180:
        #print("{} not in range.".format(lng))
        raise RangeError(lng, "long not in range")

    # return true if all tests passed
    return True


def get_rack_state(database, lat, lng):
    # Returns row for a bikerack with particular coordinates
    # returns a dictionary containing the data on a bikerack, searches
    # database based on coordinates
     
    query = "SELECT * FROM bikeracks WHERE latitude = ? AND longitude = ?"
    
    result = database.execute(query, (lat, lng)).fetchone()
    result = dict_from_row(result)

    return jsonify(result)
    
def get_racks(database, status, user_id):
    # get data from database for approved bikeracks, searches database
    # based on status of rack ('not_approved', 'approved')
    # return a response object with the application/json mimetype, the content
    # is an array of dictionary objects that contain the states of each rack

    if not status and not user_id:
        # get all racks from bikeracks table
        query = "SELECT * FROM bikeracks"
        result = database.execute(query).fetchall()
    elif status and not user_id:
        # get all racks with given status from bikeracks table
        query = "SELECT * FROM bikeracks WHERE status =?"
        result = database.execute(query, (status,)).fetchall()
    elif not status and user_id:
        # return all joined rows from bikeracks and votes
        # get all the racks, including voting information for racks that user voted on
        query = """ SELECT 
                        r.*,
                        v.vote_type
                    FROM bikeracks as r
                    LEFT JOIN votes as v
                    ON (r.rack_id=v.rack_id AND v.user_id=?)
                """
        result = database.execute(query, (user_id,)).fetchall()
        
    elif status and user_id:
        # get all the racks with status=status, including voting information for racks that user voted on
        query = """ SELECT 
                        r.*,
                        v.vote_type
                    FROM bikeracks as r
                    LEFT JOIN votes as v
                    ON (r.rack_id=v.rack_id
                    AND v.user_id=?) 
                    WHERE r.status=?)
                """
        result = database.execute(query, (user_id, status,)).fetchall()
    
    
    result = [dict_from_row(row) for row in result]

    return jsonify(result)


def get_single_rack(database, rack_id):
    # get data from the database for a single bikerack with rack_id=rack_id
    # get single rack from db based on rack_id
    
    query = "SELECT * FROM bikeracks WHERE rack_id = ?"
    result = database.execute(query, (rack_id,)).fetchall()
    result = [dict_from_row(row) for row in result]
    return jsonify(result)

# below function is to easily add racks to db for testing TODO 
def insert_rack(database, rack):
    # insert into table table_name, the rack (dict)
    query = "INSERT INTO bikeracks (latitude, longitude, status, address) values (?, ?, ?, ?)"
    database.execute(query, (rack['latitude'], rack['longitude'], rack['status'],
        rack['address']))
    database.commit()
    
    return
  
# get vote status for server side functions
def get_vote_status(database, rack_id, user_id):
        
    query = "SELECT vote_type FROM votes WHERE rack_id = ? AND user_id = ?"
        
    result = database.execute(query, (rack_id, user_id)).fetchone()
    return result
    
# decrement from downvote or upvote_count
def decrement_upvote_count(rack_id, database):

    query = """
        UPDATE 
            bikeracks 
        SET
            upvote_count=
            (
                SELECT
                    MAX(upvote_count - 1, 0)
                FROM
                    bikeracks
                WHERE
                    rack_id=?
            ) 
        WHERE
            rack_id=?"""
    database.execute(query, (rack_id,rack_id,))
    database.commit()
    
    return
    
def decrement_downvote_count(rack_id, database):
    query = """
        UPDATE
            bikeracks
        SET
            downvote_count=
            (
                SELECT
                    MAX(downvote_count - 1, 0)
                FROM
                    bikeracks
                WHERE
                    rack_id=?
            )
        WHERE
            rack_id=?"""
    
    database.execute(query, (rack_id,rack_id,))
    database.commit()
    
    return
    
# increment downvote or upvote_count
def increment_upvote_count(rack_id, database):
    query = """
        UPDATE
            bikeracks
        SET
            upvote_count = upvote_count + 1
        WHERE
            rack_id=?"""
    database.execute(query, (rack_id,))
    database.commit()
    
    return
    
def increment_downvote_count(rack_id, database):

    query = """
        UPDATE
            bikeracks
        SET
            downvote_count = downvote_count + 1
        WHERE
            rack_id=?"""
    database.execute(query, (rack_id,))
    database.commit()

    return
    
def get_count_percentage(rack_id, database):
    # return the percentage of downvote_count for a rack

    query = "SELECT downvote_count, upvote_count FROM bikeracks WHERE rack_id=?"
    counts = database.execute(query, (rack_id,)).fetchone()
    counts = dict_from_row(counts)
    
    total = counts['upvote_count'] + counts['downvote_count']
    # Favor upvotes by floor-ing downvote instead
    downvote = floor(downvote_count / total) * 100
    upvote = 100 - downvote

    return {'downvote_percentage': downvote, 'upvote_percentage': upvote}



    
    
