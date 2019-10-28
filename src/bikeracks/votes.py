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
    
    with open('/tmp/bikerack.log', 'a') as f:
        f.write('hello world')

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
    try:
        rack_id = request.args.get('rack_id', type=int)
        user_id = request.args.get('user_id', type=str)
        new_vote = request.args.get('vote_type', type=int)
        
        if not rack_id:
            return "No rack_id specified", 400
        
        # connect to db
        db = get_db()
        
        # check if user has voted on this rack before
        row = h.get_vote_status(db, rack_id, user_id)
        old_vote = row[0] if row else 0
        # vote_status is an object, {vote_type: -1} for example or None
        if new_vote == 0:
            query = """
                       DELETE FROM
                                  votes
                              WHERE
                                  rack_id = ? AND user_id = ?
                    """
            db.execute(query, (rack_id, user_id))
        else:
            query = """ INSERT INTO votes (rack_id, user_id, vote_type)
                    VALUES (?, ?, ?)
                    ON CONFLICT(rack_id, user_id) DO UPDATE SET vote_type=?"""
            db.execute(query, (rack_id, user_id, new_vote, new_vote))
        db.commit()
        
        if new_vote  > old_vote:
        # This is a new upvote (1, 0) or change from down to up (1, -1) or change from down to no vote (0, -1)
            delta_up = new_vote
            delta_down = old_vote
        if new_vote < old_vote:
        # This is a new downvote (0, 1) or change from up to down (-1, 1) or change from up to no vote (-1, 0)
            delta_up = -old_vote
            delta_down = -new_vote
        
        h.update_vote_count(db, rack_id, delta_up, delta_down)
        
        resp = get_vote_data(rack_id, user_id)
        return jsonify(resp)
    except Exception as e:
        with open('/tmp/bikerack.log', 'a') as f:
            f.write(str(e))
        return 200, str(e)
    
