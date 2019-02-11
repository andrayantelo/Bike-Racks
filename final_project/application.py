from flask import Flask, render_template, request
import sqlite3

# Configure application
app = Flask(__name__)

@app.route('/')
def home_page():
    return 'Home page'

@app.route('/hello')
def hello_world():
    return 'Hello, world'

