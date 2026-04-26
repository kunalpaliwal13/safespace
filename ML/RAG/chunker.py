import numpy as np
import faiss
import ollama


def split_documents(text):
    docs = text.split("--- SOURCE:")
    return [doc.strip() for doc in docs if doc.strip()]

def chunk_text(doc, chunk_size=3):
    paragraphs = doc.split("\n\n")
    chunks = []

    for i in range(0, len(paragraphs), chunk_size):
        chunk = " ".join(paragraphs[i:i+chunk_size])
        chunks.append(chunk)

    return chunks

def load_data(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    return text

def embed_chunks(chunks):
    embeddings = []

    for chunk in chunks:
        response = ollama.embeddings(
            model="nomic-embed-text",
            prompt=chunk
        )
        print(response)
        embeddings.append(response["embedding"])

    return embeddings

def store_faiss(embeddings):
    dim = len(embeddings[0])
    index = faiss.IndexFlatL2(dim)

    vectors = np.array(embeddings).astype("float32")
    index.add(vectors)

    return index

if __name__ == "__main__":

    print("📥 Loading data...")
    text = load_data("../fake data/scraped_data.txt")

    print("📄 Splitting documents...")
    docs = split_documents(text)

    print("✂️ Chunking...")
    all_chunks = []
    for doc in docs:
        chunks = chunk_text(doc)
        all_chunks.extend(chunks)

    print(f"✅ Total chunks before cleaning: {len(all_chunks)}")

    # 🔥 Clean chunks (VERY important)
    all_chunks = list(set(all_chunks))  # remove duplicates
    all_chunks = [c for c in all_chunks if len(c) > 100]

    print(f"✅ Total chunks after cleaning: {len(all_chunks)}")

    print("🧠 Generating embeddings...")
    embeddings = embed_chunks(all_chunks)

    print("📦 Storing in FAISS...")
    index = store_faiss(embeddings)

    import pickle

# Save index
    faiss.write_index(index, "faiss_index.bin")

# Save chunks (needed for retrieval)
    with open("chunks.pkl", "wb") as f:
        pickle.dump(all_chunks, f)

    print("💾 Saved index and chunks!")

    print("🎉 Pipeline complete!")