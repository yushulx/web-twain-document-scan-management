from flask import Flask, request, send_file
from flask_cors import CORS, cross_origin
import base64
import os
import time
import json
import sys

app = Flask(__name__, static_url_path='/', static_folder='./')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

if __name__ == '__main__':
   app.run(host = "0.0.0.0", port = 8888, ssl_context='adhoc') #, ssl_context='adhoc'