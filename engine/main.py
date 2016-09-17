# Eco Driving Analysis Engine - The place where every calculation happens
#
# Copyright 2016-2017 John Prantalos & Stavros Tsourlidakis
#
# This file is part of Eco Driving Analysis project.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, see <http://www.gnu.org/licenses/>.

#!/usr/bin/python
import sys
import MySQLdb
import json

# Load configuration information
with open('config.json') as json_data_file:
	config = json.load(json_data_file)

# Connect to the database
db = MySQLdb.connect(
	host = config['mysql']['host'],
	user = config['mysql']['user'],
	passwd = config['mysql']['passwd'],
	db = config['mysql']['db']
)

# Create cursor object for the execution of the needed queries
cur = db.cursor()

# Add database queries here

# Close the database connection
db.close()