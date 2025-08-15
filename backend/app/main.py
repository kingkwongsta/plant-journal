from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import openai
import json
from dotenv import load_dotenv
import logging
import time
import uuid
from google.cloud import storage
from google.oauth2 import credentials

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize OpenAI client for OpenRouter
client = openai.OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Initialize FastAPI app
app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"method={request.method} path='{request.url.path}' status_code={response.status_code} process_time={process_time:.4f}s")
    return response

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

# Initialize Firebase Storage client
# Initialize Firebase Admin SDK
# Make sure to set the GOOGLE_APPLICATION_CREDENTIALS environment variable
bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET") # Replace with your bucket name
if not bucket_name:
    raise ValueError("FIREBASE_STORAGE_BUCKET environment variable not set")

storage_client = storage.Client()
bucket = storage_client.bucket(bucket_name)

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
    quantity: Optional[str] = None

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
    quantity: Optional[str] = None

# Pydantic model for text input
class JournalText(BaseModel):
    text: str

class QuickDetail(BaseModel):
    emoji: str
    text: str

class UpdateQuickDetail(BaseModel):
    id: str # Add ID to the update model
    emoji: Optional[str] = None
    text: Optional[str] = None

class QuickDetailBatchUpdate(BaseModel):
    create: List[QuickDetail] = []
    update: List[UpdateQuickDetail] = []
    delete: List[str] = [] # List of IDs to delete

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

@app.get("/quick-details")
def get_quick_details():
    try:
        details_ref = db.collection(u'quick_details')
        docs = details_ref.stream()
        details = []
        for doc in docs:
            detail_data = doc.to_dict()
            detail_data['id'] = doc.id
            details.append(detail_data)
        return details
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/quick-details")
def create_quick_detail(detail: QuickDetail):
    try:
        doc_ref = db.collection(u'quick_details').document()
        doc_ref.set(detail.dict())
        return {"status": "success", "id": doc_ref.id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.put("/quick-details/{detail_id}")
def update_quick_detail(detail_id: str, detail: UpdateQuickDetail):
    try:
        doc_ref = db.collection(u'quick_details').document(detail_id)
        doc_ref.update(detail.dict(exclude_unset=True))
        return {"status": "success", "id": detail_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.delete("/quick-details/{detail_id}")
def delete_quick_detail(detail_id: str):
    try:
        db.collection(u'quick_details').document(detail_id).delete()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/quick-details/batch")
def batch_update_quick_details(batch: QuickDetailBatchUpdate):
    try:
        firestore_batch = db.batch()

        # Handle creations
        for detail in batch.create:
            doc_ref = db.collection(u'quick_details').document()
            firestore_batch.set(doc_ref, detail.dict())

        # Handle updates
        for detail in batch.update:
            doc_ref = db.collection(u'quick_details').document(detail.id)
            update_data = detail.dict(exclude_unset=True)
            if 'id' in update_data:
                del update_data['id']
            firestore_batch.update(doc_ref, update_data)

        # Handle deletions
        for detail_id in batch.delete:
            doc_ref = db.collection(u'quick_details').document(detail_id)
            firestore_batch.delete(doc_ref)

        firestore_batch.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/journal/upload")
async def create_journal_entry_with_upload(
    entry_data: str = Form(...),
    images: Optional[List[UploadFile]] = File(None),
):
    try:
        logger.info(f"Received entry data: {entry_data}")
        # Parse the JSON data from the form field
        entry = json.loads(entry_data)
        logger.info(f"Parsed entry data: {entry}")
        
        # AI extraction from notes
        prompt = f"""
        Extract the following information from the text and return it as a JSON object:
        - plant_name (string)
        - plant_variety (string)
        - date (datetime in ISO 8601 format, assume today if not specified)
        - notes (string)
        - weather (string, optional)
        - humidity (float, optional)
        - event_type (string, one of: 'harvest', 'bloom', 'snapshot')
        - quantity (string, optional, only for harvest events, e.g., '3' for 3 harvested items)

        Text: "{entry['notes']}"

        JSON Output:
        """

        completion = client.chat.completions.create(
            model="mistralai/ministral-8b",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={"type": "json_object"},
        )
        
        structured_data = json.loads(completion.choices[0].message.content)
        entry.update(structured_data)
        
        image_urls = []
        if images:
            for image in images:
                # Create a unique filename
                filename = f"journal_images/{uuid.uuid4()}-{image.filename}"
                blob = bucket.blob(filename)
                
                # Upload the file
                blob.upload_from_file(image.file, content_type=image.content_type)
                
                # Make the file publicly accessible (optional, adjust permissions as needed)
                blob.make_public()
                
                # Add the public URL to the list
                image_urls.append(blob.public_url)
        
        entry['image_urls'] = image_urls
        
        # Add a new document with a generated ID
        doc_ref = db.collection(u'journal_entries').document()
        doc_ref.set(entry)
        
        # Return the created entry with its new ID
        created_entry = doc_ref.get().to_dict()
        created_entry['id'] = doc_ref.id
        
        return {"status": "success", "entry": created_entry}
    except Exception as e:
        logger.error(f"Error creating journal entry: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/journal/from-text")
def create_journal_from_text(journal_text: JournalText):
    try:
        prompt = f"""
        Extract the following information from the text and return it as a JSON object:
        - plant_name (string)
        - plant_variety (string)
        - date (datetime in ISO 8601 format, assume today if not specified)
        - notes (string)
        - weather (string, optional)
        - humidity (float, optional)
        - event_type (string, one of: 'harvest', 'bloom', 'snapshot')
        - quantity (string, optional, only for harvest events, e.g., '3' for 3 harvested items)

        Text: "{journal_text.text}"

        JSON Output:
        """

        completion = client.chat.completions.create(
            model="mistralai/ministral-8b",
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
        
        # Add the ID to the data returned to the client
        structured_data['id'] = doc_ref.id
        
        return {"status": "success", "entry": structured_data}

    except Exception as e:
        return {"status": "error", "message": str(e)}
