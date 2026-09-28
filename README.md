```markdown
# 🧠 LLM Study & Career Copilot

A privacy-first, fully local Retrieval-Augmented Generation (RAG) copilot designed to help users interact with their documents. Built with local LLMs, advanced semantic search, and cross-encoder reranking, this tool adapts to the user's context through dynamic "Study," "Exam," and "Career" modes.

## 🚀 Overview
<img width="400" height="396" alt="AI GIF" src="https://github.com/user-attachments/assets/e9ea2bb9-3c21-4c3f-95d2-102b7da4279f" />

Most document chat applications rely on cloud APIs, compromising privacy and incurring costs. This MVP demonstrates a complete, production-ready local AI pipeline. Users can upload multiple PDFs, inject their professional or academic profile for personalized context, and receive real-time streaming answers grounded strictly in the provided documents.

## ✨ Key Features

* **Advanced Local RAG Pipeline:** Combines `MiniLM` embeddings with `FAISS` for rapid vector retrieval, followed by a `CrossEncoder` for precise reranking of chunks.
* **100% Local Generation:** Powered by `Llama 3.2 (3B)` via Ollama, ensuring zero data leakage and offline capability.
* **Multi-PDF Semantic Search:** Search across multiple uploaded documents simultaneously with dynamic context window management.
* **Contextual Personalization:** 
  * **Study Mode:** Breaks down complex concepts step-by-step.
  * **Exam Mode:** Prioritizes concise, factual answers.
  * **Career Mode:** Injects the user's specific background into the system prompt to tailor CV and industry advice.
* **Real-time Streaming & Citations:** Server-Sent Events (SSE) deliver a ChatGPT-like streaming experience, citing exact page numbers and highlighting source chunks.

## 🏗️ Architecture & Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), Axios, React-PDF | Responsive UI handling file uploads, SSE streaming, and PDF rendering. |
| **Backend** | FastAPI, Pydantic | High-performance async API handling requests and state management. |
| **LLM Engine** | Ollama (Llama 3.2 3B) | Local inference for text generation. |
| **Embeddings** | SentenceTransformers | `all-MiniLM-L6-v2` for generating dense vector representations. |
| **Reranking** | CrossEncoder | `ms-marco-MiniLM-L-6-v2` to re-score and sort retrieved chunks for maximum relevance. |
| **Vector DB** | FAISS | In-memory similarity search (FlatIP) optimized for fast retrieval. |

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js & npm
* [Ollama](https://ollama.com/) installed with the `llama3.2:3b` model (`ollama run llama3.2:3b`)

### 1. Backend Setup
Navigate to the `backend` directory and set up your virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

```

Run the FastAPI server:

```bash
uvicorn main:app --reload

```

*The backend will be available at `http://localhost:8000`.*

### 2. Frontend Setup

Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
npm install

```

Start the Vite development server:

```bash
npm run dev

```

*The frontend will be available at `http://localhost:5173`.*

## 💡 Usage

1. **Upload Documents:** Click the upload area to ingest one or multiple PDFs. The backend will automatically extract the text, create overlapping chunks, generate embeddings, and index them in FAISS.
2. **Select Mode:** Choose between Study, Exam, or Career mode.
3. **Personalize (Optional):** If using Career mode, enter your background or goals in the profile text box to contextualize the AI's advice.
4. **Chat:** Ask questions. The system will retrieve the top 20 candidates, rerank them to the top 5, and stream the generation alongside exact document citations.

```

```
