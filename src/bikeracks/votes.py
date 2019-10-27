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
from bikeracks.db import get_db
import sqlite3

votes = Blueprint('votes', __name__)

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

    rack_id = request.args.get('rack_id', type=int)
    user_id = request.args.get('user_id', type=str)
    
    if not rack_id:
        return "No rack_id specified", 400
    
    # make connection the database
    db = get_db()
    
    query = "SELECT vote_type FROM votes WHERE rack_id = ? AND user_id = ?"
    
    result = db.execute(query, (rack_id, user_id)).fetchone()
    
    if result:
        result = h.dict_from_row(result)
        
    return jsonify(result)
 
    
            
@votes.route('/submit_vote', methods=['POST'])
def submit_vote():
    # insert a vote into the vote db for rack with rack_id = rack_id, vote by
    # user with user_id = user_id and vote_type=vote_type

    rack_id = request.args.get('rack_id', type=int)
    user_id = request.args.get('user_id', type=str)
    vote_type = request.args.get('vote_type', type=int)
    
    if not rack_id:
        return "No rack_id specified", 400
    
    # connect to db
    db = get_db()
    
    # check if user has voted on this rack before
    vote_status = h.get_vote_status(db, rack_id, user_id)
    vote_status =  h.dict_from_row(vote_status) if vote_status else None
    # vote_status is an object, {vote_type: -1} for example or None
    query = """ INSERT INTO votes (rack_id, user_id, vote_type)
                VALUES (?, ?, ?)
                ON CONFLICT(rack_id, user_id) DO UPDATE SET vote_type=?"""
    db.execute(query, (rack_id, user_id, vote_type, vote_type))
    db.commit()
    
    # if the vote is an upvote and the user has voted before
    # then delta_up is 1 and delta_down is -1
    # update_vote_count(database, rack_id, up_delta, down_delta)
    if vote_type == 1 and vote_status:
        h.update_vote_count(db, rack_id, 1, -1)
    elif vote_type == -1 and vote_status:
        h.update_vote_count(db, rack_id, -1, 1)
    elif vote_type == 1:
        h.update_vote_count(db, rack_id, 1, 0)
    elif vote_type == -1:
        h.update_vote_count(db, rack_id, 0, 1)
    elif vote_type == 1 and vote_status.vote_type == 1:
        # unvote the previous upvote
        h.update_vote_count(db, rack_id, -1, 0)
    elif vote_type == -1 and vote_status.vote_type == -1:
        # unvote the previous downvote
        h.update_vote_count(db, rack_id, 0, -1)
    
    resp = get_vote_data(rack_id, user_id)
    return jsonify(resp)
