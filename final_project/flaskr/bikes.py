# A view
# Blueprints are a way to organize your project
# Example blueprints:
#    users blueprint (responsible for logging in/out, password
#        resets, email confirmations)
#    bikes (todo change name?) (responsible for adding/deleting
#        bike racks, displaying bike racks?

# Rather than registering views and other code directly with an app
# they are registered with a blueprint. Then the bp is registered with
# the app when it is available in the factory function.

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for,
    jsonify
)

from . import helpers as h

from flaskr.db import get_db
# __name__ is passed as 2nd arg so that bp knows where it is defined
# __name__ evaluates to to the name of the current module
bp = Blueprint('bikes', __name__)

# View functions can be can be mapped to one or more routes
# might want to add the '/' route here TODO

@bp.route('/coordinates', methods=('GET', 'POST'))
def coordinates():
    if request.method == 'POST':
    # connect to database to be able to store new coordinates for temporary bikerack
        db = get_db()
        
        lat = request.form.get('lat', 0, type=float)
        lng = request.form.get('lng', 0, type=float)
        print("lat: {}".format(lat))
        print("long: {}".format(lng))
        
        # First check if these coordinates are valid
        if h.validate_coordinates((lat, lng)):
            # if valid, save in database
            print("saving into database")
            db.execute('INSERT INTO bikeracks (latitude, longitude) VALUES (?, ?);', (lat, lng))
            db.commit()
        
    # return data for the added temporary marker
        bike_rack = h.collect_bike_rack("bikeracks", db, lat, lng)
    #pending_racks = h.collect_pending("bikeracks", db)
        return bike_rack
    # if it is not a post method then just show the map
    return render_template('base.html')

def get_pending():
    # get data from database for pending bikeracks
    pass
    

