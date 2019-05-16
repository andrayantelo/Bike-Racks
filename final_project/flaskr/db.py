import sqlite3

import click
from flask import current_app, g
from flask.cli import with_appcontext

# g is a special object that is unique for each request.
# It is used to store data that might be accessed by multiple functions
# during the request. The connection is stored and reused instead of
# creating a new connection if get_db is called a second time in the
# same request.

# current_app is another special object that points to the Flask application
# handling the request. Since an application factory was used, there is
# no application object when writing the rest of the code. get_db
# will be called when the application has been created and is handling
# a request, so current_app can be used.

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        
    return g.db
    
def close_db(e=None):
    db = g.pop('db', None)
    
    if db is not None:
        db.close();
