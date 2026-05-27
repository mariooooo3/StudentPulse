import { memo } from 'react'
import { motion } from 'framer-motion'
import { Route } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '../../ui/Button'
import { bfsIndoor, indoorPathPoints, FLOOR_Y } from '../utils/mapHelpers'

function IndoorTab({
  campus,
  IND_ROOMS,
  IND_GRAPH,
  fromRoom,
  toRoom,
  indoorPath,
  setFromRoom,
  setToRoom,
  setIndoorPath,
}) {
  const { t } = useTranslation()
  return (
    <motion.div key="indoor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="space-y-4">
      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-4 space-y-3">
        <h2 className="text-sm font-semibold text-white">{campus.indoorLabel}</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-36">
            <label className="text-xs text-slate-400 mb-1 block">{t('navigation.map.from')}</label>
            <select value={fromRoom} onChange={e => { setFromRoom(e.target.value); setIndoorPath(null) }}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] text-slate-200 text-sm border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="">{t('navigation.indoor.chooseRoom')}</option>
              {IND_ROOMS.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900">{r.label} ({r.floor === 0 ? t('navigation.indoor.ground') : t('navigation.indoor.floor', { n: r.floor })})</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-36">
            <label className="text-xs text-slate-400 mb-1 block">{t('navigation.map.to')}</label>
            <select value={toRoom} onChange={e => { setToRoom(e.target.value); setIndoorPath(null) }}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] text-slate-200 text-sm border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="">{t('navigation.indoor.chooseRoom')}</option>
              {IND_ROOMS.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900">{r.label} ({r.floor === 0 ? t('navigation.indoor.ground') : t('navigation.indoor.floor', { n: r.floor })})</option>
              ))}
            </select>
          </div>
          <Button onClick={() => { if (fromRoom && toRoom) setIndoorPath(bfsIndoor(fromRoom, toRoom, IND_GRAPH)) }}
            disabled={!fromRoom || !toRoom}>
            <Route size={15} />
            {t('navigation.map.calculate')}
          </Button>
          {(fromRoom || toRoom) && (
            <button onClick={() => { setFromRoom(''); setToRoom(''); setIndoorPath(null) }}
              className="text-xs text-slate-400 hover:text-red-400 cursor-pointer transition-colors">
              {t('navigation.map.reset')}
            </button>
          )}
        </div>
        {indoorPath && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-slate-400 flex items-center gap-1 flex-wrap">
            <Route size={11} className="text-indigo-400 shrink-0 mr-0.5" />
            {indoorPath.map((id, i) => {
              const room = IND_ROOMS.find(r => r.id === id)
              const floorPart = typeof id === 'string' && id.includes('_') ? id.split('_')[1] : null
              const label = room?.label ?? (floorPart != null ? `${t('navigation.indoor.stairs')} ${floorPart === '0' ? t('navigation.indoor.ground') : t('navigation.indoor.floor', { n: floorPart })}` : t('navigation.indoor.stairs'))
              return (
                <span key={id} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-600">→</span>}
                  <span className={room ? 'font-medium text-white' : 'text-slate-500'}>{label}</span>
                </span>
              )
            })}
          </motion.p>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
        <svg viewBox="0 0 555 495" style={{ display: 'block', maxHeight: '420px' }} className="w-full select-none">
          <defs>
            <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#6366f1" />
            </marker>
            <pattern id="hatchStair" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="7" stroke="#64748b" strokeWidth="1.5" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width="555" height="495" fill="#0f172a" />

          {[[4,8,90],[3,98,88],[2,186,88],[1,274,88],[0,362,133]].map(([f,y,h]) => (
            <g key={f}>
              <rect x={44} y={y} width={444} height={h} fill={f % 2 === 0 ? '#1e293b' : '#172033'} />
              {f > 0 && <line x1={44} y1={y} x2={488} y2={y} stroke="#334155" strokeWidth={2} />}
            </g>
          ))}

          {FLOOR_Y.map((fy, f) => (
            <rect key={f} x={44} y={fy - 11} width={444} height={22} fill="#263348" />
          ))}

          <rect x={38} y={8} width={8} height={487} fill="#334155" />
          <rect x={480} y={8} width={8} height={487} fill="#334155" />
          <rect x={38} y={6} width={502} height={8} fill="#1e293b" />
          <rect x={38} y={487} width={450} height={8} fill="#1e293b" />

          {[[3,98],[2,186],[1,274],[0,362]].map(([f,y]) => (
            <rect key={f} x={46} y={y - 2} width={434} height={5} fill="#64748b" opacity={0.35} />
          ))}

          {[[4,8,90],[3,98,88],[2,186,88],[1,274,88],[0,362,133]].map(([f,y,h]) => (
            <g key={f}>
              <text x={22} y={y + h / 2 + 4} textAnchor="middle" fontSize={10} fontWeight="700" fill="#94a3b8">
                {f === 0 ? 'P' : `E${f}`}
              </text>
              <line x1={34} y1={y + h / 2} x2={40} y2={y + h / 2} stroke="#475569" strokeWidth={1} />
            </g>
          ))}

          <rect x={488} y={8} width={59} height={487} fill="url(#hatchStair)" opacity="0.55" />
          <rect x={488} y={8} width={59} height={487} fill="none" stroke="#64748b" strokeWidth={1.5} />
          <text x={517} y={254} textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="700"
            transform="rotate(-90,517,254)">SCARĂ</text>
          {FLOOR_Y.map((fy, f) => (
            <g key={f}>
              <rect x={488} y={fy - 14} width={59} height={28} fill="#475569" />
              <text x={517} y={fy + 5} textAnchor="middle" fontSize={9} fill="#ffffff" fontWeight="700">
                {f === 0 ? 'P' : `E${f}`}
              </text>
            </g>
          ))}

          {FLOOR_Y.map((fy, f) => (
            <line key={f} x1={46} y1={fy} x2={480} y2={fy}
              stroke="#64748b" strokeWidth={0.8} strokeDasharray="5 4" />
          ))}

          {IND_ROOMS.map(room => {
            const isFrom = room.id === fromRoom
            const isTo = room.id === toRoom
            const onPath = indoorPath?.includes(room.id)
            const fillColor = isFrom ? '#4f46e5' : isTo ? '#059669' : onPath ? '#1e3a8a' : '#0f172a'
            const strokeColor = isFrom ? '#a5b4fc' : isTo ? '#6ee7b7' : onPath ? '#60a5fa' : '#475569'
            const textColor = isFrom || isTo || onPath ? '#ffffff' : '#94a3b8'
            return (
              <g key={room.id} style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (!fromRoom || (fromRoom && toRoom)) { setFromRoom(room.id); setToRoom(''); setIndoorPath(null) }
                  else if (!toRoom && room.id !== fromRoom) { setToRoom(room.id); setIndoorPath(null) }
                }}>
                <rect x={room.cx - 9} y={FLOOR_Y[room.floor] - 11} width={18} height={22}
                  fill={room.floor % 2 === 0 ? '#1e293b' : '#172033'} />
                <line x1={room.cx} y1={room.ry + room.rh} x2={room.cx} y2={FLOOR_Y[room.floor]}
                  stroke={isFrom || isTo ? '#6366f1' : '#475569'} strokeWidth={isFrom || isTo ? 2 : 1.5}
                  strokeDasharray={isFrom || isTo ? undefined : '5 3'} />
                <rect x={room.rx} y={room.ry} width={room.rw} height={room.rh}
                  fill={fillColor} stroke={strokeColor} strokeWidth={2} rx="4" />
                <text x={room.rx + room.rw / 2} y={room.ry + room.rh / 2 + 4}
                  textAnchor="middle" fontSize={9} fontWeight="700" pointerEvents="none"
                  fill={textColor}>
                  {room.label}
                </text>
              </g>
            )
          })}

          {indoorPath && indoorPath.length > 1 && (() => {
            const pts = indoorPathPoints(indoorPath, IND_ROOMS)
            const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
            return (
              <g>
                <motion.path key={d + 'g'} d={d} fill="none"
                  stroke="rgba(99,102,241,0.25)" strokeWidth={12}
                  strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }} />
                <motion.path key={d + 'w'} d={d} fill="none"
                  stroke="#e0e7ff" strokeWidth={6}
                  strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }} />
                <motion.path key={d} d={d} fill="none"
                  stroke="#6366f1" strokeWidth={3.5}
                  strokeLinecap="round" strokeLinejoin="round"
                  markerEnd="url(#arrowOrange)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }} />
                <circle cx={pts[0][0]} cy={pts[0][1]} r={10} fill="#4f46e5" stroke="#fff" strokeWidth={2} />
                <text x={pts[0][0]} y={pts[0][1] + 4} textAnchor="middle" fontSize={10} fill="#fff" fontWeight="800">A</text>
                <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={10} fill="#059669" stroke="#fff" strokeWidth={2} />
                <text x={pts[pts.length - 1][0]} y={pts[pts.length - 1][1] + 4} textAnchor="middle" fontSize={10} fill="#fff" fontWeight="800">B</text>
              </g>
            )
          })()}
        </svg>
      </div>

      <div className="flex gap-4 flex-wrap text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-600" /><span>{t('navigation.indoor.startLabel')}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-600" /><span>{t('navigation.indoor.destLabel')}</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-900 border border-blue-500/40" /><span>{t('navigation.indoor.onPath')}</span></div>
        <span className="ml-auto italic">{t('navigation.indoor.clickHint')}</span>
      </div>
    </motion.div>
  )
}

export default memo(IndoorTab)
