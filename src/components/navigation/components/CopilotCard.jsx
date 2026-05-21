import { Sparkles, Route, Play } from 'lucide-react'
import { confidenceLabel } from '../utils/navigationHelpers'

export default function VisualCopilotCard({ result, onStartRoute, onStartPresentation }) {
  if (!result) return null
  const canRoute = result.routeSuggestion?.type !== 'none' && result.routeSuggestion?.to
  return (
    <div className="mt-3 rounded-2xl border border-sky-500/20 bg-sky-500/[0.06] p-3 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/20 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-sky-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300">AI Compass</p>
          <p className="text-sm text-slate-200 leading-relaxed mt-1">{result.answer}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Unde esti</p>
          <p className="text-xs text-white font-semibold mt-1">{result.detectedLocation?.label || 'Locatie neconfirmata'}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Incredere: {confidenceLabel(result.detectedLocation?.confidence)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Destinatie</p>
          <p className="text-xs text-white font-semibold mt-1">{result.destination?.label || 'Nespecificata'}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {result.routeSuggestion?.type === 'indoor' ? 'Ruta interioara' : result.routeSuggestion?.type === 'outdoor' ? 'Ruta pe harta' : 'Fara ruta'}
          </p>
        </div>
      </div>

      {result.actions?.length > 0 && (
        <div className="space-y-1.5">
          {result.actions.map((action, index) => (
            <div key={index} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-white/[0.07] border border-white/[0.08] text-[10px] text-sky-300 flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <span className="leading-relaxed">{action}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => canRoute && onStartRoute(result.routeSuggestion)}
          disabled={!canRoute}
          className="flex-1 h-10 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 disabled:bg-white/[0.04] border border-sky-400/20 disabled:border-white/[0.06] text-sky-200 disabled:text-slate-600 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Route size={14} />
          Ghidează-mă
        </button>
        {canRoute && (
          <button
            onClick={() => onStartPresentation?.(result)}
            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25"
          >
            <Play size={13} fill="white" />
            Start Prezentare
          </button>
        )}
      </div>
    </div>
  )
}
