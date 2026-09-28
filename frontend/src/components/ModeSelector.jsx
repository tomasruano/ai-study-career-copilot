export default function ModeSelector({
  mode,
  setMode
}) {
  const modes = [
    {
      id: "study",
      label: "Study",
      icon: "📚",
      description: "Learn concepts step-by-step"
    },
    {
      id: "exam",
      label: "Exam",
      icon: "📝",
      description: "Concise exam-ready answers"
    },
    {
      id: "career",
      label: "Career",
      icon: "💼",
      description: "Resume & job analysis"
    }
  ];

  return (
    <div className="mb-6">

      <div className="text-sm text-slate-400 mb-3">
        Assistant Mode
      </div>

      <div className="grid grid-cols-3 gap-3">

        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`
              p-4
              rounded-2xl
              border
              text-left
              transition
              ${
                mode === m.id
                  ? "bg-indigo-600 border-indigo-500"
                  : "bg-slate-800 border-slate-700 hover:border-slate-500"
              }
            `}
          >

            <div className="text-2xl mb-2">
              {m.icon}
            </div>

            <div className="font-semibold mb-1">
              {m.label}
            </div>

            <div className="text-xs text-slate-300 leading-relaxed">
              {m.description}
            </div>

          </button>
        ))}

      </div>
    </div>
  );
}