export default function Topbar() {
  return (
    <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950">

      <div>
        <h1 className="text-xl font-semibold">
          AI PDF Copilot
        </h1>

        <p className="text-sm text-slate-400">
          LLM-powered document assistant
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-green-500" />

        <span className="text-sm text-slate-400">
          Online
        </span>
      </div>
    </div>
  );
}