import polars as pl
import json
import requests
import os

# Create necessary folders
os.makedirs('www/postcode', exist_ok=True)

# Download and process the Google Sheet
doc_id = "1D7txVA3sLpXru8ykD1jOhPecBUESLex1R-vl6je67p0"
url = f"https://docs.google.com/spreadsheets/d/{doc_id}/export?format=csv"

# Download CSV and read with Polars
response = requests.get(url)
df = pl.read_csv(response.content)

# Create postcode files
for postal_code in df['Postal Code'].unique():
    group = df.filter(pl.col('Postal Code') == postal_code)
    
    locations = [
        {
            "locality": row["Locality"],
            "coordinates": {
                "latitude": float(row["Latitude"]),
                "longitude": float(row["Longitude"])
            },
            "google_maps_link": row["Google Maps Link"]
        }
        for row in group.to_dicts()
    ]
    
    json_data = {
        "state": group["State"][0],
        "lga": group["LGA"][0],
        "district": group["District/Ward"][0],
        "locations": locations
    }
    
    with open(f"www/postcode/{postal_code}", 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

# Create state hierarchy with both array and nested structure
state_data = {
    "states": [],  # Array of state names
    "details": {}  # Nested structure
}

for state in df['State'].unique():
    # Add to states array
    state_data["states"].append(state)
    
    state_group = df.filter(pl.col('State') == state)
    state_details = {
        "lgas": [],  # Array of LGA names
        "details": {}  # Nested LGA details
    }
    
    for lga in state_group['LGA'].unique():
        # Add to LGAs array
        state_details["lgas"].append(lga)
        
        lga_group = state_group.filter(pl.col('LGA') == lga)
        lga_details = {
            "districts": [],  # Array of district names
            "details": {}  # Nested district details
        }
        
        for district in lga_group['District/Ward'].unique():
            # Add to districts array
            lga_details["districts"].append(district)
            
            district_group = lga_group.filter(pl.col('District/Ward') == district)
            postal_codes = district_group['Postal Code'].unique().to_list()
            
            # Add detailed district info
            lga_details["details"][district] = {
                "postal_codes": postal_codes
            }
        
        state_details["details"][lga] = lga_details
    
    state_data["details"][state] = state_details

# Save state data
with open(f"www/states", 'w', encoding='utf-8') as f:
    json.dump(state_data, f, indent=2, ensure_ascii=False)

print("Files created successfully!")