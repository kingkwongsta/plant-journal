import requests
import json

# URL of the running FastAPI application
BASE_URL = "http://localhost:8000"

# Data to seed
quick_details_to_seed = [
    {"emoji": "🍅", "text": "Harvest"},
    {"emoji": "📸", "text": "Snapshot"},
    {"emoji": "🌸", "text": "Bloom"},
]

def seed_data_via_api():
    """Seeds the quick_details collection by calling the FastAPI endpoint."""
    
    # First, check if there's any data to avoid duplicates
    try:
        print(f"Checking for existing data at {BASE_URL}/quick-details...")
        response = requests.get(f"{BASE_URL}/quick-details")
        response.raise_for_status() # Raise an exception for bad status codes
        existing_details = response.json()
        if existing_details:
            print("The 'quick_details' collection is not empty. Aborting seed operation.")
            for detail in existing_details:
                print(f"  - Found: {detail.get('text', 'N/A')} (ID: {detail.get('id', 'N/A')})")
            return
    except requests.exceptions.RequestException as e:
        print(f"Error checking for existing data: {e}")
        print(f"Please ensure the FastAPI server is running at {BASE_URL} and is accessible.")
        return

    print(f"Seeding {len(quick_details_to_seed)} documents via API...")
    
    headers = {'Content-Type': 'application/json'}
    
    for detail in quick_details_to_seed:
        try:
            response = requests.post(
                f"{BASE_URL}/quick-details",
                data=json.dumps(detail),
                headers=headers
            )
            response.raise_for_status()
            result = response.json()
            if result.get("status") == "success":
                print(f"  - Successfully added '{detail['text']}' with ID: {result.get('id')}")
            else:
                print(f"  - Failed to add '{detail['text']}': {result.get('message')}")
        except requests.exceptions.RequestException as e:
            print(f"  - Error adding '{detail['text']}': {e}")
            break # Stop if one request fails

    print("\nSeeding complete!")

if __name__ == "__main__":
    seed_data_via_api()
