"""
This script adds the ID of the race (raceId from 'races.csv' file) to a new 
'race_ratings.csv' file.
"""

import csv

def normalize_race_name(name):
    return name.replace(' Grand Prix', ' GP').strip()

race_id_map = {}
with open('../data/races.csv', 'r') as races_file:
    reader = csv.DictReader(races_file)
    for row in reader:
        year = row['year']
        race_name = normalize_race_name(row['name'])
        race_id = row['raceId']
        race_id_map[(year, race_name)] = race_id

updated_rows = []
with open('../data/overtakes.csv', 'r') as race_ratings_file:
    reader = csv.DictReader(race_ratings_file)
    for row in reader:
        year = row['season']
        race_name = row['Race']
        race_id = race_id_map.get((year, race_name))
        if race_id:
            row['raceId'] = race_id
        else:
            print(f"Race ID for '{(year, race_name)}' not found.")
            exit(1)
        updated_rows.append(row)

with open('../data/overtakes_with_ids.csv', 'w', newline='') as file3_updated:
    fieldnames = reader.fieldnames + ['raceId']
    writer = csv.DictWriter(file3_updated, fieldnames=fieldnames)
    writer.writeheader()
    for row in updated_rows:
        writer.writerow(row)