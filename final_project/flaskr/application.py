import os
from flask import Flask, render_template, request

# This file will contain the application factory, and tells Python
# that the flaskr directory should be treated as a package

# Configure application
def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # set some default configuration that the app will use
    # override SECRET_KEY to random value when deploying
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlit'),
        )
    
    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
        
    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
        
    #

    @app.route('/')
    def home_page(name=None):
        return render_template('base.html', name=name)
    
    @app.route('/tests')
    def test_page(name=None):
        return render_template('tests.html', name=name)
        
    from . import db
    db.init_app(app)
    
    # Import and register marker blueprint
    from . import marker
    app.register_blueprint(marker.bp)
    
        
    return app

