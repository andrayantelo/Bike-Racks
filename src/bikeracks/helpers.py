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
    
    query = []
    args = []
    # Limit to a single user_id if we have it
    if user_id:
        query.append(""" SELECT r.*, v.vote_type
                         FROM bikeracks as r
                         LEFT JOIN votes as v
                         ON (r.rack_id = v.rack_id and v.user_id = ?)""")
        args.append(user_id)
    else:
        query.append("SELECT * FROM bikeracks as r")
        
    # Limit to some status if we know it
    if status:
        op = ">" if status == "approved" else "<"
        query.append("WHERE r.upvote_count {} r.downvote_count".format(op))
        
    result = database.execute(' '.join(query), tuple(args)).fetchall()
    result = [dict_from_row(row) for row in result]

    return jsonify(result)


def get_single_rack(database, rack_id):
    # get data from the database for a single bikerack with rack_id=rack_id
    # get single rack from db based on rack_id
    
    query = "SELECT * FROM bikeracks WHERE rack_id = ?"
    result = database.execute(query, (rack_id,)).fetchall()
    result = [dict_from_row(row) for row in result]
    return jsonify(result)
  
# get vote status for server side functions
def get_vote_status(database, rack_id, user_id):
        
    query = "SELECT vote_type FROM votes WHERE rack_id = ? AND user_id = ?"
        
    result = database.execute(query, (rack_id, user_id)).fetchone()
    return result
    
def update_vote_count(database, rack_id, up_delta, down_delta):
    query = """ UPDATE
                    bikeracks
                SET
                    upvote_count=
                    (
                        SELECT
                            MAX(upvote_count + ?, 0)
                        FROM
                            bikeracks
                        WHERE
                            rack_id=?
                    ),
                    downvote_count=
                    (
                        SELECT
                            MAX(downvote_count + ?, 0)
                        FROM
                            bikeracks
                        WHERE rack_id=?
                    )
                WHERE
                    rack_id=?"""
    database.execute(query, (up_delta, rack_id, down_delta, rack_id, rack_id))
    database.commit()
    return
    
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



    
    
