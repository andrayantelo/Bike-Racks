from flask import jsonify

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
    
    query = "SELECT * FROM {} WHERE status = 'pending'".format(table_name)
    result = database.execute(query).fetchall()
    pending_racks = [tuple(row) for row in result]
    
    return jsonify(pending_racks)
    
# function that returns row for a bikerack with particular coordinates
def collect_bike_rack(table_name, database, lat, lng):
    # returns an object containing the db row obj for the bikerack (should
    # I do tuple(row) instead? and  
    query = "SELECT * FROM {} WHERE latitude = ? AND longitude = ?".format(table_name)
    
    result = database.execute(query, (lat, lng)).fetchone()
    
    
    result_obj = (list(result), {"latitude": result['latitude'], 
                  "longitude": result['longitude'], "address": result['address'],
                  "id": result['id'], "status": result['status']})

    
    return jsonify(result_obj)
    
# function that updates the racks to be shown on the map
def update():
    pass
