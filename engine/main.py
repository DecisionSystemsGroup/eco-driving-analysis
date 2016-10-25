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
import os
import sys
import MySQLdb as sql
import json
import numpy as np
import csv
import sklearn as sk
from sklearn import neighbors

###############
## FUNCTIONS ##
###############

def create_dataset(input_list):
	# Takes a list and returns a dictionary with the data and target to
	# be used in kNN

	# Split list to data and target(classes)
	data = []
	target = []
	for row in input_list:
		data.append(row[:24])
		target.append(row[24])

	# Convert lists to numpy array
	data = np.array(data)
	target = np.array(target)

	# Replace N/A values with 0
	data[data==''] = '0'
	target[target==''] = '0'

	return {'data': merge_qualities(data), 'target': target}

def merge_qualities(data):
	# Merges the quality columns (0 - 20) into one weighted number

	data_qual = data[:,:21] # Subset the driving quality cols

	qualities = [];
	for row in data_qual:
		# For each row do the sum of each col * 10 ^ a power from -10 to 10
		# starting from -10 for the first col and ending to 10 for the 20th
		merger = 0.0
		power = -10;
		for col in row:
			merger += int(col) * (10 ** power)
			power += 1
		qualities.append(merger)    # Save the generated num to the qual array

	data_rest = data[:,21:] # Subset maxAcc, maxBrk and Speed from the dataset

	qualities = np.array(qualities) # Transform the qualities to numpy array
	qualities = qualities[:, None]  # Make qualities a 2D array for hstack to work

	data_exp = np.hstack((qualities,data_rest)) # Merge qualities and the rest
	return data_exp

def read_trip_from_database(trip_start, trip_stop, trip_class):
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
			"(`time` >= '" + trip_start + "') && " +
			"(`time` <= '" + trip_stop + "')" +
		") && (" +
			"`imei` = " + device_imei +
		")"
	)

	# Save the object in a list
	list_trip = []
	for row in cur.fetchall():
		row = list(row)	# Transform row from tuple to list, for append to work
		row[row==''] = '0'	# Change empty values to zero
		row = map(float, row) # Transform strings to float nums
		row.append(trip_class)
		list_trip.append(row)
	return list_trip


def get_results(dataset_trainee_1, dataset_instructor, dataset_trainee_2):

	# Train the kNN
	clf.fit(
		np.concatenate(
			(
				dataset_instructor['data'],
				dataset_trainee_1['data']
			),
			axis=0
		),
		np.concatenate(
			(
				dataset_instructor['target'],
				dataset_trainee_1['target']
			),
			axis=0
		),
	)

	# Get a prediction
	prediction = clf.predict(dataset_trainee_2['data'])

	# Calculate percentages
	sum_ins = 0.
	sum_trn = 0.
	for knn_class in prediction:
		if knn_class == 'ins':
			sum_ins += 1.
		elif knn_class == 'trn':
			sum_trn += 1.

	return {
		'ins': sum_ins / (sum_ins + sum_trn),
		'trn': sum_trn / (sum_ins + sum_trn)
	}

# Load configuration information
with open(os.path.dirname(os.path.realpath(__file__))+'/config.json') as json_data_file:
	config = json.load(json_data_file)

# Load Arguments
device_imei = sys.argv[1]
trip_trainee_1_start = sys.argv[2]
trip_trainee_1_stop = sys.argv[3]

trip_instructor_start = sys.argv[4]
trip_instructor_stop = sys.argv[5]

trip_trainee_2_start = sys.argv[6]
trip_trainee_2_stop = sys.argv[7]

# Connect to the database
db = sql.connect(
	host = config['mysql']['host'],
	user = config['mysql']['user'],
	passwd = config['mysql']['passwd'],
	db = config['mysql']['db']
)

# Create the knn model
clf = neighbors.KNeighborsClassifier(
	n_neighbors = int(config['knn']['neighbors']),	# No of neighbors
	p = int(config['knn']['p']),                	# p=2 Euclidean distance
	n_jobs = int(config['knn']['n_jobs'])           # Number of CPU cores used
)

# Load trips from the database
trip_trainee_1 = read_trip_from_database(trip_trainee_1_start, trip_trainee_1_stop, 'trn')
trip_instructor = read_trip_from_database(trip_instructor_start, trip_instructor_stop, 'ins')
trip_trainee_2 = read_trip_from_database(trip_trainee_2_start, trip_trainee_2_stop, 'trn')

db.close()

# Create datasets from the trips
trip_trainee_1 = create_dataset(trip_trainee_1)
trip_instructor = create_dataset(trip_instructor)
trip_trainee_2 = create_dataset(trip_trainee_2)

# Get Results
results = get_results(trip_trainee_1, trip_instructor, trip_trainee_2)

# Print Results
print "{:3.2f}".format(results['ins']*100)+",{:3.2f}".format(results['trn']*100)
