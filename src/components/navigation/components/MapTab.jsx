import { useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Route, ArrowRight, Loader2, Navigation as NavIcon, Wifi, WifiOff, Users, LocateFixed, X } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import HeatmapLayer from '../HeatmapLayer'
import Button from '../../ui/Button'
import Badge from '../../ui/Badge'
import { makePOIIcon, makeLabel, openExternalMap, openExternalRoute } from '../utils/mapHelpers'
import { FlyTo, FitRoute } from './MapHelpers'

export default function MapTab({
  buildings,
  POIS,
  campusCenter,
  routeFrom,
  routeTo,
  routeMode,
  routePath,
  routeInfo,
  routeLoading,
  showCrowd,
  showPOI,
  selectedBuilding,
  cinematicMode,
  cinematicSteps,
  cinematicStep,
  zones,
  totalUsers,
  connected,
  mode,
  visibleDestinations,
  ROUTE_PROFILES,
  setRouteMode,
  setRouteFrom,
  setRouteTo,
  setRoutePath,
  setRouteInfo,
  setShowCrowd,
  setShowPOI,
  setSelectedBuilding,
  onStartLostMode,
  onCalculateRoute,
  onOpenExternalMap,
  onOpenExternalRoute,
}) {
  const poiIcons = useRef({})
  function getPoiIcon(poi) {
    if (!poiIcons.current[poi.id]) {
      poiIcons.current[poi.id] = makePOIIcon(poi.short, poi.color)
    }
    return poiIcons.current[poi.id]
  }

  const activeRouteProfile = ROUTE_PROFILES[routeMode] || ROUTE_PROFILES.foot

  function fetchRoute() {
    onCalculateRoute(routeFrom, routeTo, routeMode)
  }

  return (
    <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="space-y-4">

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080e1c] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/35 to-transparent" />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-label mb-1">Traseu outdoor</p>
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Route size={15} className="text-indigo-400" /> Calculeaza ruta
            </h2>
          </div>
          <Badge variant="primary">{activeRouteProfile.label}</Badge>
        </div>
        <h2 className="hidden text-sm font-semibold text-white mb-3 items-center gap-2">
          <Route size={15} className="text-indigo-400" /> Calculează traseu
        </h2>
        <div className="mb-3 grid grid-cols-3 gap-2 sm:inline-grid sm:min-w-[360px]">
          {[{ id: 'foot', label: '🚶 Pe jos' }, { id: 'bike', label: '🚲 Bicicletă' }, { id: 'car', label: '🚗 Mașină' }].map(m => (
            <button key={m.id} onClick={() => {
              setRouteMode(m.id)
              if (routeFrom && routeTo) { onCalculateRoute(routeFrom, routeTo, m.id) }
              else { setRoutePath(null); setRouteInfo(null) }
            }}
              className={`min-h-9 rounded-xl border px-3 text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${routeMode === m.id ? 'border-indigo-400/35 bg-indigo-600/85 text-white' : 'border-white/[0.07] bg-white/[0.035] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-36">
            <label className="text-xs text-slate-400 mb-1 block">De la</label>
            <select value={routeFrom} onChange={e => { setRouteFrom(e.target.value); setRoutePath(null) }}
              className="input-base">
              <option value="">Alege punct de start...</option>
              {buildings.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>)}
            </select>
          </div>
          <ArrowRight size={16} className="hidden sm:block text-slate-400 mb-2 shrink-0" />
          <div className="flex-1 min-w-36">
            <label className="text-xs text-slate-400 mb-1 block">La</label>
            <select value={routeTo} onChange={e => { setRouteTo(e.target.value); setRoutePath(null) }}
              className="input-base">
              <option value="">Alege destinație...</option>
              {buildings.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>)}
            </select>
          </div>
          <Button onClick={fetchRoute} disabled={!routeFrom || !routeTo || routeLoading}>
            {routeLoading ? <Loader2 size={15} className="animate-spin" /> : <Route size={15} />}
            {routeLoading ? 'Se calculează...' : 'Calculează'}
          </Button>
          {(routeFrom || routeTo) && (
            <button onClick={() => { setRouteFrom(''); setRouteTo(''); setRoutePath(null); setRouteInfo(null) }}
              className="text-xs text-slate-400 hover:text-red-400 cursor-pointer transition-colors">
              Resetează
            </button>
          )}
        </div>
        {routeInfo && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex flex-col gap-3 text-sm lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <NavIcon size={14} /> {routeInfo.distance}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">~{routeInfo.duration} {ROUTE_PROFILES[routeMode]?.durationLabel}</span>
            <span className={`text-xs px-2 py-0.5 rounded-lg ${
              routeInfo.source === 'direct-estimate'
                ? 'text-amber-300 bg-amber-500/10'
                : 'text-green-400 bg-green-900/20'
            }`}>
              {routeInfo.source === 'direct-estimate' ? 'Estimare directa' : 'Traseu calculat'}
            </span>
            </div>
            {routeFrom && routeTo && (() => {
              const from = buildings.find(b => String(b.id) === String(routeFrom))
              const to = buildings.find(b => String(b.id) === String(routeTo))
              if (!from || !to) return null
              return (
                <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Extern</span>
                  <button type="button" onClick={() => onOpenExternalRoute(from, to, 'google', routeMode)}
                    className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-bold text-slate-300 hover:border-indigo-400/30 hover:text-white">
                    Google Maps
                  </button>
                  <button type="button" onClick={() => onOpenExternalRoute(from, to, 'waze', routeMode)}
                    className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-bold text-slate-300 hover:border-indigo-400/30 hover:text-white">
                    Waze
                  </button>
                </div>
              )
            })()}
          </motion.div>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-wrap items-center gap-4">
        <button
          onClick={() => setShowCrowd(v => !v)}
          className="flex items-center gap-3 select-none cursor-pointer"
        >
          <div className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${showCrowd ? 'bg-indigo-600' : 'bg-white/[0.12]'}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-transform ${showCrowd ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium text-slate-200">
            Afișează aglomerația
          </span>
        </button>

        {showCrowd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg ${
              connected
                ? 'bg-green-900/20 text-green-400'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
              {connected ? (mode === 'ws' ? 'WebSocket live' : 'Simulare locală') : 'Conectare...'}
            </span>
            {connected && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users size={12} />
                <span className="font-semibold text-white">{totalUsers}</span> activi pe campus
              </span>
            )}
          </motion.div>
        )}

        <div className="w-px h-6 bg-white/[0.08] flex-shrink-0" />
        <button
          onClick={() => setShowPOI(v => !v)}
          className="flex items-center gap-3 select-none cursor-pointer"
        >
          <div className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${showPOI ? 'bg-purple-600' : 'bg-white/[0.12]'}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow transition-transform ${showPOI ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
            <span>📍</span> Puncte de interes
          </span>
        </button>

        <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 opacity-80" /> Liber (0–15)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 opacity-80" /> Mediu (16–40)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" /> Aglomerat (40+)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="h-[58dvh] min-h-[360px] sm:h-[460px] rounded-2xl overflow-hidden border border-white/[0.06] relative">
            <MapContainer center={campusCenter} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                maxZoom={20}
                detectRetina
              />

              {showCrowd && <HeatmapLayer zones={zones} />}

              {showPOI && POIS.map(poi => (
                <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={getPoiIcon(poi)}>
                  <Popup minWidth={210}>
                    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 26, lineHeight: 1 }}>{poi.short}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 3 }}>
                            {poi.name}
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                            background: poi.color + '22', color: poi.color,
                            padding: '2px 7px', borderRadius: 20,
                          }}>
                            {poi.type}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px', lineHeight: 1.5 }}>
                        {poi.desc}
                      </p>
                      {poi.rating && (
                        <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 5 }}>
                          {'★'.repeat(Math.round(poi.rating))}{'☆'.repeat(5 - Math.round(poi.rating))}
                          {' '}<span style={{ color: '#64748b' }}>{poi.rating}/5</span>
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                        🕐 {poi.hours}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button type="button" onClick={() => onOpenExternalMap(poi, 'google')} style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 9, padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#1e293b', background: '#f8fafc' }}>Google Maps</button>
                        <button type="button" onClick={() => onOpenExternalMap(poi, 'waze')} style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 9, padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#1e293b', background: '#f8fafc' }}>Waze</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {buildings.map((b) => (
                <Marker key={b.id} position={b.coords} eventHandlers={{ click: () => setSelectedBuilding(b) }}>
                  <Popup>
                    <div style={{ fontFamily: 'system-ui, sans-serif', minWidth: 180 }}>
                      <strong>{b.name}</strong><br />{b.distance} - {b.time}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button type="button" onClick={() => onOpenExternalMap(b, 'google')} style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 9, padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#1e293b', background: '#f8fafc' }}>Google Maps</button>
                        <button type="button" onClick={() => onOpenExternalMap(b, 'waze')} style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 9, padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#1e293b', background: '#f8fafc' }}>Waze</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {routePath && (() => {
                const from = buildings.find(b => String(b.id) === routeFrom)
                const to = buildings.find(b => String(b.id) === routeTo)
                if (!from || !to) return null
                return <>
                  <Marker position={from.coords} icon={makeLabel('A', '#2563eb')} />
                  <Marker position={to.coords} icon={makeLabel('B', '#16a34a')} />
                </>
              })()}

              {routePath && (() => {
                const displayPath = cinematicMode && cinematicSteps[cinematicStep]?.pathSlice
                  ? cinematicSteps[cinematicStep].pathSlice
                  : routePath
                return (
                  <Polyline
                    positions={displayPath}
                    color={routeInfo?.source === 'direct-estimate' ? '#f59e0b' : '#f97316'}
                    weight={4}
                    opacity={0.95}
                    dashArray={routeInfo?.source === 'direct-estimate' ? '8 8' : undefined}
                  />
                )
              })()}

              <FlyTo coords={!routePath ? selectedBuilding?.coords : null} />
              <FitRoute path={routePath} />
            </MapContainer>

            <button
              type="button"
              onClick={onStartLostMode}
              className="absolute right-3 top-3 z-[1000] inline-flex min-h-12 max-w-[calc(100%-5.5rem)] items-center gap-3 rounded-2xl border border-rose-300/35 bg-[#0c1120]/95 px-3.5 pr-4 text-left shadow-[0_16px_36px_-16px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:border-rose-300/55 hover:bg-[#14192a]/95 active:scale-[0.98] sm:right-4 sm:top-4 sm:max-w-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-300/30 bg-rose-500/18 text-rose-100">
                <LocateFixed size={16} strokeWidth={2.2} />
              </span>
              <span className="leading-tight">
                <span className="block text-[12px] font-bold text-white">M-am rătăcit</span>
                <span className="block text-[10px] font-semibold text-rose-200/75">AI Compass rapid</span>
              </span>
            </button>

            {selectedBuilding && !routePath && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 bg-[#0c1120] rounded-xl shadow-lg p-4 border border-white/[0.07] z-[1000]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{selectedBuilding.name}</p>
                    <p className="text-xs text-slate-400">{selectedBuilding.distance} • {selectedBuilding.time}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => onOpenExternalMap(selectedBuilding, 'google')}>
                      Google
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onOpenExternalMap(selectedBuilding, 'waze')}>
                      Waze
                    </Button>
                    <Button size="sm" onClick={() => { setRouteFrom(String(selectedBuilding.id)); setSelectedBuilding(null) }}>
                      <Route size={13} /> Start
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => { setRouteTo(String(selectedBuilding.id)); setSelectedBuilding(null) }}>
                      <MapPin size={13} /> Dest.
                    </Button>
                    <button onClick={() => setSelectedBuilding(null)} className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
                      <X size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#080e1c]/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-2">
          <h2 className="text-sm font-semibold text-white">Destinații</h2>
          {visibleDestinations.map((building) => (
            <motion.div key={building.id} whileHover={{ x: 4 }}
              onClick={() => setSelectedBuilding(building)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                selectedBuilding?.id === building.id
                  ? 'border-indigo-500/40 bg-indigo-500/15'
                  : String(building.id) === routeFrom
                  ? 'border-blue-500/40 bg-blue-900/20'
                  : String(building.id) === routeTo
                  ? 'border-green-500/40 bg-green-900/20'
                  : 'border-white/[0.05] bg-white/[0.02]'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {String(building.id) === routeFrom
                    ? <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">A</span>
                    : String(building.id) === routeTo
                    ? <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">B</span>
                    : <NavIcon size={14} className="text-indigo-400" />
                  }
                  <div>
                    <p className="text-xs font-medium text-slate-200">{building.name}</p>
                    <p className="text-[10px] text-slate-500">{building.distance} • {building.time}</p>
                  </div>
                </div>
                <Badge>{building.type}</Badge>
              </div>
            </motion.div>
          ))}
          <p className="text-[10px] text-slate-500 text-center pt-1 italic">
            Click pe clădire → Start / Dest.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
