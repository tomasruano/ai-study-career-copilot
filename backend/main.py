import token
from fastapi import FastAPI, UploadFile, File, Body, Query
from pypdf import PdfReader
import uuid
from dotenv import load_dotenv
import os
import numpy as np
import faiss
import random
import requests
from pydantic import BaseModel
from io import BytesIO
from sentence_transformers import SentenceTransformer, CrossEncoder
from fastapi.middleware.cors import CORSMiddleware
import pickle
from fastapi.responses import StreamingResponse
import json


class AskRequest(BaseModel):
    question: str
    doc_ids: list[str] 
    mode: str = "study"
    user_profile: str | None = ""

load_dotenv()
app = FastAPI()

app = FastAPI()
documents = {}

# Rutas del vector store
VECTOR_INDEX_PATH = "vector_store/index.faiss"
CHUNKS_PATH = "vector_store/chunks.pkl"

# Un índice FAISS por documento
indexes = {}      # doc_id -> faiss index
doc_chunks = {}   # doc_id -> lista de chunks
chat_memory = {}   # doc_id -> lista de mensajes

model = SentenceTransformer("all-MiniLM-L6-v2")

from sentence_transformers import CrossEncoder

print("Loading reranker model...")
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
print("Reranker loaded")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def create_chunk(text: str, doc_id: str):
    return {
        "id": str(uuid.uuid4()),
        "text": text,
        "doc_id": doc_id
    }

def save_vector_store():
    faiss.write_index(index, VECTOR_INDEX_PATH)
    with open(CHUNKS_PATH, "wb") as f:
        pickle.dump(chunks_store, f)

def load_vector_store():
    global index, chunks_store

    if os.path.exists(VECTOR_INDEX_PATH):
        index = faiss.read_index(VECTOR_INDEX_PATH)

    if os.path.exists(CHUNKS_PATH):
        with open(CHUNKS_PATH, "rb") as f:
            chunks_store = pickle.load(f)
load_vector_store()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== EMBEDDINGS =====
def embed_text(texts):
    embeddings = model.encode(texts)
    return np.array(embeddings).astype("float32")

# ===== VECTOR SEARCH =====
def search_multiple_chunks(question: str, doc_ids: list[str], k: int = 5):
    all_candidates = []
    
    # 1. Embedding Search
    q_emb = model.encode(question, normalize_embeddings=True)
    q_emb = np.array([q_emb]).astype("float32")

    # Iterate over all active PDFs
    for doc_id in doc_ids:
        if doc_id in indexes:
            index = indexes[doc_id]
            chunks = doc_chunks[doc_id]
            
            distances, indices = index.search(q_emb, 10) 
            
            for i in indices[0]:
                if i != -1 and i < len(chunks):
                    all_candidates.append(chunks[i])

    if not all_candidates:
        return []

    # 2. Global Reranking
    pairs = [(question, chunk["text"]) for chunk in all_candidates]
    scores = reranker.predict(pairs)
    
    scored_chunks = list(zip(scores, all_candidates))
    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    # 3. Final Top-K
    return [chunk for _, chunk in scored_chunks[:k]]

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Copilot backend running"}

@app.get("/debug-chunks")
def debug_chunks():
    return {
        "chunks_count": len(chunks_store),
        "index_ready": index is not None
    }
def extract_text_from_pdf(file_bytes: bytes):
    pdf_stream = BytesIO(file_bytes)   # ← convertimos bytes a file-like object
    reader = PdfReader(pdf_stream)

    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text() + "\n"

    return text
