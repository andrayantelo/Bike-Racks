from flask import jsonify
import sqlite3

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
    try:
        # verify they are floats
        float(lat)
        float(lng)
        # verify that they fall within their ranges
        if lat < -90 and lat > 90:
            #print("{} not in range.".format(lat))
            raise RangeError(lat, "lat not in range")
        if lng < -180 and lng > 180:
            #print("{} not in range.".format(lng))
            raise RangeError(lng, "long not in range")
        
    except ValueError:
        return False
    except RangeError as e:
        print(e.message)
        
    # return true if all tests passed
    return True
    
# function that collects the data of not_approved bikeracks from the database
def collect_pending(table_name, database, lat, lng):
    # Return 50 not_approved bike rack results to be displayed on the map
    # table_name: string
    # database: db connection object
    # TODO, actually make it so that 50 are collected
    
    query = "SELECT * FROM {} WHERE status = 'not_approved'".format(table_name)
    result = database.execute(query).fetchall()
    pending_racks = [tuple(row) for row in result]
    
    return jsonify(pending_racks)


def get_rack_state(table_name, database, lat, lng):
    # Returns row for a bikerack with particular coordinates
    # returns a dictionary containing the data on a bikerack, searches
    # database based on coordinates
     
    query = "SELECT * FROM {} WHERE latitude = ? AND longitude = ?".format(table_name)
    
    result = database.execute(query, (lat, lng)).fetchone()
    result = dict_from_row(result)

    return jsonify(result)
    
def get_racks(table_name, database, status, user_id):
    # get data from database for approved bikeracks, searches database
    # based on status of rack ('not_approved', 'approved')
    # return a response object with the application/json mimetype, the content
    # is an array of dictionary objects that contain the states of each rack
    
    if status == None and user_id == None:
        print("returning ALL racks")
        # return all rows from bikeracks table
        query = "SELECT * FROM {}".format(table_name)
        result = database.execute(query).fetchall()
    elif status and user_id == None:
        # select all rows with given status from bikeracks table
        print("returning racks with particular status")
        query = "SELECT * FROM {} WHERE status =?".format(table_name)
        result = database.execute(query, (status,)).fetchall()
    elif status == None and user_id:
        # return all joined rows from bikeracks and votes
        print("returning all racks for online user")
        # get all the racks the user voted on
        query = "SELECT * FROM bikeracks INNER JOIN votes ON bikeracks.rack_id=votes.rack_id WHERE votes.user_id=?"
        result = database.execute(query, (user_id,)).fetchall()
        
        # get all the racks the user did NOT vote on
        query2 = """SELECT 
                       bikeracks.address,
                       bikeracks.downvote_count,
                       bikeracks.latitude,
                       bikeracks.longitude,
                       bikeracks.rack_id,
                       bikeracks.status,
                       bikeracks.upvote_count,
                       votes.vote_type,
                       votes.user_id
                    FROM bikeracks LEFT JOIN votes ON bikeracks.rack_id=votes.rack_id WHERE votes.user_id is NULL OR votes.user_id!=?"""
        result2 = database.execute(query2, (user_id,)).fetchall()
        
        result += result2
    elif status and user_id:
        print("returning all racks with particular status for online user")
        # TODO probably need two queries here
        # return all rows from joined tables with this status
        query = """SELECT 
                       bikeracks.address,
                       bikeracks.downvote_count,
                       bikeracks.latitude,
                       bikeracks.longitude,
                       bikeracks.rack_id,
                       bikeracks.status,
                       bikeracks.upvote_count,
                       votes.vote_type,
                       votes.user_id
                   FROM bikeracks LEFT JOIN votes on bikeracks.rack_id=votes.rack_id WHERE votes.user_id=? AND bikeracks.status=?"""
        result = database.execute(query, (user_id, status,)).fetchall()
    else:
        return "", 500
    
    result = [dict_from_row(row) for row in result]
    result2 = [dict_from_row(row) for row in result2]
    final_result = [result, result2]
    print(result)
    return jsonify(result)


def get_single_rack(table_name, database, rack_id):
    # get data from the database for a single bikerack with rack_id=rack_id
    # get single rack from db based on rack_id
    
    query = "SELECT * FROM {} WHERE rack_id = ?".format(table_name)
    result = database.execute(query, (rack_id,)).fetchall()
    result = [dict_from_row(row) for row in result]
    print(result)
    return jsonify(result)

# below function is to easily add racks to db for testing TODO 
def insert_rack(table_name, database, rack):
    # insert into table table_name, the rack (dict)
    try:
        query = "INSERT INTO {} (latitude, longitude, status, address) values (?, ?, ?, ?)".format(table_name)
        database.execute(query, (rack['latitude'], rack['longitude'], rack['status'], rack['address']))
        database.commit()
    except sqlite3.Error as e:
        print("Database error:", e)
    except KeyError as key_e:
        print("Error with key: {}".format(key_e))
    
    return
  
# get vote status for server side functions
def get_vote_status(database, rack_id, user_id):
        
    query = "SELECT vote_type FROM votes WHERE rack_id = ? AND user_id = ?"
        
    result = database.execute(query, (rack_id, user_id)).fetchone()
    return result
