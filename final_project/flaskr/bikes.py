# A view
# Blueprints are a way to organize your project
# Example blueprints:
#    users blueprint (responsible for logging in/out, password
#        resets, email confirmations)
#    bikes (todo change name?) (responsible for adding/deleting
#        bike racks

# Rather than registering views and other code directly with an app
# they are registered with a blueprint. Then the bp is registered with
# the app when it is available in the factory function.

from flask import (
    Blueprint, render_template, request, session, jsonify, Response
)

from . import helpers as helper

from flaskr.db import get_db
# __name__ is passed as 2nd arg so that bp knows where it is defined
# __name__ evaluates to to the name of the current module
bikes = Blueprint('bikes', __name__)

# View functions can be can be mapped to one or more routes
# might want to add the '/' route here TODO
@bikes.route('/dynamic/<path:path>')
def render_file(path):
    # the view function for the route to scripts inside of dynamic directory
    response = render_template(path), 200, {'Content-Type': 'text/javascript'}
    
    return response


@bikes.route('/coordinates', methods=('GET', 'POST'))
def coordinates():
    if request.method == 'POST':
        
        # get the coordinates from the request
        lat = request.form.get('lat', 0, type=float)
        lng = request.form.get('lng', 0, type=float)
        address = request.form.get('address', '')
        
        # First check if these coordinates are valid
        if helper.validate_coordinates((lat, lng)):
            # if valid, save in database
            print("saving into database")
            try:
                # connect to database to be able to store new coordinates for temporary bikerack
                db = get_db()
                db.execute('INSERT INTO bikeracks (latitude, longitude, address) VALUES (?, ?, ?);', (lat, lng, address))
                db.commit()
                # return data for the added temporary marker
                bike_rack = helper.get_rack_state("bikeracks", db, lat, lng)
        
                return bike_rack
            except Exception as e:
                print(e)
                # TODO, narrow down exception
    # if it is not a post method then just show the map
    return render_template('base.html')

# get racks based on status ('pending', 'rejected', 'approved')
@bikes.route('/get_racks/', methods=['GET'])
def get_racks():
    if request.method == 'GET':
        status = request.args.get('status') or None

        # make a connection to the database
        db = get_db()
        
        racks = helper.get_racks("bikeracks", db, status)
        
        return racks

 
@bikes.route('/store_rack/', methods=['POST'])
def store_rack():
    # manually insert racks into db   
    if request.method == 'POST':
        args = request.json
        db = get_db()
        print("request json {}".format(args))
        
        helper.insert_rack('bikeracks', db, args)
        return Response(status=200)
    return render_template('base.html')

 
@bikes.route('/get_single_rack', methods=['GET'])
def get_single_rack():
    # get rack based on rack_id 
    if request.method == 'GET':
        rack_id = request.args.get('rack_id') or None
        print("get single rack with id: {}".format(rack_id))
        # database connection
        db = get_db()
        
        rack = helper.get_single_rack('bikeracks', db, rack_id)
        
        return rack
    
