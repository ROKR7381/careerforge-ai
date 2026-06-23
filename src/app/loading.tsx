import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mx-auto h-16 w-16 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 opacity-30 blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-300/50">
            <Sparkles className="h-7 w-7 text-white animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          Loading your experience…
        </p>
        <div className="mt-4 mx-auto h-1 w-48 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 skeleton" />
        </div>
      </div>
    </div>
  );
}
