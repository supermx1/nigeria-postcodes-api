import polars as pl
import json
import requests
import os

# Create www folder if it doesn't exist
if not os.path.exists('www'):
    os.makedirs('www')

# Download and process the Google Sheet
doc_id = "1D7txVA3sLpXru8ykD1jOhPecBUESLex1R-vl6je67p0"
url = f"https://docs.google.com/spreadsheets/d/{doc_id}/export?format=csv"

# Download CSV and read with Polars
response = requests.get(url)
df = pl.read_csv(response.content)

# Group by Postal Code and create JSONs
for postal_code in df['Postal Code'].unique():
    # Filter data for this postal code
    group = df.filter(pl.col('Postal Code') == postal_code)
    
    # Create locations array
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
    
    # Create JSON structure
    json_data = {
        "state": group["State"][0],
        "lga": group["LGA"][0],
        "district": group["District/Ward"][0],
        "locations": locations
    }
    
    # Save JSON file in www folder
    with open(f"www/{postal_code}", 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

print("JSON files created successfully in www folder!")