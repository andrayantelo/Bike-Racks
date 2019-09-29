# Python comes with built-in support for sqlite in sqlite3 module
# sqlite does not require setting up a separate database server
import sqlite3

import click
from flask import current_app, g
from flask.cli import with_appcontext

# the first thing to do when working with a sqlite database is to
# create a connection to it. Any queries and operations are performed
# using the connection, which is closed after the work is finished.

def get_db():
    # g is a special object that is unique for each request. it is a
    # global namespace for holding any data you want during a single
    # app context
    # if we have not defined db yet 
    if 'db' not in g:
        # current_app points to the flask app handling the request
        # get_db will be called when the application has been created
        # and is handling a request
        
        # sqlite3.connect creates a connection object that represents
        # the database
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            # PARSE_DECLTYPES constant, setting it makes the sqlite3
            # module parse the declared type for each column it
            # returns. It will parse out the first word of the
            # declared type. eg. for "integer primary key" it will parse 
            # out "integer"
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        # Row supports mapping access by column name and index, iteration
        # representation, equality testing, and len()
        g.db.row_factory = sqlite3.Row
        
    return g.db

# checks if a connection was created by checking if g.db was set
# if the connection exists, it is closed.
def close_db(e=None):
    db = g.pop('db', None)
    
    if db is not None:
        db.close();
        
# following functions will run SQL commands
    
# open_resouce() opens a file relative to the bikeracks package, which is
# useful since you won't necessarily know where that location is when
# deploying the application later. get_db returns a database connection,
# which is used to execute the commands read from the file.

def init_db():
    db = get_db()

    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))

# Click is a python package for creating command line interfaces
# Installing Flask installs the flask script, which is a click CLI, in
# your virtualenv

#click.command() defines a command line command called init-db that calls
# the init_db function and shows a success message to the user.

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')
    
# Register close_db and init_db_command with the application instance
# otherwise they won't be used by the application

def init_app(app):
    # tells flask to call close_db when cleaning up after returning
    # the response
    app.teardown_appcontext(close_db)
    # adds a new command that can be called with the flask command
    app.cli.add_command(init_db_command)
