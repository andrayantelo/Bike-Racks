# A view
# Blueprints are a way to organize your project
# Example blueprints:
#    users blueprint (responsible for logging in/out, password
#        resets, email confirmations)
#    bikes (responsible for adding/deleting
#        bike racks)
#    votes (responsible for adding/deleting votes

# Rather than registering views and other code directly with an app
# they are registered with a blueprint. Then the bp is registered with
# the app when it is available in the factory function.

from flask import (
    Blueprint, request
)
from . import helpers as h
from flaskr.db import get_db

votes = Blueprint('votes', __name__)

# maybe put the below in the bikes.py file becaus we are accessing bikeracks db
# and not votes

@votes.route('/get_rack', methods=['GET'])
def get_rack():
    if request.method == 'GET':
        lat = request.args.get('latitude', 0, type=float) or None
        lng = request.args.get('longitude', 0, type=float) or None
        
        # database connection
        db = get_db()
        coordinates = (lat, lng)
        
        rack = h.get_rack('bikeracks', db, coordinates)
        
        return rack
