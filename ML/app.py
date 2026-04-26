from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime, timedelta
import google.generativeai as genai
import numpy as np
import faiss
import ollama
import pickle
import jwt
import bcrypt
import json
import os
from mistralai.client import Mistral
from pymongo import MongoClient
import re
import random
# from RAG.retrievequery import generate_response, load_vector_store
from collections import defaultdict
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ Move this to startup — load ONCE, not on every message


# -----------------------------
# LOAD ENVIRONMENT VARIABLES
# -----------------------------
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")
GEMINI_API_KEY = os.getenv("API_KEY")

# -----------------------------
# DB CONNECTION
# -----------------------------
client = MongoClient(MONGO_URI)
db = client["test"]
users = db["users"]


# -----------------------------
# FASTAPI APP SETUP
# -----------------------------
app = FastAPI(title="SafeSpace AI Backend", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


load_dotenv()
print("API KEY:", os.getenv("MISTRAL_API_KEY"))

def retrieve(query, index, chunks, k=5):
    query_embedding = ollama.embeddings(
        model="nomic-embed-text",
        prompt=query
    )["embedding"]

    D, I = index.search(
        np.array([query_embedding]).astype("float32"), k
    )

    return [chunks[i] for i in I[0]]

def load_vector_store(index_path="faiss_index.bin", chunks_path="chunks.pkl"):
    try:
        print("📦 Loading FAISS index...")
        index = faiss.read_index(index_path)

        print("📄 Loading chunks...")
        with open(chunks_path, "rb") as f:
            chunks = pickle.load(f)

        print(f"✅ Loaded {len(chunks)} chunks")

        return index, chunks

    except Exception as e:
        print(f"❌ Error loading vector store: {e}")
        return None, None

def generate_response(query, context_chunks):
    
    context = context_chunks

    prompt = f"""
        You are a supportive and thoughtful mental health assistant.

        STRICT RULES:
        - Ask only ONE question per response, and only if it naturally moves the conversation forward
        - Do NOT repeat or rephrase questions already asked (see 'Already asked' below)
        - Do NOT always end with a question — sometimes just reflect, validate, or reframe
        - Use the user's own words when reflecting back to them
        - Acknowledge what they said BEFORE asking anything
        - Keep responses to 3-5 sentences max
        - Never say generic phrases like "I'm here for you" without substance
        - Never mention "context", "articles", or that you're retrieving information

        Guidelines:
        - Use the provided context as supporting knowledge, not as the main response.
        - Do NOT copy or directly repeat sentences from the context.
        - Blend relevant ideas naturally into your response in your own words.
        - Prioritize the user's message over the context. The response should feel personal, not generic.

        HANDLING "WHAT SHOULD I DO" QUESTIONS:
        - If the user asks for advice or "what should I do", do NOT deflect with another question
        - Give a short, practical, emotionally grounded suggestion (1-2 sentences)
        - Then optionally check in with one gentle question like "Does that feel doable?"
        - Never respond to a direct request for help with only a reflection

        Tone:
        - Be empathetic, calm, and human-like.
        - Avoid repetitive phrases like "I understand how you feel".
        - Do not sound robotic or overly formal.

        Content:
        - Give practical, actionable, and specific suggestions when appropriate.
        - Avoid overly generic advice (e.g., "stay positive", "everything will be okay").
        - If context is not relevant, ignore it.

        Structure:
        - First: Acknowledge the user's feeling in a natural way (not templated, and only when necessary).
        - Second: Reflect or reframe their situation briefly.
        - Once context is clear : Start offering gentle reframes or suggestions
        - Direct advice requests : Answer them, don't deflect
        - Optional: Ask a gentle follow-up question if and only if it helps continue the conversation.

        PEOPLE/ROLES TRACKING:
        - The user is the one speaking to you
        - Track any other people mentioned (wife, friend, boss etc.) by name or role
        - Never attribute the wrong emotion or behavior to the wrong person

        Important:
        - Never mention "context" or "articles" in the response.
        - Never sound like a knowledge retrieval system.
        - The response should feel like it comes from a caring human, not a database.

        Context:
        {context}

        User:
        {query}

        Answer:
        """
    with Mistral(api_key=os.getenv("MISTRAL_API_KEY", ""),) as mistral:

        res = mistral.chat.complete(model="mistral-small", messages=[
            {
                "role": "user",
                "content": prompt,
            },
        ], stream=False, response_format={
            "type": "text",
    })

    for i in res:
        print(i)
    return res.choices[0].message.content


def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def detect_intent(message: str):
    msg = message.lower().strip()

    greetings = ["hi", "hello", "hey", "yo", "hii"]
    if any(msg == g or msg.startswith(g + " ") for g in greetings):
        return "GREETING"

    emotional_patterns = [
        r"\bi am sad\b", r"\bi feel sad\b", r"\bi'm sad\b",
        r"\blonely\b", r"\bempty\b", r"\bhurt\b",
        r"\bcry\b", r"\bcrying\b", r"\bbreakup\b"
    ]
    if any(re.search(p, msg) for p in emotional_patterns):
        return "EMOTION"

    venting_patterns = [
        r"\bfuck\b", r"\bbhenchod\b", r"\bshit\b",
        r"\bangry\b", r"\bpissed\b", r"\bfrustrated\b"
    ]
    if any(re.search(p, msg) for p in venting_patterns):
        return "VENTING"

    acute_distress_patterns = [ r"heavy breathing", r"can't breathe", r"trapped", r"panic", r"nightmare", r"heart racing", r"scared to sleep", r"woke up gasping"]

    if any(re.search(p, msg) for p in acute_distress_patterns):
        return "ACUTE_DISTRESS"
    
    cbt_triggers = [
        "how do i", "how can i", "what should i do",
        "cope", "manage", "deal with", "handle"
    ]
    if any(t in msg for t in cbt_triggers):
        return "CBT_QUERY"

    return "GENERAL_CHAT"

def verify_password(password: str, hashed: str):
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_access_token(user_id: str):
    payload = {
        "id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(401, "Invalid or expired token")

def serialize_mongo(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, list):
        return [serialize_mongo(i) for i in obj]
    if isinstance(obj, dict):
        return {k: serialize_mongo(v) for k, v in obj.items()}
    return obj

# -----------------------------
# AUTH DEPENDENCY
# -----------------------------
async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid auth header")

    token = authorization.removeprefix("Bearer ").strip()
    decoded = decode_token(token)

    user = users.find_one({"_id": ObjectId(decoded["id"])})
    if not user:
        raise HTTPException(404, "User not found")

    return user


# -----------------------------
# SCHEMAS
# -----------------------------
class RegisterModel(BaseModel):
    name: str
    email: str
    password: str
    phone: str

class LoginModel(BaseModel):
    email: str
    password: str

class JournalEntryModel(BaseModel):
    date: str
    mood: str
    emoji: str
    note: str

class ChatModel(BaseModel):
    message: str

# -----------------------------
# ROOT ROUTE
# -----------------------------
@app.get("/")
def home():
    return {"message": "SafeSpace FastAPI backend running."}

# -----------------------------
# USER REGISTRATION
# -----------------------------
@app.post("/api/register")
def register(data: RegisterModel):
    if users.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")

    users.insert_one({
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "phone": data.phone,
        "role": "user",
        "notifications": [],
        "journal": [],
    })
    

    return {"message": "User created"}

# -----------------------------
# LOGIN
# -----------------------------
@app.post("/api/login")
def login(data: LoginModel):
    print(data)
    user = users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token(str(user["_id"]))
    return {"token": token}

# -----------------------------
# GET USER DETAILS
# -----------------------------
@app.get("/api/user")
def get_user(user=Depends(get_current_user)):
    user.pop("password", None)
    return serialize_mongo(user)

# -----------------------------
# GET NOTIFICATIONS
# -----------------------------
@app.get("/api/notifications")
def notifications(user=Depends(get_current_user)):
    return serialize_mongo(user.get("notifications", []))

# -----------------------------
# SEND NOTIFICATION TO ADMIN
# -----------------------------
@app.post("/notify-admin")
def notify_admin(data: dict, user=Depends(get_current_user)):
    admin = users.find_one({"role": "admin"})
    if not admin:
        raise HTTPException(404, "Admin not found")

    notification = {
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "tag": "Suicidal",
        "text": data["message"],
        "time": data["timestamp"],
    }

    users.update_one(
        {"_id": admin["_id"]},
        {"$push": {"notifications": notification}},
    )

    return {"status": "sent"}


# -----------------------------
# SAVE JOURNAL ENTRY
# -----------------------------
@app.post("/api/journal")
def save_journal(data: JournalEntryModel, user=Depends(get_current_user)):
    users.update_one(
        {"_id": user["_id"]},
        {"$push": {
            "journal": {
                "date": data.date,
                "mood": data.mood,
                "emoji": data.emoji,
                "note": data.note,
            }
        }}
    )
    return {"message": "Journal saved"}

# -----------------------------
# FETCH JOURNAL ENTRIES
# -----------------------------
@app.get("/api/journal")
def get_journal(user=Depends(get_current_user)):
    return serialize_mongo(user.get("journal", []))


# -----------------------------
# RAG + GEMINI CHAT ENDPOINT
# -----------------------------

@app.post("/chat")
def chat(data: ChatModel, user=Depends(get_current_user)):

    from collections import defaultdict
    conversation_store: dict[str, list] = defaultdict(list)
    
    index, all_chunks = load_vector_store(index_path="RAG\\faiss_index.bin", chunks_path="RAG\chunks.pkl")

    user_id = str(user["_id"])
    history = conversation_store[user_id]

    relevant_chunks = retrieve(data.message, index, all_chunks, k=3)
    rag_context = "\n\n".join(relevant_chunks) if relevant_chunks else "No specific context found."

    history_text = "\n".join([
        f"{'User' if m['role'] == 'user' else 'Solace'}: {m['content']}"
        for m in history[-8:]  # last 4 exchanges
    ]) or "This is the start of the conversation."

    previous_questions = [
        m['content'] for m in history 
        if m['role'] == 'assistant'
    ]
    asked_already = "\n".join(previous_questions[-4:]) if previous_questions else "None"

    prompt = data.message
    response = generate_response(prompt, all_chunks)
    reply=response or "I’m here with you."

    history.append({"role": "user",      "content": data.message})
    history.append({"role": "assistant", "content": reply})

    return {
        "response": response or "I’m here with you."
    }
