#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""<+Socket test app.+>"""

from __future__ import division, print_function

# import sys
# import os
# import itertools as it

from flask import Flask
from flask import render_template
from flask.ext.socketio import SocketIO
from flask.ext.socketio import emit


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('event', namespace='/test')
def test_message(message):
    emit('my response', {'data': message['data']})


@socketio.on('broadcast event', namespace='/test')
def test_broadcast(message):
    emit('my response', {'data': message['data']}, broadcast=True)


@socketio.on('connect', namespace='/test')
def test_connect():
    emit('my response', {'data': 'Connected'})


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')
