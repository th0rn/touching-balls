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
from flask.ext.socketio import disconnect
import time
from threading import Thread

from demo import Demo

# TODO: Move to settings
HOST = 'localhost'

app = Flask(__name__)
# TODO: Get from settings
app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
thread = None


def background_thread():
    """Demo ball."""
    ball = Demo()
    while True:
        time.sleep(1)
        ball.move()
        data = 'Player "%s" (%s) moved to %s.' % (ball.nick, ball.color,
                                                  ball.short_coords())
        socketio.emit('response',
                      {
                          # 'data': data,
                          'nick': ball.nick,
                          'x': ball.x,
                          'y': ball.y,
                          # 'count': count,
                      },
                      namespace='/test')


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('event', namespace='/test')
def test_message(message):
    emit('response', {'data': message['data']})


@socketio.on('broadcast event', namespace='/test')
def test_broadcast(message):
    emit('response', {'data': message['data']}, broadcast=True)


@socketio.on('connect', namespace='/test')
def test_connect():
    emit('response', {'data': 'Connected'})
    global thread
    if thread is None:
        thread = Thread(target=background_thread)
        thread.start()


@socketio.on('disconnect request', namespace='/test')
def disconnect_request():
    emit('my response',
         {'data': 'Disconnected!', })
    disconnect()


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, host=HOST)
