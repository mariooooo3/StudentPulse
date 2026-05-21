import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Sparkles, Lightbulb, Route, Users, LocateFixed, Building2, Activity } from 'lucide-react'
import { useCrowdSocket } from '../../hooks/navigation/useCrowdSocket'
import { useAuth } from '../../app/providers/AuthContext'
import L from 'leaflet'
import { askCampusAI, askRecoAI, askCampusCopilot, analyzePhoto, getSmartRecommendations } from '../../services/navigation/campusAI'
import Button from '../ui/Button'
import { courses } from '../../shared/data/courses'
import { ROUTE_PROFILES, CAMPUS_CONFIG } from './data/campusConfig'
import { formatDistance, fallbackRouteInfo, compactRoutePath, buildCampusWalkRoute, fetchOsrmRoute } from './utils/routeCalculations'
import { bfsIndoor, openExternalMap, openExternalRoute } from './utils/mapHelpers'
import { speak, buildIndoorCinematicSteps, buildOutdoorCinematicSteps, withDestinationQuestion } from './utils/navigationHelpers'
import MapTab from './components/MapTab'
import ChatTab from './components/ChatTab'
import RecoTab from './components/RecoTab'
import IndoorTab from './components/IndoorTab'
import CinematicOverlay from './components/CinematicOverlay'
import CameraModal from './components/CameraModal'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function CampusNavigator() {
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [activeTab, setActiveTab] = useState('map')
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'Salut! Sunt asistentul tău de navigare. Cum te pot ajuta?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatAttachment, setChatAttachment] = useState(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [lastPhotoContext, setLastPhotoContext] = useState(null)
  const [pulseData, setPulseData] = useState(null)
  const [pulseLoading, setPulseLoading] = useState(false)
  const [pulseLoaded, setPulseLoaded] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraFacing, setCameraFacing] = useState('environment')
  const chatHistory = useRef([])
  const recoHistory = useRef([])
  const [recoMessages, setRecoMessages] = useState([])
  const [recoInput, setRecoInput] = useState('')
  const [recoLoading, setRecoLoading] = useState(false)
  const [fromRoom, setFromRoom] = useState('')
  const [toRoom, setToRoom] = useState('')
  const [indoorPath, setIndoorPath] = useState(null)

  const [showCrowd, setShowCrowd] = useState(false)
  const [showPOI, setShowPOI] = useState(false)
  const [routeFrom, setRouteFrom] = useState('')
  const [routeTo, setRouteTo] = useState('')
  const [routeMode, setRouteMode] = useState('foot')
  const [routePath, setRoutePath] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)

  const { profile, session } = useAuth()
  const firstName = profile?.name?.split(' ')[0] ?? 'Student'
  const universityId = session?.university?.id || 'tuiasi'
  const campus = CAMPUS_CONFIG[universityId] || CAMPUS_CONFIG.tuiasi
  const { center: campusCenter, buildings, pois: POIS, indRooms: IND_ROOMS, indGraph: IND_GRAPH,
          outdoorRouteIds: OUTDOOR_ROUTE_IDS, aiDestinations: AI_COMPASS_DESTINATIONS } = campus
  const heatmapHotspots = useMemo(() => [
    ...buildings.map(building => building.coords),
    ...POIS.map(poi => [poi.lat, poi.lng]),
  ], [buildings, POIS])
  const { zones, totalUsers, connected, mode } = useCrowdSocket(showCrowd, campusCenter, heatmapHotspots)
  const visibleDestinations = buildings
  const campusStats = [
    { label: 'Cladiri', value: buildings.length, icon: Building2, color: '#6366f1' },
    { label: 'Puncte utile', value: POIS.length, icon: MapPin, color: '#10b981' },
    { label: 'Studenti live', value: totalUsers || '-', icon: Users, color: '#f59e0b' },
  ]
  const navigatorTabs = [
    { id: 'map', label: 'Harta', desc: 'trasee live', icon: MapPin },
    { id: 'chat', label: 'AI Compass', desc: 'ghid conversational', icon: Sparkles },
    { id: 'reco', label: 'Recomandari', desc: 'context campus', icon: Lightbulb },
    { id: 'indoor', label: 'Plan interior', desc: 'sali si etaje', icon: Route },
  ]

  useEffect(() => {
    setFromRoom('')
    setToRoom('')
    setIndoorPath(null)
    setChatMessages([{ role: 'model', text: campus.greeting }])
    chatHistory.current = []
  }, [universityId])

  useEffect(() => {
    if (activeTab !== 'reco' || pulseLoaded) return
    loadPulse()
  }, [activeTab])

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach(track => track.stop())
      window.speechSynthesis?.cancel()
    }
  }, [cameraStream])

  async function loadPulse() {
    setPulseLoading(true)
    try {
      const h = new Date().getHours()
      const result = await getSmartRecommendations({ hour: h, totalUsers, schedule: courses.slice(0, 4) })
      setPulseData(result)
      setPulseLoaded(true)
    } catch {
      setPulseData({ briefing: 'Nu am putut genera recomandări acum.', cards: [] })
    }
    setPulseLoading(false)
  }

  async function sendRecoChat(question) {
    const q = (question ?? recoInput).trim()
    if (!q || recoLoading) return
    setRecoMessages(prev => [...prev, { role: 'user', text: q }])
    setRecoInput('')
    setRecoLoading(true)
    try {
      const response = await askRecoAI(q, recoHistory.current)
      recoHistory.current = [
        ...recoHistory.current,
        { role: 'user', content: q },
        { role: 'assistant', content: response },
      ]
      setRecoMessages(prev => [...prev, { role: 'model', text: response }])
    } catch {
      setRecoMessages(prev => [...prev, { role: 'model', text: 'Momentan nu pot răspunde. Încearcă din nou.' }])
    }
    setRecoLoading(false)
  }

  function resolveOutdoorRouteId(value, fallback = '') {
    const raw = String(value || '').trim()
    if (!raw) return fallback
    const mapped = OUTDOOR_ROUTE_IDS[raw.toLowerCase()] || raw
    return buildings.some(building => String(building.id) === String(mapped)) ? String(mapped) : fallback
  }

  const [cinematicMode, setCinematicMode] = useState(false)
  const [cinematicStep, setCinematicStep] = useState(0)
  const [cinematicSteps, setCinematicSteps] = useState([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  async function calculateOutdoorRoute(fromValue, toValue, mode = routeMode) {
    const from = buildings.find(b => String(b.id) === String(fromValue))
    const to = buildings.find(b => String(b.id) === String(toValue))
    if (!from || !to) return
    if (String(from.id) === String(to.id)) {
      setRouteLoading(false)
      setRoutePath(null)
      setRouteInfo({ distance: '0m', duration: '0 min', mode: ROUTE_PROFILES[mode]?.label || ROUTE_PROFILES.foot.label })
      return
    }
    const profile = ROUTE_PROFILES[mode] || ROUTE_PROFILES.foot
    setRouteLoading(true)
    setRoutePath(null)
    setRouteInfo(null)

    try {
      if (mode === 'foot') {
        const campusWalkRoute = buildCampusWalkRoute(campus, from, to)
        if (campusWalkRoute) {
          setRoutePath(campusWalkRoute.path)
          setRouteInfo(campusWalkRoute.info)
          setRouteLoading(false)
          return
        }
      }

      const osrmRoute = await fetchOsrmRoute(from, to, profile)
      const duration = Math.max(1, Math.ceil((osrmRoute.distance / 1000) / profile.speedKmh * 60))
      setRoutePath(osrmRoute.path)
      setRouteInfo({
        distance: formatDistance(osrmRoute.distance),
        duration: `${duration} min`,
        mode: profile.label,
        source: 'osrm',
      })
    } catch {
      setRoutePath(compactRoutePath([from.coords, to.coords]))
      setRouteInfo(fallbackRouteInfo(from, to, profile))
    }
    setRouteLoading(false)
  }

  useEffect(() => {
    let pending = null
    try {
      const raw = sessionStorage.getItem('sc_pending_route')
      if (!raw) return
      pending = JSON.parse(raw)
    } catch {
      return
    }

    const from = String(pending?.from || '')
    const to = String(pending?.to || '')
    if (!from || !to || !buildings.some(b => String(b.id) === from) || !buildings.some(b => String(b.id) === to)) return
    sessionStorage.removeItem('sc_pending_route')

    const mode = pending.mode || 'foot'
    setActiveTab('map')
    setRouteMode(mode)
    setRouteFrom(from)
    setRouteTo(to)
    setRoutePath(null)
    setRouteInfo(null)
    calculateOutdoorRoute(from, to, mode)
  }, [buildings, universityId])

  function applyCopilotRoute(routeSuggestion) {
    if (!routeSuggestion?.type || routeSuggestion.type === 'none') return

    if (routeSuggestion.type === 'indoor') {
      const start = routeSuggestion.from || campus.indoorDefault
      const end = routeSuggestion.to
      const path = bfsIndoor(start, end, IND_GRAPH)
      setFromRoom(start && IND_ROOMS.find(r => r.id === start) ? start : '')
      setToRoom(end && IND_ROOMS.find(r => r.id === end) ? end : '')
      setIndoorPath(path || null)
      setActiveTab('indoor')
      return
    }

    if (routeSuggestion.type === 'outdoor') {
      const from = resolveOutdoorRouteId(routeSuggestion.from, '1')
      const to = resolveOutdoorRouteId(routeSuggestion.to)
      if (!to) {
        setChatMessages(prev => [...prev, { role: 'model', text: 'Nu am gasit destinatia pe harta campusului. Alege una dintre destinatiile rapide si calculez ruta.' }])
        return
      }
      setRouteFrom(from)
      setRouteTo(to)
      setRoutePath(null)
      setRouteInfo(null)
      setActiveTab('map')
      calculateOutdoorRoute(from, to, routeMode)
    }
  }

  function exitCinematicMode() {
    setCinematicMode(false)
    setCinematicStep(0)
    setCinematicSteps([])
    window.speechSynthesis?.cancel()
  }

  function goCinematicNext() {
    setCinematicStep(prev => {
      const next = Math.min(prev + 1, cinematicSteps.length - 1)
      speak(cinematicSteps[next]?.instruction, voiceEnabled)
      return next
    })
  }

  function goCinematicPrev() {
    setCinematicStep(prev => {
      const p = Math.max(prev - 1, 0)
      speak(cinematicSteps[p]?.instruction, voiceEnabled)
      return p
    })
  }

  async function startCinematicMode(copilotResult) {
    const { routeSuggestion, actions } = copilotResult
    let steps = []

    if (routeSuggestion?.type === 'outdoor') {
      const profile = ROUTE_PROFILES[routeMode] || ROUTE_PROFILES.foot
      const fromId = resolveOutdoorRouteId(routeSuggestion.from, '1')
      const toId = resolveOutdoorRouteId(routeSuggestion.to)
      const fromB = buildings.find(b => String(b.id) === fromId)
      const toB = buildings.find(b => String(b.id) === toId)
      if (!fromB || !toB) return
      setRouteFrom(fromId)
      setRouteTo(toId)
      setActiveTab('map')
      let pathData = null
      try {
        if (routeMode === 'foot') {
          const campusWalkRoute = buildCampusWalkRoute(campus, fromB, toB)
          if (campusWalkRoute) {
            pathData = campusWalkRoute.path
            setRoutePath(pathData)
            setRouteInfo(campusWalkRoute.info)
          }
        }

        if (!pathData) {
          const osrmRoute = await fetchOsrmRoute(fromB, toB, profile)
          pathData = osrmRoute.path
          const duration = Math.max(1, Math.ceil((osrmRoute.distance / 1000) / profile.speedKmh * 60))
          setRoutePath(pathData)
          setRouteInfo({
            distance: formatDistance(osrmRoute.distance),
            duration: `${duration} min`,
            mode: profile.label,
            source: 'osrm',
          })
        }
      } catch {
        if (!pathData) {
          pathData = compactRoutePath([fromB.coords, toB.coords])
          setRoutePath(pathData)
          setRouteInfo(fallbackRouteInfo(fromB, toB, profile))
        }
      }
      if (pathData) steps = buildOutdoorCinematicSteps(pathData, actions, fromB, toB)
    } else if (routeSuggestion?.type === 'indoor') {
      const start = routeSuggestion.from || campus.indoorDefault
      const end = routeSuggestion.to
      const path = bfsIndoor(start, end, IND_GRAPH)
      setFromRoom(start && IND_ROOMS.find(r => r.id === start) ? start : '')
      setToRoom(end && IND_ROOMS.find(r => r.id === end) ? end : '')
      setIndoorPath(path || null)
      setActiveTab('indoor')
      if (path) steps = buildIndoorCinematicSteps(path, IND_ROOMS)
    }

    if (steps.length === 0) return
    setCinematicSteps(steps)
    setCinematicStep(0)
    setCinematicMode(true)
    speak(steps[0].instruction, voiceEnabled)
  }

  function makeCopilotContext() {
    return {
      campus: campus.name,
      university: universityId,
      currentTime: new Date().toISOString(),
      schedule: courses.slice(0, 4),
      buildings: buildings.map(({ id, name, type }) => ({ id, name, type })),
      indoorRooms: IND_ROOMS.map(({ id, label, floor }) => ({ id, label, floor })),
    }
  }

  async function submitAiCompass(message, attachment) {
    if ((!message.trim() && !attachment) || chatLoading) return

    const hasTypedMessage = Boolean(message.trim())
    const userMsg = hasTypedMessage ? message.trim() : 'Analizeaza poza'
    const apiMessage = hasTypedMessage ? userMsg : ''
    setChatInput('')
    if (!attachment || attachment === chatAttachment) setChatAttachment(null)
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg, imagePreview: attachment?.preview }])
    setChatLoading(true)

    try {
      if (attachment) {
        if (!hasTypedMessage) {
          const photoAnswer = await analyzePhoto(attachment.base64, attachment.mimeType, universityId)
          const answer = withDestinationQuestion(photoAnswer)
          setLastPhotoContext({ image: attachment, visualAnswer: photoAnswer })
          chatHistory.current = [
            ...chatHistory.current,
            { role: 'user', content: '[poza atasata]' },
            { role: 'assistant', content: answer },
          ]
          setChatMessages((prev) => [...prev, { role: 'model', text: answer, destinationOptions: AI_COMPASS_DESTINATIONS }])
        } else {
          const response = await askCampusCopilot({
            message: apiMessage,
            image: { base64: attachment.base64, mimeType: attachment.mimeType },
            history: chatHistory.current,
            context: makeCopilotContext(),
          })
          chatHistory.current = [
            ...chatHistory.current,
            { role: 'user', content: `${userMsg} [poza atasata]` },
            { role: 'assistant', content: response.answer },
          ]
          setChatMessages((prev) => [...prev, { role: 'model', text: response.answer, copilot: response }])
        }
      } else {
        if (lastPhotoContext) {
          const response = await askCampusCopilot({
            message: userMsg,
            image: { base64: lastPhotoContext.image.base64, mimeType: lastPhotoContext.image.mimeType },
            history: chatHistory.current,
            context: { ...makeCopilotContext(), visualAnswer: lastPhotoContext.visualAnswer },
          })
          chatHistory.current = [
            ...chatHistory.current,
            { role: 'user', content: userMsg },
            { role: 'assistant', content: response.answer },
          ]
          setChatMessages((prev) => [...prev, { role: 'model', text: response.answer, copilot: response }])
        } else {
          const response = await askCampusAI(userMsg, chatHistory.current)
          chatHistory.current = [
            ...chatHistory.current,
            { role: 'user', content: userMsg },
            { role: 'assistant', content: response },
          ]
          setChatMessages((prev) => [...prev, { role: 'model', text: response }])
        }
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: 'model', text: `Eroare: ${err.message}` }])
    }
    setChatLoading(false)
  }

  function selectAiCompassDestination(option) {
    if (chatLoading) return
    submitAiCompass(option.query, null)
  }

  function attachmentFromDataUrl(dataUrl, mimeType = 'image/jpeg') {
    return {
      preview: dataUrl,
      base64: dataUrl.split(',')[1],
      mimeType,
    }
  }

  async function openCamera(facing = 'environment') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      setCameraFacing(facing)
      setCameraStream(stream)
      setCameraOpen(true)
    } catch {
      alert('Accesul la cameră a fost refuzat sau camera nu este disponibilă.')
    }
  }

  function closeCamera() {
    cameraStream?.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setCameraOpen(false)
  }

  async function flipCamera() {
    cameraStream?.getTracks().forEach(t => t.stop())
    const next = cameraFacing === 'environment' ? 'user' : 'environment'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      setCameraFacing(next)
      setCameraStream(stream)
    } catch { /* keep existing */ }
  }

  function startLostMode() {
    setActiveTab('chat')
    setChatInput('')
    setChatAttachment(null)
    setChatMessages(prev => [
      ...prev,
      {
        role: 'model',
        text: 'Ok, intrăm în modul de orientare rapidă. Trimite o poză din jur sau alege direct un reper important și îți propun ruta.',
        destinationOptions: AI_COMPASS_DESTINATIONS,
      },
    ])
  }

  return (
    <div className="space-y-5 overflow-auto p-4 sm:p-6">
      <motion.div className="hidden" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Navigator Campus</h1>
        <p className="text-slate-400 mt-1">Hartă, AI chat și recunoaștere vizuală.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080e1c] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_48px_-28px_rgba(0,0,0,0.95)] sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-35" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-indigo-500/14 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/45 to-transparent" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
              <Activity size={11} strokeWidth={2.2} />
              {campus.name}
            </div>
            <h1 className="text-[2rem] font-bold leading-none tracking-tight text-white sm:text-[2.35rem]">
              Navigator Campus
            </h1>
            <p className="mt-3 max-w-[56ch] text-[13px] font-medium leading-relaxed text-slate-500">
              Harta campusului, trasee pietonale, AI Compass si plan interior pentru sali. Salut, {firstName}.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
            {campusStats.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl border" style={{ color, background: `${color}18`, borderColor: `${color}28` }}>
                  <Icon size={15} strokeWidth={1.8} />
                </div>
                <p className="font-mono text-lg font-bold leading-none text-white">{value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="hidden">
        {[
          { id: 'map', label: 'Hartă', icon: MapPin },
          { id: 'chat', label: 'AI Compass', icon: Sparkles },
          { id: 'reco', label: 'Recomandări Smart', icon: Lightbulb },
          { id: 'indoor', label: 'Plan Interior', icon: Route },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={15} />
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {navigatorTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`group relative min-h-14 rounded-2xl border px-3.5 text-left transition-all duration-200 active:scale-[0.98] sm:min-w-[156px] ${
                activeTab === tab.id
                  ? 'border-indigo-400/35 bg-indigo-500/[0.13] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-white/[0.06] bg-white/[0.025] text-slate-400 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                  activeTab === tab.id ? 'border-indigo-400/25 bg-indigo-500/18 text-indigo-200' : 'border-white/[0.06] bg-white/[0.03] text-slate-500 group-hover:text-slate-300'
                }`}>
                  <tab.icon size={15} strokeWidth={1.85} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-bold leading-tight">{tab.label}</span>
                  <span className="block text-[10px] font-semibold leading-tight text-slate-600">{tab.desc}</span>
                </span>
              </div>
            </button>
          ))}
        </div>

      <button
        type="button"
        onClick={startLostMode}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500/[0.09] px-4 text-sm font-bold text-rose-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all hover:bg-rose-500/[0.14] active:scale-[0.98] sm:w-auto"
      >
        <LocateFixed size={16} strokeWidth={2} />
        M-am rătăcit
      </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'map' && (
          <MapTab
            buildings={buildings}
            POIS={POIS}
            campusCenter={campusCenter}
            routeFrom={routeFrom}
            routeTo={routeTo}
            routeMode={routeMode}
            routePath={routePath}
            routeInfo={routeInfo}
            routeLoading={routeLoading}
            showCrowd={showCrowd}
            showPOI={showPOI}
            selectedBuilding={selectedBuilding}
            cinematicMode={cinematicMode}
            cinematicSteps={cinematicSteps}
            cinematicStep={cinematicStep}
            zones={zones}
            totalUsers={totalUsers}
            connected={connected}
            mode={mode}
            visibleDestinations={visibleDestinations}
            ROUTE_PROFILES={ROUTE_PROFILES}
            setRouteMode={setRouteMode}
            setRouteFrom={setRouteFrom}
            setRouteTo={setRouteTo}
            setRoutePath={setRoutePath}
            setRouteInfo={setRouteInfo}
            setShowCrowd={setShowCrowd}
            setShowPOI={setShowPOI}
            setSelectedBuilding={setSelectedBuilding}
            onStartLostMode={startLostMode}
            onCalculateRoute={calculateOutdoorRoute}
            onOpenExternalMap={openExternalMap}
            onOpenExternalRoute={openExternalRoute}
          />
        )}
        {activeTab === 'chat' && (
          <ChatTab
            chatMessages={chatMessages}
            chatLoading={chatLoading}
            chatAttachment={chatAttachment}
            chatInput={chatInput}
            AI_COMPASS_DESTINATIONS={AI_COMPASS_DESTINATIONS}
            setChatInput={setChatInput}
            setChatAttachment={setChatAttachment}
            onSubmit={submitAiCompass}
            onStartLostMode={startLostMode}
            onOpenCamera={openCamera}
            onSelectDestination={selectAiCompassDestination}
            onApplyRoute={applyCopilotRoute}
            onStartPresentation={startCinematicMode}
          />
        )}
        {activeTab === 'reco' && (
          <RecoTab
            totalUsers={totalUsers}
            pulseData={pulseData}
            pulseLoading={pulseLoading}
            recoMessages={recoMessages}
            recoInput={recoInput}
            recoLoading={recoLoading}
            setRecoMessages={setRecoMessages}
            setRecoInput={setRecoInput}
            recoHistoryRef={recoHistory}
            onSendRecoChat={sendRecoChat}
            onRefreshPulse={() => { setPulseLoaded(false); setPulseData(null); loadPulse() }}
          />
        )}
        {activeTab === 'indoor' && (
          <IndoorTab
            campus={campus}
            IND_ROOMS={IND_ROOMS}
            IND_GRAPH={IND_GRAPH}
            fromRoom={fromRoom}
            toRoom={toRoom}
            indoorPath={indoorPath}
            setFromRoom={setFromRoom}
            setToRoom={setToRoom}
            setIndoorPath={setIndoorPath}
          />
        )}
      </AnimatePresence>

      <CinematicOverlay
        cinematicMode={cinematicMode}
        cinematicStep={cinematicStep}
        cinematicSteps={cinematicSteps}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        onNext={goCinematicNext}
        onPrev={goCinematicPrev}
        onExit={exitCinematicMode}
      />

      <CameraModal
        cameraOpen={cameraOpen}
        cameraStream={cameraStream}
        onFlip={flipCamera}
        onClose={closeCamera}
        onCapture={(dataUrl) => {
          closeCamera()
          setActiveTab('chat')
          submitAiCompass(chatInput, attachmentFromDataUrl(dataUrl, 'image/jpeg'))
        }}
      />
    </div>
  )
}
