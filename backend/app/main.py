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

@app.get("/journal-entries/")
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

@app.get("/journal-entries/{entry_id}")
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

@app.put("/journal-entries/{entry_id}")
def update_journal_entry(entry_id: str, entry: UpdateJournalEntry):
    try:
        doc_ref = db.collection(u'journal_entries').document(entry_id)
        # Use exclude_unset=True to only update fields that are provided
        doc_ref.update(entry.dict(exclude_unset=True))
        return {"status": "success", "entry_id": entry_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}
