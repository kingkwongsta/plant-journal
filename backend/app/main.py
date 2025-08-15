from fastapi import FastAPI
from google.cloud import firestore
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Initialize FastAPI app
app = FastAPI()

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

@app.post("/journal-entries/")
def create_journal_entry(entry: JournalEntry):
    try:
        # Add a new document with a generated ID
        doc_ref = db.collection(u'journal_entries').document()
        doc_ref.set(entry.dict())
        return {"status": "success", "entry_id": doc_ref.id}
    except Exception as e:
        return {"status": "error", "message": str(e)}
