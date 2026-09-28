export default function ChatSidebar() {
  return (
    <div className="w-[260px] bg-slate-950 border-r border-slate-800 p-4 flex flex-col">

      <div className="text-2xl font-bold mb-8">
        AI Copilot
      </div>

      <button className="bg-indigo-600 hover:bg-indigo-500 transition rounded-xl py-3 mb-6">
        + New Chat
      </button>

      <div className="text-slate-400 text-sm mb-3">
        Recent Chats
      </div>

      <div className="space-y-2">
        <div className="bg-slate-900 rounded-lg p-3 cursor-pointer hover:bg-slate-800">
          Marketing Notes
        </div>

        <div className="bg-slate-900 rounded-lg p-3 cursor-pointer hover:bg-slate-800">
          AI Exam Prep
        </div>
      </div>
    </div>
  );
}