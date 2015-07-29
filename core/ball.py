#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""<+Module Description.+>"""

from __future__ import division, print_function

# import sys
# import os
# import itertools as it
from math import sqrt


class Ball(object):
    def __init__(self, nick=''):
        # Give the ball the player's nick if provided, default to blank
        self.nick = nick

        # TODO: Choose a random color from a set of differentiable colors
        self.color = '#202020'

        self.alive = True

        # TODO: Ask map for a spawn point, based on map designated 'safe zone'.
        # Safe zone should place spawned players in a place where they can't
        # immediately be killed (or accidentally kill a player already in-game)
        self.x = 0.0
        self.y = 0.0

        self.speed = 0.1

    def move(self, x_target, y_target):

        x_dist = x_target - self.x
        y_dist = y_target - self.y

        len_to_target = sqrt(x_dist**2 + y_dist**2)

        # Normalize, then scale to speed
        x_move = x_dist / len_to_target * self.speed
        y_move = y_dist / len_to_target * self.speed

        self.x += x_move
        self.y += y_move

    def coords(self):
        return self.x, self.y

    def short_coords(self):
        return round(self.x, 3), round(self.y, 3)
