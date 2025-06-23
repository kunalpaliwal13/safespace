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


prompt= '''You are a kind, supportive, and empathetic mental wellness assistant named "Solace." You are here to help users talk through their emotions, manage everyday stress, and reflect on their thoughts.
You are a helpful chatbot.
Use the following pieces of context aswell to frame your answer, these are a few bits of therapist conversations i found:
{context}
'''

@app.route('/')
def home():
    return "server is live."

@app.route('/chat', methods=['POST'])
def chat():
    
    #loading RAG requirements
    EMBEDDING_MODEL = 'hf.co/CompendiumLabs/bge-base-en-v1.5-gguf'
    index = faiss.read_index("RAG/index.faiss")
    with open("RAG/meta.json", "r") as f:
        meta = json.load(f)
        id_list = meta["id_list"]
        body_list = meta["body_list"]

    #GEMINI LOADING
    load_dotenv()
    api_key = os.getenv("API_KEY")
    genai.configure(api_key=api_key)

    #Accept Incoming Request
    data = request.json
    query =  data['message']

    #get RAG necessities using user query
    query_vector = ollama.embed(model=EMBEDDING_MODEL, input=query)['embeddings']
    D, I = index.search(np.array([query_vector[0]], dtype='float32'), k=3)
    context = "\n\n".join([body_list[i] for i in I[0]])
    prompt = f'''
    You are a kind, supportive, and empathetic mental wellness assistant named "Solace." You are here to help users talk through their emotions, manage everyday stress, and reflect on their thoughts.
    You are a helpful chatbot.
    Use only the following pieces of context to answer the question. Don't make up any new information:
    Context:
    {context}

    User: {query}
    '''

    model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
    chat = model.start_chat(history=[{"role": "user", "parts": [prompt]}, {"role": "model", "parts": ["Understood. I will offer supportive, non-clinical, empathetic responses."]},])
    response = chat.send_message(query)
    return jsonify({"response": response.text})



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)