# __init__ file contains the application factory and tells
# Python that bikeracks should be treated as a package
import os
import csv
from time import time

from flask import (
    Flask, render_template, request, session, jsonify, Response
)

import logging
from logging.handlers import RotatingFileHandler
from . import db
from .blueprints import bikes
from .blueprints import votes
from bikeracks.db import get_db

# Instead of creating a Flask instance globally, the app
# will be created inside of a function which is known as the 
# application factory. Any configuration, registration, and other
# setup the application needs will happen inside the function, then
# the application will be returned

    
def create_app(test_config=None):
    # create and configure the app
    # instance_relative_config tells the app that configuration files
    # are relative to the instance folder (located outside bikeracks and
    # can hold local data that shouldn't be committed to version control)
    app = Flask(__name__, instance_relative_config=True)
    # DATABASE is the path where the SQLite db file will be saved
    # it's in the instance dir
    app.config.from_mapping(
        DATABASE=os.path.join(app.instance_path, 'bikeracks.sqlite'),
    )
    # overrides the default configuration with values taken from
    # config.py
    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    # test_config can also be passed to the factory, and will be used
    # instead of the instance configuration. This is so the tests
    # you write later can be configured independently of any
    # development values you have configured
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
        
    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Create error logging file
    log_dir_path = os.path.join(app.instance_path, 'logs')
    error_log_file = os.path.join(app.instance_path, 'logs/errors.log')
    if not app.debug:
        if not os.path.exists(log_dir_path):
            os.mkdir(log_dir_path)
        file_handler = RotatingFileHandler(error_log_file, maxBytes=524288,
            backupCount=5)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        # write a line to log each time server starts
        app.logger.setLevel(logging.INFO)
        app.logger.info('Bikeracks startup')
    # register close_db and init_db_command with the app
    db.init_app(app)
    
    # import and register the blueprint from the factory
    app.register_blueprint(bikes.bikes)
    app.register_blueprint(votes.votes)
        
    @app.route('/')
    def home(name=None):
        # update map with approved markers
        return render_template('base.html', name=name)
        
    @app.route('/submitFeedback', methods=('POST',))
    def submitFeedback():
        csv_file = os.path.join(app.instance_path, "feedback.csv")
        timestamp = int(time())
        feedback = request.form.get('feedback', type=str)
        if len(feedback) > 280:
            return ('Exceeded 280 character limit', 413)
        row = [timestamp, feedback]
        try:
            with open(csv_file, 'a', encoding='utf-8') as f:
                # creating a csv writer object 
                csvwriter = csv.writer(f) 
                # writing the data rows 
                csvwriter.writerow(row)
        except Exception as e:
            raise e
        return ('OK', 200)

    # Function for processing "suggest removal" request
    @app.route('/submitRemovalSuggestion', methods=('POST',))
    def submitSuggestion():
        rack_id = request.form.get("rack_id", type=float)
        reason_id = request.form.get("reason_id", type=int)
        user_id = request.form.get("user_id", type=str)

        # connect to database
        db = get_db()

        try:
            query = """
                INSERT INTO 
                    suggested_removals
                        (rack_id, user_id, reason_id, time_stamp)
                    VALUES 
                        (?, ?, ?, datetime('now'))"""
            db.execute(query, (rack_id, user_id, reason_id))
            db.commit()
        except Exception as e:
            raise e
        return ('OK', 200)
        
            
        
    @app.route('/favicon.ico')
    def favicon():
        return ('', 204)
    
    #@app.route('/tests')
    #def test_page(name=None):
    #    return render_template('tests.html', name=name)
        
    return app
