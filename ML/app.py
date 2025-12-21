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
import jwt
import bcrypt
import json
import os
from pymongo import MongoClient
import re
import random


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

# -----------------------------
# HELPERS
# -----------------------------

GENERIC_PROMPT = """
You are Solace, a kind, calm, supportive conversational assistant.

Guidelines:
- Be warm, human, and brief.
- Do NOT give mental health advice.
- Do NOT provide therapy or CBT techniques.
- You may ask gentle follow-up questions.
- If the user expresses distress, respond with empathy only.

User message:
{message}
"""

EMOTION_RESPONSES = [
    "That sounds really heavy. I’m really sorry you’re going through this.",
    "I hear how painful this feels. Breakups can leave a deep emptiness.",
    "It makes sense to feel this way after something like that.",
    "I’m really sorry — that kind of pain can feel overwhelming.",
    "What you’re feeling is valid. Anyone in your place would struggle.",
    "That sounds incredibly hard. I’m glad you reached out.",
    "I can hear how much this is hurting right now.",
    "It sounds like you’re carrying a lot inside.",
    "This sounds deeply painful, and I’m really sorry you’re experiencing it.",
    "Heartbreak can shake your whole sense of stability — it’s not small.",
    "It’s understandable if this feels unbearable right now.",
    "That kind of emotional loss can feel exhausting and confusing.",
    "It’s okay if you don’t have clarity about your feelings yet.",
    "This kind of hurt doesn’t just disappear overnight.",
    "What you’re feeling isn’t weakness — it’s human.",
    "It sounds like this has left you feeling really alone.",
    "Pain like this can make everything else feel heavier too.",
    "You’re not wrong for feeling this deeply."
]

FOLLOW_UPS = [
    "Do you want to talk about what’s hurting the most right now?",
    "What part of this feels hardest at the moment?",
    "I’m here with you — you can share more if you want.",
    "What’s been going through your mind since this happened?",
    "Do you feel more sad, angry, or just empty right now?",
    "Would it help to talk about what you’re missing the most?",
    "What’s the thought that keeps coming back the most?",
    "When did this start feeling unbearable for you?",
    "What feels most confusing about this situation?",
    "Are you feeling this more in your thoughts or your body right now?",
    "What do you find yourself replaying over and over?",
    "Is there something you wish you could say but haven’t?",
    "What feels hardest about today specifically?",
    "Do you feel like this pain comes in waves or stays constant?",
    "What do you feel you’ve lost the most?",
    "Would you like to just vent, or do you want help coping right now?"
]

VENTING_RESPONSES = [
    "That sounds really intense. I can feel how frustrated you are.",
    "It sounds like you’ve been holding this in for a while.",
    "That anger makes sense given what you’re dealing with.",
    "It’s okay to feel this mad about it.",
    "That sounds like a lot to carry emotionally.",
    "It sounds like this has built up over time.",
    "Letting this out makes sense — bottling it up can be exhausting.",
    "That frustration feels completely justified.",
    "You don’t have to censor yourself here.",
    "It sounds like you’re at your limit right now.",
    "That kind of anger often comes from feeling deeply hurt.",
    "It makes sense if you’re feeling both angry and sad at the same time.",
    "This sounds like it crossed an emotional boundary for you.",
    "You’re allowed to be upset about this.",
    "That reaction doesn’t make you a bad person — it makes you human."
]

ACUTE_DISTRESS_RESPONSES = [
    "That sounds really frightening. Waking up like that can make your body feel like the danger is still there.",
    "I’m really sorry you experienced that. Nightmares can leave your body feeling shaken even after you wake up.",
    "That must have been terrifying to wake up feeling trapped like that."
]

GROUNDING_PROMPTS = [
    "You’re awake now, and you’re safe in this moment.",
    "Nothing bad is happening right now — your body is reacting to fear that has passed.",
    "Take a moment with me. You’re here, and the nightmare is over."
]

GROUNDING_FOLLOW_UPS = [
    "Would it help to tell me which part of the dream felt the scariest?",
    "What does your body feel like right now?",
    "Do you feel more scared, tense, or exhausted at the moment?"
]

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
    intent = detect_intent(data.message)
    # GREETING
    if intent == "GREETING":
        return {
            "response": "Hi! I’m here with you. How are you feeling today?"
        }

    # EMOTIONAL EXPRESSION
    if intent == "EMOTION":
        response = random.choice(EMOTION_RESPONSES)
        follow_up = random.choice(FOLLOW_UPS)
        return {
            "response": f"{response} {follow_up}"
        }
    
    # VENTING
    if intent == "VENTING":
        response = random.choice(VENTING_RESPONSES)
        follow_up = random.choice(FOLLOW_UPS)

        return {
            "response": f"{response} {follow_up}"
        }
    
    if intent == "ACUTE_DISTRESS":
        response = random.choice(ACUTE_DISTRESS_RESPONSES)
        grounding = random.choice(GROUNDING_PROMPTS)
        follow_up = random.choice(GROUNDING_FOLLOW_UPS)
    
        return {
            "response": f"{response} {grounding} {follow_up}"
        }


    # 3️⃣ CBT / KNOWLEDGE → RAG
    if intent == "CBT_QUERY":
        index = faiss.read_index("RAG/index.faiss")
        with open("RAG/meta.json") as f:
            meta = json.load(f)

        query_vec = ollama.embed(
            model="nomic-embed-text",
            input=data.message
        )["embeddings"]

        D, I = index.search(np.array([query_vec[0]], dtype="float32"), k=3)

        if D[0][0] > 1.2:
            return {
                "response": (
                    "I’m not fully sure based on what I know right now. "
                    "Could you tell me a bit more?"
                )
            }

        context = "\n\n".join(meta["body_list"][i] for i in I[0])

        genai.configure(api_key=GEMINI_API_KEY)

        prompt = f"""
            You are Solace, a CBT-based support assistant.

            STRICT RULES:
            - Use ONLY information inside <CONTEXT>.
            - Do NOT use general knowledge.
            - Do NOT invent advice.
            - If insufficient, say exactly:
            "I don’t have enough information from my knowledge base to answer that."

            <CONTEXT>
            {context}
            </CONTEXT>

            User question:
            {data.message}
            """

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)

        return {"response": response.text or "I’m not sure based on what I know."}

    # 4️⃣ GENERAL CHAT (NO RAG)
    genai.configure(api_key=GEMINI_API_KEY)

    prompt = GENERIC_PROMPT.format(message=data.message)
    model = genai.GenerativeModel("models/gemini-2.5-flash")
    response = model.generate_content(prompt)

    return {
        "response": response.text or "I’m here with you."
    }
