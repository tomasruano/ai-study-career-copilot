# 🧠 AI Study & Career Copilot

<img width="400" height="396" alt="AI GIF" src="https://github.com/user-attachments/assets/e9ea2bb9-3c21-4c3f-95d2-102b7da4279f" />

A local AI assistant that lets users interact with their academic and professional documents using **Retrieval-Augmented Generation (RAG)**.

The application combines semantic search, vector retrieval, cross-encoder reranking, and a local LLM to generate answers grounded in the user's uploaded documents.

> **Privacy-first:** documents and AI inference remain local through Ollama.

## 🚀 What it does

Users can:

* Upload one or multiple PDF documents
* Search across their documents using natural language
* Receive answers grounded in the uploaded content
* See the document pages used to generate each answer
* Stream responses in real time
* Personalize the assistant according to the selected mode

### 🧠 Three interaction modes

**Study Mode**
Provides step-by-step explanations focused on understanding concepts.

**Exam Mode**
Prioritizes concise and factual answers based on the available documents.

**Career Mode**
Uses the user's academic or professional background to provide more contextualized responses.

## 🏗️ RAG Pipeline

The application follows this retrieval and generation flow:

```text
PDF Upload
    ↓
Text Extraction
    ↓
Chunking
    ↓
SentenceTransformer Embeddings
    ↓
FAISS Vector Search
    ↓
Top 20 Retrieved Chunks
    ↓
CrossEncoder Reranking
    ↓
Top 5 Relevant Chunks
    ↓
Llama 3.2 3B
    ↓
Streaming Response + Citations
```

This approach separates **retrieval** from **generation**, allowing the model to answer using relevant information from the uploaded documents instead of relying only on its internal knowledge.

## 🛠️ Tech Stack

| Layer         | Technology                                |
| ------------- | ----------------------------------------- |
| Frontend      | React, Vite, Axios, React-PDF             |
| Backend       | FastAPI, Pydantic                         |
| LLM           | Llama 3.2 3B via Ollama                   |
| Embeddings    | SentenceTransformers (`all-MiniLM-L6-v2`) |
| Reranking     | CrossEncoder (`ms-marco-MiniLM-L-6-v2`)   |
| Vector Search | FAISS                                     |
| Communication | REST API + Server-Sent Events (SSE)       |

## 🔎 Retrieval Strategy

Instead of sending every document chunk directly to the LLM, the system uses a two-stage retrieval process:

1. **Vector retrieval** with FAISS identifies the top 20 semantically similar chunks.
2. **CrossEncoder reranking** evaluates those candidates and selects the top 5 most relevant chunks.
3. The selected context is provided to the local LLM.
4. The generated response is streamed back to the frontend together with document citations.

This reduces the amount of irrelevant context sent to the model and improves the relevance of retrieved information.

## 🔐 Local & Privacy-Focused

The application is designed to run locally:

* PDF processing runs locally.
* Embeddings are generated locally.
* Vector search runs locally.
* LLM inference runs locally through Ollama.
* No external LLM API is required.

This makes the project useful for documents that users may not want to send to third-party AI services.

## ⚙️ Installation

### Prerequisites

* Python 3.10+
* Node.js + npm
* Ollama
* `llama3.2:3b` model

Install and run the model:

```bash
ollama run llama3.2:3b
```

### 1. Backend

```bash
cd backend

python -m venv venv
```

Activate the environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 💡 Example Workflow

1. Upload one or more PDFs.
2. The backend extracts and chunks the document text.
3. Embeddings are generated and indexed in FAISS.
4. The user asks a question.
5. FAISS retrieves the most relevant chunks.
6. The CrossEncoder reranks the retrieved candidates.
7. The top 5 chunks are passed to Llama 3.2.
8. The answer is streamed to the frontend with document citations.

## 📚 What I Practiced

This project allowed me to work with:

* Retrieval-Augmented Generation (RAG)
* Semantic search
* Vector databases / similarity search
* Embeddings
* Cross-encoder reranking
* Local LLM inference
* Prompt design
* FastAPI backend development
* React frontend development
* Server-Sent Events (SSE)
* PDF processing
* API integration
* Git/GitHub

## 🎯 Project Goal

The project was built to explore how **local AI systems can combine document retrieval and LLM generation** while maintaining control over user data.

It also served as a practical project for learning how to integrate an AI pipeline into a full-stack application.
