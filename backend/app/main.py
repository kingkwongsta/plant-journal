from fastapi import FastAPI
from google.cloud import firestore

# Initialize FastAPI app
app = FastAPI()

# Initialize Firestore client
# Make sure to set up Google Cloud authentication correctly in your environment
db = firestore.Client()

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
