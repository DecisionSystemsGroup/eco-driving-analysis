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
import MySQLdb as sql
import json
import numpy as np
import csv

# Load Arguments
operation = sys.argv[1] # Get the operation: save_trip, train_knn

if operation == "save_trip":	# Argument types change depending on operation
	filename = sys.argv[2]		# A string for filename
	get_trip_from = sys.argv[3]	# Timestamp in the format "2016-01-01 14:59"
	get_trip_to = sys.argv[4]	# Timestamp in the format "2016-01-01 14:59"

# Load configuration information
with open('config.json') as json_data_file:
	config = json.load(json_data_file)

if operation == "save_trip":
	# Connect to the database
	db = sql.connect(
		host = config['mysql']['host'],
		user = config['mysql']['user'],
		passwd = config['mysql']['passwd'],
		db = config['mysql']['db']
	)

	# Create cursor object for the execution of the needed queries
	cur = db.cursor()

	# Get the trip from the database. If every driving quality in a row is zero
	# or null ignore the row.
	cur.execute(
		"SELECT" + 
			"`driving_quality0`," +
			"`driving_quality1`," +
			"`driving_quality2`," +
			"`driving_quality3`," +
			"`driving_quality4`," +
			"`driving_quality5`," +
			"`driving_quality6`," +
			"`driving_quality7`," +
			"`driving_quality8`," +
			"`driving_quality9`," +
			"`driving_quality10`," +
			"`driving_quality11`," +
			"`driving_quality12`," +
			"`driving_quality13`," +
			"`driving_quality14`," +
			"`driving_quality15`," +
			"`driving_quality16`," +
			"`driving_quality17`," +
			"`driving_quality18`," +
			"`driving_quality19`," +
			"`driving_quality20`," +
			"`wln_accel_max`," +
			"`wln_brk_max`," +
			"`speed`" +
		"FROM `telemetry`" +
		"WHERE ("+
			"(`driving_quality0` != 0) ||" + 
			"(`driving_quality1` != 0) ||" + 
			"(`driving_quality2` != 0) ||" + 
			"(`driving_quality3` != 0) ||" + 
			"(`driving_quality4` != 0) ||" + 
			"(`driving_quality5` != 0) ||" + 
			"(`driving_quality6` != 0) ||" + 
			"(`driving_quality7` != 0) ||" + 
			"(`driving_quality8` != 0) ||" + 
			"(`driving_quality9` != 0) ||" + 
			"(`driving_quality10` != 0) ||" + 
			"(`driving_quality11` != 0) ||" + 
			"(`driving_quality12` != 0) ||" + 
			"(`driving_quality13` != 0) ||" + 
			"(`driving_quality14` != 0) ||" + 
			"(`driving_quality15` != 0) ||" + 
			"(`driving_quality16` != 0) ||" + 
			"(`driving_quality17` != 0) ||" + 
			"(`driving_quality18` != 0) ||" + 
			"(`driving_quality19` != 0) ||" + 
			"(`driving_quality20` != 0) ||" +
			"(`driving_quality0` != null) ||" + 
			"(`driving_quality1` != null) ||" + 
			"(`driving_quality2` != null) ||" + 
			"(`driving_quality3` != null) ||" + 
			"(`driving_quality4` != null) ||" + 
			"(`driving_quality5` != null) ||" + 
			"(`driving_quality6` != null) ||" + 
			"(`driving_quality7` != null) ||" + 
			"(`driving_quality8` != null) ||" + 
			"(`driving_quality9` != null) ||" + 
			"(`driving_quality10` != null) ||" + 
			"(`driving_quality11` != null) ||" + 
			"(`driving_quality12` != null) ||" + 
			"(`driving_quality13` != null) ||" + 
			"(`driving_quality14` != null) ||" + 
			"(`driving_quality15` != null) ||" + 
			"(`driving_quality16` != null) ||" + 
			"(`driving_quality17` != null) ||" + 
			"(`driving_quality18` != null) ||" + 
			"(`driving_quality19` != null) ||" + 
			"(`driving_quality20` != null)" +
		") && (" +
			"(`time` >= '" + get_trip_from + "') && " +
			"(`time` <= '" + get_trip_to + "')" +
		")"	
	)

	# Save the object in a list
	list_trip = []
	for row in cur.fetchall():
		list_trip.append(row)

	# Close the database connection
	db.close()

	# Export it as a CSV
	with open('../cache/trips/' + filename + '.csv', 'w') as fp:
		a = csv.writer(fp, delimiter=',')
		data = list_trip
		a.writerows(data)

	# Dance naked in the moonlight