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

from flaskr.db import get_db
# __name__ is passed as 2nd arg so that bp knows where it is defined
# __name__ evaluates to to the name of the current module
bp = Blueprint('bikes', __name__)

# What am I actually trying to do here? I need to store new bike rack
# information in the database

@bp.route('/coordinates', methods=('GET', 'POST'))
def check_coordinates():
    if request.method == 'POST':
    # will probably need a connection to the database to check
    # if the given coordinates are already in there
        db = get_db()
        print("request method is post")
        
        
        lat = request.form.get('lat', 0, type=float)
        lng = request.form.get('lng', 0, type=float)
        print("lat: {}".format(lat))
        print("long: {}".format(lng))
        
        # let's try saving into database
        if lat != 0 and lng != 0:
            print("saving into database")
            db.execute('INSERT INTO bikeracks (latitude, longitude) VALUES (?, ?);', (lat, lng))
            db.commit()
        
        
    # will need some kind of update map function
        
    return "got {}".format(request.form)
