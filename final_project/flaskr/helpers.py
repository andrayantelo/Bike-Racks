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
    
# function that checks if coordinates already exist in the database
def check_database(coordinates, database, table_name):
    # pass in a tuple of the coordinates (lat, lng)
    # and a database connection object
    # and the name of the database table you are querying
    lat, lng = coordinates
    # make a cursor object
    cur = database.cursor()
    
    # construct query
    query = "SELECT latitude, longitude FROM {} WHERE latitude = {} AND longitude = {} ".format(table_name, lat, lng)
    
    database.execute(query)
    result = cur.fetchone()
    
    if result:
        print("record exists")
    else:
        print("record does not exist")
    