def split_text_into_chunks(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks
@app.post("/upload")
def upload_pdf(file: UploadFile = File(...)):

    doc_id = str(uuid.uuid4())

    pdf = PdfReader(file.file)

    text = ""
    for page in pdf.pages:
        if page.extract_text():
            text += page.extract_text()

    chunk_size = 500
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

    stored_chunks = []
    embeddings = []

    for page_number, page in enumerate(pdf.pages):
        page_text = page.extract_text()
        
        if not page_text:
            continue

        page_chunks = split_text_into_chunks(page_text)

        for chunk in page_chunks:
            emb = model.encode(chunk, normalize_embeddings=True)
            embeddings.append(emb)

            stored_chunks.append({
                "id": str(uuid.uuid4()),
                "text": chunk,
                "page": page_number + 1   # 🔥 CLAVE
            })

    embeddings = np.array(embeddings).astype("float32")

    # Crear índice FAISS SOLO para este documento
    index = faiss.IndexFlatIP(384)
    index.add(embeddings)

    # Guardar en memoria por doc
    indexes[doc_id] = index
    doc_chunks[doc_id] = stored_chunks
    chat_memory[doc_id] = []

    return {
        "doc_id": doc_id,
        "chunks_created": len(chunks)
    }
def build_chat_history(doc_id, max_turns=3):
    history = chat_memory.get(doc_id, [])
    
    if not history:
        return ""

    # Tomamos últimos N intercambios
    recent = history[-max_turns:]

    formatted = ""
    for turn in recent:
        formatted += f"User: {turn['question']}\n"
        formatted += f"Assistant: {turn['answer']}\n\n"

    return formatted
def chunk_text(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
        
    return chunks

def ask_llama(prompt):

    

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2:3b",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    print(data)  # DEBUG

    return data.get("response", "No response from model.")
def build_prompt(mode, context, question, history, user_profile=""):
    base_rules = """
Rules:
- Answer ONLY using the document context, unless providing career advice based on the profile.
- If the answer is not in the document, say it clearly.
- Never hallucinate.
"""
    profile_context = f"User Profile Background: {user_profile}\n" if user_profile else ""

    if mode == "study":
        system_style = "You are an expert study assistant. Explain concepts clearly and teach step by step."
    elif mode == "exam":
        system_style = "You are an exam preparation assistant. Answer directly and prioritize concise explanations."
    elif mode == "career":
        system_style = f"""
You are a professional career assistant.
Your job: analyze resumes, suggest missing skills, and provide actionable advice.
{profile_context}
Tailor all career advice to fit the user's specific background and goals.
"""
    else:
        system_style = "You are a helpful AI assistant."

    return f"""
{system_style}

Conversation history:
{history}

Document context:
{context}

Current question:
{question}

{base_rules}
"""
@app.get("/ask-stream")
def ask_stream(
    question: str,
    doc_ids: str,
    mode: str = "study",
    profile: str | None = None
):
    doc_id_list = [d.strip() for d in doc_ids.split(",") if d.strip()]
    active_doc_id = doc_id_list[-1] if doc_id_list else "default_session"

    history = build_chat_history(active_doc_id)

    # Use the new multi-PDF search
    relevant_chunks = search_multiple_chunks(question, doc_id_list)

    context = "\n\n".join([c["text"] for c in relevant_chunks])
    sources = sorted(list({c["page"] for c in relevant_chunks}))

    def generator():
        full_answer = ""
        
        if not context:
            yield ("event: error\ndata: No relevant context found\n\n")
            yield ("event: done\ndata: {}\n\n")
            return

        # Pass the profile to the prompt builder
        prompt = build_prompt(mode, context, question, history, profile)
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2:3b",
                "prompt": prompt,
                "stream": True
            },
            stream=True
        )

        for line in response.iter_lines():

            if line:

                data = json.loads(
                    line.decode("utf-8")
                )

                token = data.get(
                    "response",
                    ""
                )

                full_answer += token

                # Enviar token como JSON válido
                yield (
                    "event: token\n"
                    f"data: {json.dumps(token, ensure_ascii=False)}\n\n"
                )

        # SOURCES
        yield (
            "event: sources\n"
            f"data: {json.dumps({
                'pages': sources,
                'chunks': [
                    {
                        'page': c['page'],
                        'text': c['text'][:200],
                        'chunk_id': c['id']
                    }
                    for c in relevant_chunks
                ]
            }, ensure_ascii=False)}\n\n"
        )

        # DONE
        yield (
            "event: done\n"
            f"data: {json.dumps({'ok': True})}\n\n"
        )

        # Initialize the list if it doesn't exist (safety check)
        if active_doc_id not in chat_memory:
            chat_memory[active_doc_id] = []

        # Save history using the correct active document ID
        chat_memory[active_doc_id].append({
            "question": question,
            "answer": full_answer
        })

    return StreamingResponse(
        generator(),
        media_type="text/event-stream"
    )
    
@app.post("/ask")
def ask(req: AskRequest):

    question = req.question
    doc_id = req.doc_id

    history = build_chat_history(doc_id)

    relevant_chunks = search_similar_chunks(question, doc_id)
    context = "\n\n".join([chunk["text"] for chunk in relevant_chunks])

    sources = list(set([chunk["page"] for chunk in relevant_chunks]))
    sources.sort()

    if not context:
        answer = "No relevant context found in the document."
    else:
        prompt = build_prompt(
            "study",
            context,
            question,
            history
        )

        answer = ask_llama(prompt)

    chat_memory[doc_id].append({
        "question": question,
        "answer": answer
    })

    return {
        "answer": answer,
        "sources": sources,
        "chunks": [
            {
                "page": c["page"],
                "text": c["text"][:200],
                "chunk_id": c["id"]
            }
            for c in relevant_chunks
        ]
    }