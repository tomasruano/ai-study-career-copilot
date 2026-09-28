import ReactMarkdown from "react-markdown";

export default function MessageBubble({
  role,
  text,
  sources,
  goToPage,
  mode
}) {
  const isUser = role === "user";

  return (
    <div
      className={`
        flex
        ${isUser ? "justify-end" : "justify-start"}
        animate-in
        fade-in
        duration-300
      `}
    >
      <div
        className={`
            w-fit
            max-w-[85%]
            rounded-3xl
            px-5
            py-4
            shadow-xl
            border
            transition
            backdrop-blur-sm
            overflow-hidden
            ${
            isUser
                ? `
                bg-indigo-600
                border-indigo-500
                text-white
                `
                : `
                bg-slate-800/95
                border-slate-700
                text-slate-100
                `
            }
        `}
        >

        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">

          <div className="flex items-center gap-2">

            <div
              className={`
                w-8
                h-8
                rounded-full
                flex
                items-center
                justify-center
                text-sm
                font-bold
                ${
                  isUser
                    ? "bg-indigo-500"
                    : "bg-slate-700"
                }
              `}
            >
              {isUser ? "Y" : "AI"}
            </div>

            <div className="text-sm font-semibold opacity-90">
              {isUser ? "You" : "AI Assistant"}
            </div>

          </div>

          {/* MODE BADGE */}
          {!isUser && mode && (
            <div
              className="
                text-[11px]
                font-semibold
                tracking-wide
                uppercase
                bg-slate-700
                text-slate-300
                px-3
                py-1
                rounded-full
                border
                border-slate-600
              "
            >
              {mode} mode
            </div>
          )}

        </div>

        {/* MESSAGE */}
        <div
            className="
                leading-7
                text-[15px]
                text-slate-100
                whitespace-pre-wrap
            "
            >
          <ReactMarkdown>
            {text}
          </ReactMarkdown>
        </div>

        {/* SOURCES */}
        {sources?.pages && (
          <div className="mt-6 border-t border-slate-700 pt-4">

            <div className="text-xs uppercase tracking-widest text-slate-400 mb-3">
              Sources
            </div>

            {/* PAGE BUTTONS */}
            <div className="flex flex-wrap gap-2">

              {sources.pages.map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className="
                    bg-slate-700
                    hover:bg-slate-600
                    hover:scale-105
                    px-3
                    py-1.5
                    rounded-xl
                    text-sm
                    transition
                    border
                    border-slate-600
                  "
                >
                  📄 Page {p}
                </button>
              ))}

            </div>

            {/* CHUNK PREVIEW */}
            {sources.chunks && (
              <div className="mt-5 space-y-3">

                {sources.chunks.slice(0, 2).map((chunk, idx) => (
                  <div
                    key={idx}
                    className="
                      bg-slate-900/70
                      border
                      border-slate-700
                      rounded-2xl
                      p-4
                      text-sm
                      text-slate-300
                    "
                  >

                    <div className="flex items-center justify-between mb-3">

                      <div className="text-xs text-indigo-400 font-medium">
                        Page {chunk.page}
                      </div>

                      <button
                        onClick={() => goToPage(chunk.page)}
                        className="
                          text-xs
                          text-slate-400
                          hover:text-white
                          transition
                        "
                      >
                        Open page →
                      </button>

                    </div>

                    <div className="line-clamp-4 leading-6">
                      {chunk.text}
                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}