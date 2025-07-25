from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import faiss
import numpy as np
import torch
from dotenv import load_dotenv
import google.generativeai as genai
from transformers import AutoTokenizer, AutoModel
import uuid
from Data_Logging.logger import log_interaction 


# Load environment variables
load_dotenv()
api_key = os.getenv("API_KEY")
genai.configure(api_key=api_key)

app = Flask(__name__)
ALLOWED_ORIGINS = [
    "https://safespacefrontend.vercel.app",
    "https://safespacefrontend.vercel.app/chatbot",
    "https://safespace-amber.vercel.app"
    "https://safespace-amber.vercel.app/chatbot"
]

# CORS configuration
CORS(app, resources={
    r"/chat": {
        "origins": "*",
        "supports_credentials": True,
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load embedding model once
tokenizer = AutoTokenizer.from_pretrained("BAAI/bge-base-en-v1.5")
embed_model = AutoModel.from_pretrained("BAAI/bge-base-en-v1.5")

# Load FAISS index and metadata once
index = faiss.read_index("RAG/index.faiss")
with open("RAG/meta.json", "r") as f:
    meta = json.load(f)
    body_list = meta["body_list"]

# In-memory user session store
conversation_sessions = {}


def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        embeddings = embed_model(**inputs).last_hidden_state.mean(dim=1)
    return embeddings[0].numpy().reshape(1, -1).astype('float32')

@app.route('/')
def home():
    return "server is live."

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    # Get the origin from the request
    origin = request.headers.get('Origin')
    
    # Check if it's in our allowed list
    allowed_origins = [
        "https://safespacefrontend.vercel.app",
        "https://safespace-amber.vercel.app"
    ]
    
    # Create response object early so we can add headers consistently
    response_headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Credentials": "true"
    }

    if request.method == 'OPTIONS':
        if origin in allowed_origins:
            response = jsonify({"status": "preflight"})
            response.headers.add("Access-Control-Allow-Origin", origin)
            for k, v in response_headers.items():
                response.headers.add(k, v)
            return response
        else:
            return jsonify({"error": "Origin not allowed"}), 403

    # Handle POST request
    data = request.json
    query = data['message']
    user_id = data.get('userId', 'default')

    global conversation_sessions

    if user_id not in conversation_sessions:
        query_vector = get_embedding(query)
        D, I = index.search(query_vector, k=3)
        context = "\n\n".join([body_list[i] for i in I[0]])
        session_id = str(uuid.uuid4())

        prompt = f"""
You are Solace — a warm, emotionally intelligent mental wellness assistant who supports users through tough emotional moments like heartbreak, stress, loneliness, or self-doubt.

You are not a clinical therapist. You do not ask too many questions. Instead, you respond with grounded, supportive reflections — offering emotional insight, comfort, and helpful next steps. Be conversational, assertive, and thoughtful.

Avoid repeating things like: "Can you tell me more?", "If you feel comfortable…", or "There's no pressure to share." Do not ask for more information unless absolutely necessary. You are here to connect, validate, and guide — not interrogate.

Use the tone and flow of the following real therapist conversations as style inspiration only — do not copy or quote directly:
{context}

Your job is to make the user feel heard, supported, and gently encouraged — while carrying the conversation forward with empathy and insight.
"""

        model = genai.GenerativeModel('models/gemini-2.0-flash')
        chat = model.start_chat(history=[
            {"role": "user", "parts": [prompt]},
            {"role": "model", "parts": ["Understood. I will offer supportive, non-clinical, empathetic responses."]}
        ])
        conversation_sessions[user_id] = {
            "session_id": session_id,
            "chat": chat
        }
    else:
        chat = conversation_sessions[user_id]["chat"]
        session_id = conversation_sessions[user_id]["session_id"]

    response = chat.send_message(query)
    context_passages = [body_list[i] for i in I[0]] if user_id not in conversation_sessions else None
    log_interaction(user_id, session_id, query, response.text, context_passages)
    
    res = jsonify({"response": response.text})
    
    # Add CORS headers to the main response too
    if origin in allowed_origins:
        res.headers.add("Access-Control-Allow-Origin", origin)
    for k, v in response_headers.items():
        res.headers.add(k, v)
    
    return res

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)  # 0.0.0.0 allows external access in prod