#!/bin/bash
cd ~/projects/cs50
source env/bin/activate
cd src
FLASK_ENV=development FLASK_APP=bikeracks flask run --host 0.0.0.0 --port 9000
