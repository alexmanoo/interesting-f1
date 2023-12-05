"""
This script adds the ID of the race (raceId from 'races.csv' file) to new 
'safety_cars.csv' and 'red_flags.csv' files.
"""

import csv

def extract_race_name_and_year(full_race_name):
    parts = full_race_name.split(' ')
    year = parts[0]
    race_name = ' '.join(parts[1:])
    return year, race_name

def add_race_ids(file_path, save_path):
    new_rows = []
    with open(file_path, 'r') as safety_cars_file:
        reader = csv.DictReader(safety_cars_file)
        for row in reader:
            full_race_name = row['Race']
            year, race_name = extract_race_name_and_year(full_race_name)
            race_id = race_info_dict.get((year, race_name))
            if race_id:
                row['raceId'] = race_id
            else:
                print(f"Race ID for '{race_name}' not found.")
                exit(1)
            
            row['year'] = year
            new_rows.append(row)

    with open(save_path, 'w', newline='') as file:
        fieldnames = reader.fieldnames + ['raceId', 'year']
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in new_rows:
            writer.writerow(row)

race_info_dict = {}
with open('../data/races.csv', 'r') as races_file:
    reader = csv.DictReader(races_file)
    for row in reader:
        year = row['year']
        race_name = row['name']
        race_id = row['raceId']
        race_info_dict[(year, race_name)] = race_id

add_race_ids('../data/safety_cars.csv', '../data/safety_cars_with_race_ids.csv')
add_race_ids('../data/red_flags.csv', '../data/red_flags_with_race_ids.csv')
