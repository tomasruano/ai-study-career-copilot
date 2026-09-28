import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      <Hero />
      <DemoSection />
      <HowItWorks />
      <Features />
      <TechStack />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Chat with your documents using AI</h1>

        <p>
          Upload PDFs and ask questions in natural language.
          Built with Retrieval-Augmented Generation (RAG).
        </p>

        <Link to="/app">
          <button className="primary">Try the demo</button>
        </Link>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section className="demo">
      <h2>See it in action</h2>
      <div className="demo-box">
        <p>Upload a PDF → Ask questions → Get answers with sources</p>
        <div className="placeholder-video">Demo GIF / Video here</div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="how">
      <h2>How it works</h2>
      <div className="steps">
        <div>1️⃣ Upload PDF</div>
        <div>2️⃣ Text is chunked & embedded</div>
        <div>3️⃣ Relevant chunks retrieved</div>
        <div>4️⃣ LLM generates grounded answer</div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="features">
      <h2>Key Features</h2>
      <ul>
        <li>Semantic search over documents</li>
        <li>Answers grounded in sources</li>
        <li>Clickable citations & document viewer</li>
        <li>Streaming responses</li>
        <li>Production-ready backend</li>
      </ul>
    </section>
  );
}

function TechStack() {
  return (
    <section className="stack">
      <h2>Tech Stack</h2>
      <div className="stack-grid">
        <span>React</span>
        <span>FastAPI</span>
        <span>Llama 3.2 (Local via Ollama)</span>
        <span>FAISS Vector Database</span>
        <span>CrossEncoder Reranking</span>
        <span>MiniLM Embeddings</span>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta">
      <h2>Try the app</h2>
      <Link to="/app">
        <button className="primary">Open Demo</button>
      </Link>
    </section>
  );
}