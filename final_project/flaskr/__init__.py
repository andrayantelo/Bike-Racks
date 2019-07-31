# __init__ file contains the application factory and tells
# Python that flaskr should be treated as a package
import os
from flask import Flask, render_template

# Instead of creating a Flask instance globally, the app
# will be created inside of a function which is known as the 
# application factory. Any configuration, registration, and other
# setup the application needs will happen inside the function, then
# the application will be returned

def create_app(test_config=None):
    # create and configure the app
    # instance_relative_config tells the app that configuration files
    # are relative to the instance folder (located outside flaskr and
    # can hold local data that shouldn't be committed to version control)
    app = Flask(__name__, instance_relative_config=True)
    # DATABASE is the path where the SQLite db file will be saved
    # it's in the instance dir
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
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
        
    # register close_db and init_db_command with the app
    from . import db
    db.init_app(app)
    
    # import and register the blueprint from the factory
    from . import bikes
    app.register_blueprint(bikes.bikes)
        
    @app.route('/')
    def home_page(name=None):
        # update map with approved markers
        # render_template invokes the jinja template engine
        return render_template('base.html', name=name)
    
    #@app.route('/tests')
    #def test_page(name=None):
    #    return render_template('tests.html', name=name)
        
    return app



    

    
        

