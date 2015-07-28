#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""<+Module Description.+>"""

from __future__ import division, print_function

# import sys
# import os
# import itertools as it
from ball import Ball
from math import sin, cos


class Demo(Ball):
    def __init__(self):
        super(Demo, self).__init__('Demo')
        self.frame = 0

    def move(self):
        self.frame += 1
        super(Demo, self).move(sin(self.frame / 2.0), cos(self.frame / 2.0))
