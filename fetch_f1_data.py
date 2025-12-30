#!/usr/bin/env python3
"""
Fetch F1 2025 season data using FastF1 library.
This script retrieves race schedule, driver info, team info, and circuit details.
"""

import fastf1
import json
import pandas as pd
from datetime import datetime

def fetch_season_data(year=2025):
    """Fetch comprehensive F1 season data for the specified year."""

    print(f"Fetching F1 {year} season data...")

    # Enable cache for faster subsequent requests
    fastf1.Cache.enable_cache('f1_cache')

    # Get the event schedule for the season
    try:
        schedule = fastf1.get_event_schedule(year)
    except Exception as e:
        print(f"Error fetching schedule: {e}")
        print("The 2025 season data might not be fully available yet. Trying 2024 data...")
        year = 2024
        schedule = fastf1.get_event_schedule(year)

    # Prepare season data structure
    season_data = {
        "year": year,
        "races": [],
        "drivers": {},
        "teams": {},
        "circuits": {}
    }

    # Process each race in the schedule
    for index, event in schedule.iterrows():
        race_info = {
            "round": int(event['RoundNumber']) if pd.notna(event['RoundNumber']) else index + 1,
            "name": event['EventName'],
            "country": event['Country'],
            "location": event['Location'],
            "circuit": event['EventName'],
            "date": event['EventDate'].strftime('%Y-%m-%d') if pd.notna(event['EventDate']) else None,
            "format": event['EventFormat'],
        }

        # Add session information if available
        sessions = {}
        if pd.notna(event.get('Session1Date')):
            sessions['practice1'] = event['Session1Date'].strftime('%Y-%m-%d %H:%M:%S')
        if pd.notna(event.get('Session2Date')):
            sessions['practice2'] = event['Session2Date'].strftime('%Y-%m-%d %H:%M:%S')
        if pd.notna(event.get('Session3Date')):
            sessions['practice3'] = event['Session3Date'].strftime('%Y-%m-%d %H:%M:%S')
        if pd.notna(event.get('Session4Date')):
            sessions['qualifying'] = event['Session4Date'].strftime('%Y-%m-%d %H:%M:%S')
        if pd.notna(event.get('Session5Date')):
            sessions['race'] = event['Session5Date'].strftime('%Y-%m-%d %H:%M:%S')

        race_info['sessions'] = sessions
        season_data["races"].append(race_info)

    # Fetch driver and team data from the first available race
    print("Fetching driver and team information...")
    try:
        # Try to get data from the first race that has results
        for race_round in range(1, min(5, len(season_data["races"]) + 1)):
            try:
                session = fastf1.get_session(year, race_round, 'R')
                session.load()

                # Get drivers
                drivers = session.drivers
                for driver_num in drivers:
                    driver_info = session.get_driver(driver_num)
                    driver_abbr = driver_info['Abbreviation']

                    if driver_abbr not in season_data["drivers"]:
                        season_data["drivers"][driver_abbr] = {
                            "number": int(driver_num),
                            "code": driver_abbr,
                            "firstName": driver_info['FirstName'],
                            "lastName": driver_info['LastName'],
                            "fullName": driver_info['FullName'],
                            "team": driver_info['TeamName'],
                            "teamColor": driver_info['TeamColor']
                        }

                        # Add team info
                        team_name = driver_info['TeamName']
                        if team_name not in season_data["teams"]:
                            season_data["teams"][team_name] = {
                                "name": team_name,
                                "color": driver_info['TeamColor'],
                                "drivers": []
                            }

                        if driver_abbr not in season_data["teams"][team_name]["drivers"]:
                            season_data["teams"][team_name]["drivers"].append(driver_abbr)

                print(f"Successfully loaded driver/team data from race {race_round}")
                break

            except Exception as e:
                print(f"Could not load race {race_round}: {e}")
                continue

    except Exception as e:
        print(f"Warning: Could not fetch detailed driver/team data: {e}")
        print("Using static 2024 team data as fallback...")

        # Fallback team data (2024 teams)
        season_data["teams"] = {
            "Red Bull Racing": {"name": "Red Bull Racing", "color": "3671C6", "drivers": []},
            "Mercedes": {"name": "Mercedes", "color": "27F4D2", "drivers": []},
            "Ferrari": {"name": "Ferrari", "color": "E8002D", "drivers": []},
            "McLaren": {"name": "McLaren", "color": "FF8000", "drivers": []},
            "Aston Martin": {"name": "Aston Martin", "color": "229971", "drivers": []},
            "Alpine": {"name": "Alpine", "color": "FF87BC", "drivers": []},
            "Williams": {"name": "Williams", "color": "64C4FF", "drivers": []},
            "RB": {"name": "RB", "color": "6692FF", "drivers": []},
            "Kick Sauber": {"name": "Kick Sauber", "color": "52E252", "drivers": []},
            "Haas F1 Team": {"name": "Haas F1 Team", "color": "B6BABD", "drivers": []}
        }

    # Add circuit information
    for race in season_data["races"]:
        circuit_name = race["name"]
        if circuit_name not in season_data["circuits"]:
            season_data["circuits"][circuit_name] = {
                "name": circuit_name,
                "location": race["location"],
                "country": race["country"]
            }

    return season_data


def save_to_json(data, filename='f1_season_data.json'):
    """Save the season data to a JSON file."""
    filepath = f"/Users/haydenchristie/Desktop/f1-strategy-simulator/public/{filename}"

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nData saved to: {filepath}")
    print(f"Total races: {len(data['races'])}")
    print(f"Total drivers: {len(data['drivers'])}")
    print(f"Total teams: {len(data['teams'])}")
    print(f"Total circuits: {len(data['circuits'])}")


if __name__ == "__main__":
    # Fetch the data
    season_data = fetch_season_data(2025)

    # Save to JSON
    save_to_json(season_data)

    print("\nF1 season data successfully fetched and saved!")
