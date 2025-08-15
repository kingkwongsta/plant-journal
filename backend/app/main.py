from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import openai
import json
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client for OpenRouter
client = openai.OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Initialize FastAPI app
app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firestore client
# Make sure to set up Google Cloud authentication correctly in your environment
db = firestore.Client()

# Pydantic model for a journal entry
class JournalEntry(BaseModel):
    plant_name: str
    plant_variety: str
    date: datetime
    notes: str
    image_urls: Optional[List[str]] = None
    weather: Optional[str] = None
    humidity: Optional[float] = None
    event_type: str # harvest, bloom, snapshot
    quantity: Optional[int] = None # For harvest events

# Pydantic model for updating a journal entry (all fields optional)
class UpdateJournalEntry(BaseModel):
    plant_name: Optional[str] = None
    plant_variety: Optional[str] = None
    date: Optional[datetime] = None
    notes: Optional[str] = None
    image_urls: Optional[List[str]] = None
    weather: Optional[str] = None
    humidity: Optional[float] = None
    event_type: Optional[str] = None
    quantity: Optional[int] = None

# Pydantic model for text input
class JournalText(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the Plant Journal API"}

@app.get("/test-firestore")
def test_firestore():
    try:
        # Try to access a collection to test the connection
        doc_ref = db.collection(u'test_collection').document(u'test_doc')
        doc_ref.set({
            u'foo': u'bar'
        })
        return {"status": "Successfully connected to Firestore and wrote a test document."}
    except Exception as e:
        return {"status": "Failed to connect to Firestore", "error": str(e)}

@app.post("/journal")
def create_journal_entry(entry: JournalEntry):
    try:
        # Add a new document with a generated ID
        doc_ref = db.collection(u'journal_entries').document()
        doc_ref.set(entry.dict())
        return {"status": "success", "entry_id": doc_ref.id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/journal")
def get_all_journal_entries():
    try:
        entries_ref = db.collection(u'journal_entries')
        docs = entries_ref.stream()
        entries = []
        for doc in docs:
            entry_data = doc.to_dict()
            entry_data['id'] = doc.id
            entries.append(entry_data)
        return entries
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/journal/{entry_id}")
def get_journal_entry(entry_id: str):
    try:
        doc_ref = db.collection(u'journal_entries').document(entry_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        else:
            return {"status": "error", "message": "Entry not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.put("/journal/{entry_id}")
def update_journal_entry(entry_id: str, entry: UpdateJournalEntry):
    try:
        doc_ref = db.collection(u'journal_entries').document(entry_id)
        # Use exclude_unset=True to only update fields that are provided
        doc_ref.update(entry.dict(exclude_unset=True))
        return {"status": "success", "entry_id": entry_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/journal/from-text")
def create_journal_from_text(journal_text: JournalText):
    try:
        prompt = f"""
        Extract the following information from the text and return it as a JSON object:
        - plant_name (string)
        - plant_variety (string)
        - date (datetime in ISO 8601 format, assume today if not specified)
        - notes (string)
        - image_urls (list of strings, optional)
        - weather (string, optional)
        - humidity (float, optional)
        - event_type (string, one of: 'harvest', 'bloom', 'snapshot')
        - quantity (integer, optional, only for harvest events, e.g., 3 for 3 harvested items)

        Text: "{journal_text.text}"

        JSON Output:
        """

        completion = client.chat.completions.create(
            model="openai/gpt-5-nano",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={"type": "json_object"},
        )
        
        structured_data = json.loads(completion.choices[0].message.content)

        # You might want to add validation here to ensure the structured_data
        # matches the JournalEntry model before saving.
        # For now, we'll save it directly.

        doc_ref = db.collection(u'journal_entries').document()
        doc_ref.set(structured_data)
        
        return {"status": "success", "entry_id": doc_ref.id, "data": structured_data}

    except Exception as e:
        return {"status": "error", "message": str(e)}
