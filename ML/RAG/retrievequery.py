import ollama 
import numpy as np
import faiss
import pickle
from mistralai.client import Mistral
import os
from dotenv import load_dotenv

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

        Guidelines:
        - Use the provided context as supporting knowledge, not as the main response.
        - Do NOT copy or directly repeat sentences from the context.
        - Blend relevant ideas naturally into your response in your own words.
        - Prioritize the user's message over the context. The response should feel personal, not generic.

        Tone:
        - Be empathetic, calm, and human-like.
        - Avoid repetitive phrases like "I understand how you feel".
        - Do not sound robotic or overly formal.

        Content:
        - Give practical, actionable, and specific suggestions when appropriate.
        - Avoid overly generic advice (e.g., "stay positive", "everything will be okay").
        - If context is not relevant, ignore it.

        Structure:
        - First: Acknowledge the user's feeling in a natural way (not templated).
        - Second: Reflect or reframe their situation briefly.
        - Third: Provide helpful insight or suggestions (optionally supported by context).
        - Optional: Ask a gentle follow-up question if it helps continue the conversation.

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
    print(res.choices[0].message.content)
    

    # index, all_chunks = load_vector_store(index_path="../RAG/faiss_index.bin", chunks_path="chunks.pkl")

    # query = "Why do I feel lonely even around people?"
    # results = retrieve(query, index, all_chunks)

    # print("\n🔍 Top results:\n")
    # for r in results:
        # print("-", r[:500], "\n\n\n")

    # generate_response(query, all_chunks)
