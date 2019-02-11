from flask import Flask, render_template, request
import sqlite3

# Configure application
app = Flask(__name__)

@app.route('/')
def home_page(name=None):
    return render_template('index.html', name=name)
    

