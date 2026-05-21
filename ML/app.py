from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime, timedelta
import numpy as np
import faiss
import ollama
import pickle
import jwt
import bcrypt
import os
from mistralai.client import Mistral
from pymongo import MongoClient
import re
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
    
#env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")
GEMINI_API_KEY = os.getenv("API_KEY")

#db connect
client = MongoClient(MONGO_URI)
db = client["test"]
users = db["users"]

#schema
class RegisterModel(BaseModel):
    name: str
    email: str
    password: str
    phone: str

class ChatModel(BaseModel):
    message: str

class LoginModel(BaseModel):
    email: str
    password: str

#app-setup
app = FastAPI(title="SafeSpace AI Backend", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#--------------------------------------------------------------------------------------------------------------------|
#-------------------------------------------------------CHAT TOOLs ---------------------------------------------------|

conversation_store: dict[str, list] = defaultdict(list)

def retrieve(query, index, chunks, k=5):
    query_embedding = ollama.embeddings(
        model="nomic-embed-text",
        prompt=query
    )["embedding"]

    D, I = index.search(
        np.array([query_embedding]).astype("float32"), k
    )

    return [chunks[i] for i in I[0]]

def load_vector_store(index_path="RAG/faiss_index.bin", chunks_path="RAG/chunks.pkl"):
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

def generate_response(query, context_chunks, history):
    
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

        Recent Conversation:
        {history}

        Context:
        {context}

        User:
        {query}

        Answer:
        """
    print("Mistral: ", os.getenv("MISTAL_API_KEY"))
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

#---------------------------------------------------------------------------------------------------------------------|


#---------------------------------------------------TOKENS AND INTERNAL FUNCTIONS-------------------------------------|
def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

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

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid auth header")

    token = authorization.removeprefix("Bearer ").strip()
    decoded = decode_token(token)

    user = users.find_one({"_id": ObjectId(decoded["id"])})
    if not user:
        raise HTTPException(404, "User not found")

    return user


#_-----------------------------------------------------------------------------------------|
#-----------------------------------------------ROUTES-------------------------------------|
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

@app.get("/")
def home():
    return {"message": "SafeSpace FastAPI backend running."}

@app.post("/api/login")
def login(data: LoginModel):
    print(data)
    user = users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        print("Invalid cred")
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token(str(user["_id"]))
    return {"token": token}

@app.get("/api/user")
def get_user(user=Depends(get_current_user)):
    user.pop("password", None)
    return serialize_mongo(user)

@app.post("/chat")
def chat(data: ChatModel, user=Depends(get_current_user)):
    
    #index- all vectors, chunks- al text chunks
    index, all_chunks = load_vector_store(index_path="RAG/faiss_index.bin", chunks_path="RAG/chunks.pkl")
    print(index)
    print(all_chunks)

    user_id = str(user["_id"])
    history = conversation_store[user_id]


    history_text = "\n".join([
        f"{m['role'].capitalize()}: {m['content']}" for m in history[-8:]
    ]) or "This is the start of the conversation."
    
    relevant_chunks = retrieve(history_text+ "\nUser: "+data.message, index, all_chunks, k=3)
    rag_context = "\n\n".join(relevant_chunks) if relevant_chunks else "No specific context found."

    previous_questions = [
        m['content'] for m in history 
        if m['role'] == 'assistant'
    ]
    

    prompt = data.message
    response = generate_response(prompt, rag_context, history_text)
    reply=response or "I’m here with you."

    history.append({"role": "user",      "content": data.message})
    history.append({"role": "assistant", "content": reply})

    return {
        "response": response or "I’m here with you."
    }
