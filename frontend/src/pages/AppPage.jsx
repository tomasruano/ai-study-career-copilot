import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { pdfjs } from "react-pdf";

import PdfViewer from "../components/PdfViewer";
import MessageBubble from "../components/MessageBubble";
import ChatSidebar from "../components/ChatSidebar";
import Topbar from "../components/Topbar";
import UploadBox from "../components/UploadBox";
import ModeSelector from "../components/ModeSelector";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function AppPage() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [docIds, setDocIds] = useState([]);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPage, setSelectedPage] = useState(1);
  

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("study");
  const messagesEndRef = useRef(null);
  const [userProfile, setUserProfile] = useState("");

  // =========================
  // AUTO SCROLL CHAT
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // =========================
  // UPLOAD PDF
  // =========================
  const uploadPDF = async () => {
    if (!file) return alert("Choose a file first");

    setUploadStatus("Uploading PDF...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );

      setDocIds((prev) => [
        ...prev,
        res.data.doc_id
      ]);

      setPdfFiles((prev) => [
        ...prev,
        {
          name: file.name,
          file: file,
          docId: res.data.doc_id
        }
      ]);

      setUploadStatus("✅ PDF uploaded successfully!");
    } catch (err) {
      setUploadStatus("❌ Upload failed");
      console.error(err);
    }
  };

  // =========================
  // ASK QUESTION (STREAMING)
  // =========================
  const askQuestion = () => {
    console.log("ASK QUESTION EJECUTADO");

    if (!question || docIds.length === 0) return;

    const userQuestion = question;
    const activeDocId = docIds[docIds.length - 1];

    if (!activeDocId) return;

    setQuestion("");
    setLoading(true);

    // IDs estables
    const aiMessageId = Date.now();

    // USER + EMPTY AI MESSAGE
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userQuestion
      },
      {
        id: aiMessageId,
        role: "ai",
        text: "",
        sources: null,
        mode: mode
      }
    ]);

    // Send all uploaded PDFs and the user profile
    const docsParam = docIds.join(",");
    
    const url = `http://127.0.0.1:8000/ask-stream?question=${encodeURIComponent(
      userQuestion
    )}&doc_ids=${encodeURIComponent(
      docsParam
    )}&mode=${encodeURIComponent(
      mode
    )}&profile=${encodeURIComponent(userProfile)}`;

    const eventSource = new EventSource(url);

    let fullText = "";

    // =========================
    // STREAM TOKENS
    // =========================
    eventSource.addEventListener("token", (event) => {
      const token = JSON.parse(event.data);

      fullText += token;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: fullText
              }
            : msg
        )
      );
    });

    // =========================
    // SOURCES
    // =========================
    eventSource.addEventListener("sources", (event) => {
      const sourcesData = JSON.parse(event.data);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                sources: sourcesData
              }
            : msg
        )
      );
    });

    // =========================
    // DONE
    // =========================
    eventSource.addEventListener("done", () => {
      setLoading(false);
      eventSource.close();
    });

    // =========================
    // ERROR
    // =========================
    eventSource.onerror = () => {
      console.error("Streaming error");

      setLoading(false);
      eventSource.close();
    };
  };

  // =========================
  // PDF NAVIGATION
  // =========================
  const goToPage = (p) => {
    setSelectedPage(Math.max(1, p));
  };

  // =========================
  // UI
  // =========================
return (
  <div className="flex h-screen bg-slate-900 text-white overflow-hidden">

    {/* SIDEBAR */}
    <ChatSidebar />

    {/* MAIN */}
    <div className="flex-1 flex">

      {/* CHAT SECTION */}
      <div className="w-1/2 flex flex-col border-r border-slate-800">
      
        {/* TOPBAR */}
        <Topbar />

        {/* CHAT CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* UPLOAD */}
          <UploadBox
            uploadPDF={uploadPDF}
            setFile={setFile}
            uploadStatus={uploadStatus}
          />

          {/* MODE SELECTOR */}
          <ModeSelector
            mode={mode}
            setMode={setMode}
          />
          {/* USER PROFILE SECTION */}
          {mode === "career" && (
            <div className="mt-4 mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                User Career Profile (AI Context)
              </label>
              <textarea
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 resize-none"
                rows={3}
                value={userProfile}
                onChange={(e) => setUserProfile(e.target.value)}
                placeholder="Enter your background, degree, or goals..."
              />
            </div>
          )}
          {/* EMPTY STATE */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-24">

              <div className="text-6xl mb-6">
                🤖
              </div>

              <h2 className="text-4xl font-bold mb-4">
                Chat with your PDF
              </h2>

              <p className="text-slate-400 max-w-lg leading-relaxed">
                Upload documents and ask questions using
                AI-powered semantic search, RAG pipelines,
                and real-time streaming responses.
              </p>

            </div>
          )}

          {/* MESSAGES */}
          <div className="space-y-6 mt-6">

            {messages.map((m, i) => (
              <MessageBubble
                key={m.id || i}
                role={m.role}
                text={m.text}
                sources={m.sources}
                goToPage={goToPage}
                mode={mode}
              />
            ))}

            {/* THINKING */}
            {loading && (
              <div className="flex items-center gap-3 text-slate-400 animate-pulse">

                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />

                <span className="ml-2 text-sm">
                  AI is thinking...
                </span>

              </div>
            )}

            {/* AUTO SCROLL */}
            <div ref={messagesEndRef} />

          </div>
        </div>

        {/* INPUT AREA */}
        <div className="border-t border-slate-800 bg-slate-950 p-5">

          <div className="flex gap-3 items-end">

            {/* INPUT */}
            <textarea
              rows={1}
              value={question}
              disabled={loading}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {

                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {

                  e.preventDefault();

                  if (!loading) {
                    askQuestion();
                  }
                }
              }}
              placeholder="Ask your document..."
              className="
                flex-1
                resize-none
                bg-slate-800
                border
                border-slate-700
                rounded-2xl
                px-5
                py-4
                outline-none
                focus:border-indigo-500
                transition
                text-white
                placeholder:text-slate-500
                disabled:opacity-50
              "
            />

            {/* BUTTON */}
            <button
              onClick={askQuestion}
              disabled={loading}
              className="
                bg-indigo-600
                hover:bg-indigo-500
                disabled:bg-slate-700
                disabled:cursor-not-allowed
                px-6
                py-4
                rounded-2xl
                font-medium
                transition
                shadow-lg
              "
            >
              {loading ? "Thinking..." : "Ask"}
            </button>

          </div>

          {/* FOOTER */}
          <div className="mt-3 text-xs text-slate-500">
            Press Enter to send • Shift + Enter for new line
          </div>

        </div>
      </div>

      {/* PDF VIEWER */}
      <PdfViewer
        pdfFile={pdfFiles[0]?.file}
        selectedPage={selectedPage}
      />

    </div>
  </div>
);
}