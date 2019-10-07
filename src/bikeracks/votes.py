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

    rack_id = request.args.get('rack_id') or None
    user_id = request.args.get('user_id') or None
    
    # make connection the database
    db = get_db()
    
    query = "SELECT vote_type FROM votes WHERE rack_id = ? AND user_id = ?"
    
    result = db.execute(query, (rack_id, user_id)).fetchone()
    
    if result:
        result = h.dict_from_row(result)
        return jsonify(result)
    else:
        return jsonify(None)
            
@votes.route('/submit_vote', methods=['POST'])
def submit_vote():
    # insert a vote into the vote db for rack with rack_id = rack_id, vote by
    # user with user_id = user_id and vote_type=vote_type
    try:
        rack_id = request.args.get('rack_id') or None
        user_id = request.args.get('user_id') or None
        vote_type = request.args.get('vote_type') or None
        vote_type = int(vote_type)
        
        # connect to db
        db = get_db()
        
        vote_status = h.get_vote_status(db, rack_id, user_id)
        if vote_status:
            # updating an existing vote
            
            query = "UPDATE votes SET vote_type = ? WHERE rack_id = ? AND user_id = ?"
            db.execute(query, (vote_type, rack_id, user_id))
            db.commit()
            # also update the vote count in bikeracks table
            if vote_type == 1:
                # update the downvote_count in bikeracks for this rack, decrement by 1
                h.decrement_downvote_count(rack_id, db)
                
            # if the user downvoted
            elif vote_type == -1:
                # update the upvote_count in bikeracks for this rack, decrement by 1
                h.decrement_upvote_count(rack_id, db)
            
        else:
            # voting for the first time
            
            query = "INSERT INTO votes (rack_id, user_id, vote_type) VALUES (?, ?, ?)"
            db.execute(query, (rack_id, user_id, vote_type))
            db.commit()
            
        # increment the upvote or downvote count
        if vote_type == 1:
            # update the upvote_count in bikeracks for this rack, increment by 1
            h.increment_upvote_count(rack_id, db)
        elif vote_type == -1:
            # update the downvote_count in bikeracks for this rack, increment by 1
            h.increment_downvote_count(rack_id, db)
        
        resp = get_vote_data(rack_id, user_id)
        return jsonify(resp)
    except sqlite3.Error as e:
        print("Database error:", e)
        return "", 500
    except KeyError as key_e:
        print("Error with key: {}".format(key_e))
        return "", 500
    # TODO do I actually need below line
   # maybe return 500 here
    return "", 500
    
@votes.route('/unvote', methods=['POST'])
def unvote():
    # remove a vote that the user had previously made
    try:
        rack_id = request.args.get('rack_id') or None
        user_id = request.args.get('user_id') or None
        vote_type = request.args.get('vote_type') or None
        
        # connect to db
        db = get_db()
        
        # remove user's vote for this rack from votes table and update bikeracks vote count
        
        #remove user's vote 
        query = """
                DELETE FROM
                    votes
                WHERE
                    user_id=? AND
                    vote_type=? AND
                    rack_id=?
                """
        db.execute(query, (user_id, vote_type, rack_id))
        
        # decrement the vote count in the bikeracks row for this rack
        if int(vote_type) == 1:
             count_column_name= "upvote_count"
        else:
            count_column_name = "downvote_count"
        
        query = """
                    UPDATE
                        bikeracks
                    SET
                        {}={} - 1
                    WHERE
                        rack_id=?
                """.format(count_column_name, count_column_name)
        
        db.execute(query, (rack_id,))
        
        db.commit()
        return "OK", 200
    except sqlite3.Error as e:
        print("Database error:", e)
        return "", 500
    except KeyError as key_e:
        print("Error with key: {}".format(key_e))
        return "", 500

