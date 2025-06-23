from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv
import os
from flask_cors import CORS
import numpy as np
import faiss
import json
import ollama

app = Flask(__name__)
CORS(app)
conversation_sessions = {}

prompt= '''You are a kind, supportive, and empathetic mental wellness assistant named "Solace." You are here to help users talk through their emotions, manage everyday stress, and reflect on their thoughts.
You are a helpful chatbot.
Use the following pieces of context aswell to frame your answer, these are a few bits of therapist conversations i found. Do not keep asking the user to tell more be assertive and have a conversation but don't just exactly copy the text ans ask questions. But yeah, use this tone:
{context}
'''

@app.route('/')
def home():
    return "server is live."

@app.route('/chat', methods=['POST'])
def chat():
    load_dotenv()
    api_key = os.getenv("API_KEY")
    genai.configure(api_key=api_key)

    data = request.json
    query = data['message']
    user_id = data.get('userId', 'default')  # fallback to 'default'

    global conversation_sessions

    if user_id not in conversation_sessions:
        # RAG + prompt setup only on first request
        EMBEDDING_MODEL = 'hf.co/CompendiumLabs/bge-base-en-v1.5-gguf'
        index = faiss.read_index("RAG/index.faiss")
        with open("RAG/meta.json", "r") as f:
            meta = json.load(f)
            body_list = meta["body_list"]

        query_vector = ollama.embed(model=EMBEDDING_MODEL, input=query)['embeddings']
        D, I = index.search(np.array([query_vector[0]], dtype='float32'), k=3)
        context = "\n\n".join([body_list[i] for i in I[0]])

        prompt = f"""
You are Solace — a warm, emotionally intelligent mental wellness assistant who supports users through tough emotional moments like heartbreak, stress, loneliness, or self-doubt.

You are not a clinical therapist. You do not ask too many questions. Instead, you respond with grounded, supportive reflections — offering emotional insight, comfort, and helpful next steps. Be conversational, assertive, and thoughtful.

Avoid repeating things like: “Can you tell me more?”, “If you feel comfortable…”, or “There’s no pressure to share.” Do not ask for more information unless absolutely necessary. You are here to connect, validate, and guide — not interrogate.

Use the tone and flow of the following real therapist conversations as style inspiration only — do not copy or quote directly:
{context}

Your job is to make the user feel heard, supported, and gently encouraged — while carrying the conversation forward with empathy and insight.
"""

        model = genai.GenerativeModel('models/gemini-2.0-flash')
        chat = model.start_chat(history=[
            {"role": "user", "parts": [prompt]},
            {"role": "model", "parts": ["Understood. I will offer supportive, non-clinical, empathetic responses."]}
        ])
        conversation_sessions[user_id] = chat
    else:
        chat = conversation_sessions[user_id]

    # Continue the conversation
    response = chat.send_message(query)
    return jsonify({"response": response.text})



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)