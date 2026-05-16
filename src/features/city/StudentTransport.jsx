import { useState } from 'react'
import { ChevronLeft, Bus, Clock, MapPin, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { transportLines } from '../../shared/data/cityData'

export default function StudentTransport({ onBack }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">Transport CTP Iași</h2>
          <p className="text-xs text-slate-500">Linii utile pentru studenți</p>
        </div>
      </div>

      {/* Student pass info card */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25">
        <CreditCard size={18} className="text-indigo-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-indigo-300">Abonament Student</p>
          <p className="text-xs text-indigo-400/80 mt-0.5">
            50% reducere față de prețul normal. Necesită carnet de student vizat + adeverință.
            Disponibil la casele CTP din centru.
          </p>
        </div>
      </div>

      {/* Lines */}
      <div className="space-y-2">
        {transportLines.map((line, i) => {
          const isExp = expanded === i
          return (
            <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/50 overflow-hidden">
              <button
                onClick={() => setExpanded(isExp ? null : i)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/80 transition-colors"
              >
                {/* Line badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                  style={{ background: line.color }}
                >
                  {line.line}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{line.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={9} /> {line.frequency}</span>
                    <span>{line.firstBus} – {line.lastBus}</span>
                  </div>
                </div>
                {isExp
                  ? <ChevronUp size={16} className="text-slate-500 shrink-0" />
                  : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
              </button>

              {isExp && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-700/40 pt-3">
                  {/* Tip */}
                  {line.tip && (
                    <div className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      💡 {line.tip}
                    </div>
                  )}
                  {/* Student pass note */}
                  {line.studentPass && (
                    <div className="text-xs text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                      ✓ Abonament student disponibil pe această linie
                    </div>
                  )}
                  {/* Stops */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Stații principale</p>
                    <div className="relative pl-4">
                      <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-700" />
                      {line.stops.map((stop, si) => (
                        <div key={si} className="flex items-center gap-2 py-1 relative">
                          <div className="w-2 h-2 rounded-full bg-slate-600 absolute -left-2.5 border border-slate-500" style={{ background: si === 0 || si === line.stops.length - 1 ? line.color : undefined }} />
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin size={9} className="text-slate-600" /> {stop}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
