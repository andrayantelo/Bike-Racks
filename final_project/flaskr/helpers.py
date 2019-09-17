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
    
# function that collects the data of pending bikeracks from the database
def collect_pending(table_name, database, lat, lng):
    # Return 50 pending bike rack results to be displayed on the map
    # table_name: string
    # database: db connection object
    # TODO, actually make it so that 50 are collected
    
    query = "SELECT * FROM {} WHERE status = 'pending'".format(table_name)
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
    
def get_racks(table_name, database, status):
    # get data from database for approved bikeracks, searches database
    # based on status of rack ('pending', 'rejected', 'approved')
    # return a response object with the application/json mimetype, the content
    # is an array of dictionary objects that contain the states of each rack
    
    if status == None:
        # return all racks
        # TODO this won't return anything if the bikerack has no votes
        # I need to get voting information for the rack for the user currently logged in
        # BUT if user is not logged in, then I just need the columns from bikeracks
        query = "SELECT * FROM {} INNER JOIN votes ON bikeracks.rack_id=votes.rack_id".format(table_name)
        print(query)
        result = database.execute(query).fetchall()
    else:
        query = "SELECT * FROM {} INNER JOIN votes ON bikeracks.rack_id=votes.rack_id WHERE status =?".format(table_name)
        print(query)
        result = database.execute(query, (status,)).fetchall()
    
    result = [dict_from_row(row) for row in result]
    print(result)
    return jsonify(result)


def get_single_rack(table_name, database, rack_id):
    # get data from the database for a single bikerack with rack_id=rack_id
    # get single rack from db based on rack_id
    print("looking up rack with id: {}".format(rack_id))
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
