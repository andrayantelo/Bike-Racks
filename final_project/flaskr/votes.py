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
    Blueprint, request, jsonify, render_template
)
from . import helpers as h
from flaskr.db import get_db
import sqlite3

votes = Blueprint('votes', __name__)

# maybe put the below in the bikes.py file becaus we are accessing bikeracks db
# and not votes

def get_vote_data(rack_id, user_id):
    # return db row for row with rack_id=rack_id and user_id=user_id
    db = get_db()
    query = "SELECT * from votes WHERE rack_id = ? AND user_id = ?"
    result = db.execute(query, (rack_id, user_id)).fetchall()
    
    result = [h.dict_from_row(row) for row in result]
    return result
    
@votes.route('/get_vote_status', methods=['GET'])
def get_vote_status():
    # return true if user with user_id = user_id has voted for 
    # rack with rack_id=rack_id, false otherwise
    if request.method == 'GET':
        rack_id = request.args.get('rack_id') or None
        user_id = request.args.get('user_id') or None
        
        # make connection the database
        db = get_db()
        
        query = "SELECT vote_type FROM votes WHERE rack_id = ? AND user_id = ?"
        
        result = db.execute(query, (rack_id, user_id)).fetchall()
        if result:
            return 'true'
        else:
            return 'false'
            
@votes.route('/submit_vote', methods=['POST'])
def submit_vote():
    # insert a vote into the vote db for rack with rack_id = rack_id, vote by
    # user with user_id = user_id and vote_type=vote_type
    
    if request.method == 'POST':
        try:
            rack_id = request.args.get('rack_id') or None
            user_id = request.args.get('user_id') or None
            vote_type = request.args.get('vote_type') or None
            
            # connect to db
            db = get_db()
            
            query = "INSERT INTO votes (rack_id, user_id, vote_type) VALUES (?, ?, ?)"
            db.execute(query, (rack_id, user_id, vote_type))
            db.commit()
            resp = get_vote_data(rack_id, user_id)
            return jsonify(resp)
        except sqlite3.Error as e:
            print("Database error:", e)
            return "", 500
        except KeyError as key_e:
            print("Error with key: {}".format(key_e))
    # TODO do I actually need below line
    # maybe return 500 here
    return "", 500

