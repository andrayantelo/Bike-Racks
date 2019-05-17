# Map blueprint?
# A Blueprint is a way to organize a group of related views and
# other code. Rather than registering views and other code directly
# with an application, they are registered with a blueprint. Then the
# blueprint is registered with the application when it is available in
# the factory function. 

# This blueprint is for adding markers to the map
# The code for each blueprint goes in a separate module

from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

#from flaskr.auth import login_required
from flaskr.db import get_db

bp = Blueprint('map', __name__)
# Creates a Blueprint named 'map' defined inside of __name__
