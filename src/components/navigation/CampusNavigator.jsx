import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Camera, Sparkles, Send, X, Loader2, Navigation as NavIcon, Lightbulb, Route, ArrowRight, Users, Wifi, WifiOff, FlipHorizontal, ImagePlus, Play, CheckCircle, ChevronRight, ChevronLeft, Volume2, VolumeX, LocateFixed, Building2, Activity } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import HeatmapLayer from './HeatmapLayer'
import { useCrowdSocket } from '../../hooks/navigation/useCrowdSocket'
import { useAuth } from '../../app/providers/AuthContext'
import L from 'leaflet'
import { askCampusAI, askRecoAI, askCampusCopilot, analyzePhoto, getSmartRecommendations } from '../../services/navigation/campusAI'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { courses } from '../../shared/data/courses'
import { ROUTE_PROFILES, CAMPUS_CONFIG } from './data/campusConfig'
import { formatDistance, haversineMeters, fallbackRouteInfo, routeDistance, compactRoutePath, nearestWalkNode, dijkstraWalkPath, buildCampusWalkRoute, fetchOsrmRoute } from './utils/routeCalculations'
import { makePOIIcon, FLOOR_Y, STAIR_X, bfsIndoor, indoorPathPoints, makeLabel, mapsQuery, googleMapsUrl, wazeUrl, openExternalMap, coordsParam, googleDirectionsUrl, wazeRouteUrl, openExternalRoute } from './utils/mapHelpers'
import { speak, buildIndoorCinematicSteps, buildOutdoorCinematicSteps, confidenceLabel, withDestinationQuestion } from './utils/navigationHelpers'
import { FlyTo, FitRoute } from './components/MapHelpers'
import VisualCopilotCard from './components/CopilotCard'

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
  const chatFileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const chatBottomRef = useRef(null)
  const chatHistory = useRef([])
  const recoHistory = useRef([])
  const recoChatBottomRef = useRef(null)
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
  const activeRouteProfile = ROUTE_PROFILES[routeMode] || ROUTE_PROFILES.foot
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
    recoChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [recoMessages])

  useEffect(() => {
    if (cameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraOpen, cameraStream])

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

  async function sendQuickChat(question) {
    setActiveTab('chat')
    setChatMessages(prev => [...prev, { role: 'user', text: question }])
    setChatLoading(true)
    try {
      const response = await askCampusAI(question, chatHistory.current)
      chatHistory.current = [
        ...chatHistory.current,
        { role: 'user', content: question },
        { role: 'assistant', content: response },
      ]
      setChatMessages(prev => [...prev, { role: 'model', text: response }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: `Eroare: ${err.message}` }])
    }
    setChatLoading(false)
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
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

  const poiIcons = useRef({})
  function getPoiIcon(poi) {
    if (!poiIcons.current[poi.id]) {
      poiIcons.current[poi.id] = makePOIIcon(poi.short, poi.color)
    }
    return poiIcons.current[poi.id]
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

  async function fetchRoute() {
    await calculateOutdoorRoute(routeFrom, routeTo, routeMode)
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
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function sendChat(e) {
    e.preventDefault()
    await submitAiCompass(chatInput, chatAttachment)
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

  async function handleChatPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      submitAiCompass(chatInput, attachmentFromDataUrl(ev.target.result, file.type || 'image/jpeg'))
      e.target.value = ''
    }
    reader.readAsDataURL(file)
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

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    closeCamera()
    setActiveTab('chat')
    submitAiCompass(chatInput, attachmentFromDataUrl(dataUrl, 'image/jpeg'))
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
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
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
                    if (routeFrom && routeTo) { calculateOutdoorRoute(routeFrom, routeTo, m.id) }
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
                        <button type="button" onClick={() => openExternalRoute(from, to, 'google', routeMode)}
                          className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-bold text-slate-300 hover:border-indigo-400/30 hover:text-white">
                          Google Maps
                        </button>
                        <button type="button" onClick={() => openExternalRoute(from, to, 'waze', routeMode)}
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
                              <button type="button" onClick={() => openExternalMap(poi, 'google')} style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 9, padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#1e293b', background: '#f8fafc' }}>Google Maps</button>
                              <button type="button" onClick={() => openExternalMap(poi, 'waze')} style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 9, padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#1e293b', background: '#f8fafc' }}>Waze</button>
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
                              <button type="button" onClick={() => openExternalMap(b, 'google')} style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 9, padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#1e293b', background: '#f8fafc' }}>Google Maps</button>
                              <button type="button" onClick={() => openExternalMap(b, 'waze')} style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 9, padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#1e293b', background: '#f8fafc' }}>Waze</button>
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
                    onClick={startLostMode}
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
                          <Button size="sm" variant="secondary" onClick={() => openExternalMap(selectedBuilding, 'google')}>
                            Google
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => openExternalMap(selectedBuilding, 'waze')}>
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
        )}

        {activeTab === 'chat' && (
          <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden h-[70dvh] min-h-[520px] flex flex-col">
            <div className="p-4 border-b border-white/[0.05] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Compass</p>
                  <p className="text-xs text-slate-500">Chat, poza si ghidare campus</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startLostMode}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.08] px-3 text-xs font-bold text-rose-100 transition-colors hover:bg-rose-500/[0.13] active:scale-[0.98]"
              >
                <LocateFixed size={14} />
                M-am rătăcit
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {chatMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-white/[0.05] text-slate-200 rounded-bl-md'
                    }`}>
                      {msg.imagePreview && (
                        <img
                          src={msg.imagePreview}
                          alt="Poza atasata pentru analiza de navigatie"
                          className="mb-2 max-h-44 w-full rounded-xl object-cover border border-white/[0.12]"
                        />
                      )}
                      {msg.copilot ? (
                        <VisualCopilotCard result={msg.copilot} onStartRoute={applyCopilotRoute} onStartPresentation={startCinematicMode} />
                      ) : (
                        <>
                          {msg.text}
                          {msg.destinationOptions?.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {msg.destinationOptions.map(option => (
                                <button
                                  key={option.label}
                                  type="button"
                                  onClick={() => selectAiCompassDestination(option)}
                                  disabled={chatLoading}
                                  className="min-h-11 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-left hover:bg-indigo-500/20 disabled:opacity-50 transition-colors"
                                >
                                  <span className="block text-sm font-semibold text-white">{option.label}</span>
                                  <span className="block text-[10px] uppercase tracking-widest text-indigo-200/70">{option.type}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white/[0.05] px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-indigo-400" />
                      <span className="text-sm text-slate-400">Gândesc...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={sendChat} className="p-3 sm:p-4 border-t border-white/[0.05]">
              {chatAttachment && (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2">
                  <img
                    src={chatAttachment.preview}
                    alt="Preview poza atasata"
                    className="h-14 w-20 rounded-lg object-cover border border-white/[0.08]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200">Poza atasata pentru Copilot</p>
                    <p className="text-[11px] text-slate-500">Scrie destinatia sau intreaba unde esti.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatAttachment(null)}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex gap-2 sm:gap-3">
                <input ref={chatFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChatPhoto} />
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.07] transition-colors cursor-pointer"
                  title="Ataseaza poza"
                >
                  <ImagePlus size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => openCamera('environment')}
                  className="p-2.5 rounded-xl bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.07] transition-colors cursor-pointer"
                  title="Fa poza"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="text"
                  placeholder="Unde e sala C310? Cum ajung la cantină?..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="min-w-0 flex-1 px-3 sm:px-4 py-2.5 rounded-xl bg-white/[0.03] text-slate-200 border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm placeholder:text-slate-600"
                />
                <button type="submit" disabled={(!chatInput.trim() && !chatAttachment) || chatLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'reco' && (() => {
          const now = new Date()
          const h = now.getHours()
          const timeLabel = now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
          const dayLabel = now.toLocaleDateString('ro-RO', { weekday: 'long' })
          const dateLabel = now.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })
          const crowdLabel = totalUsers === 0 ? '–' : totalUsers < 80 ? 'Liniștit' : totalUsers < 160 ? 'Moderat' : 'Aglomerat'
          const crowdColor = totalUsers === 0 ? 'text-slate-400' : totalUsers < 80 ? 'text-emerald-400' : totalUsers < 160 ? 'text-amber-400' : 'text-red-400'
          const periodEmoji = h < 7 ? '🌙' : h < 10 ? '🌅' : h < 13 ? '☀️' : h < 17 ? '🌤️' : h < 20 ? '🌆' : '🌙'
          const urgencyStyle = {
            high:   { border: 'border-red-500/40',    bg: 'bg-red-500/8',    dot: 'bg-red-400',    text: 'text-red-400'    },
            medium: { border: 'border-amber-500/40',  bg: 'bg-amber-500/8',  dot: 'bg-amber-400',  text: 'text-amber-400'  },
            low:    { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', dot: 'bg-emerald-400', text: 'text-emerald-400' },
          }
          const QUICK_CHIPS = [
            { label: 'Unde mănânc?',        icon: '🍽️', q: 'Unde pot mânca acum pe campus? Ce opțiuni am?' },
            { label: 'Săli libere?',         icon: '🚪', q: 'Ce săli sunt disponibile acum în Corp C?' },
            { label: 'Secretariatul?',       icon: '📋', q: 'Secretariatul AC e deschis acum? Unde se afla?' },
            { label: 'O cafea rapidă',       icon: '☕', q: 'Unde fac o cafea rapidă lângă campus?' },
            { label: 'Studiu azi?',          icon: '📚', q: 'Ce zone de studiu sunt disponibile acum pe campus? Biblioteca e aglomerată?' },
            { label: 'Examene în sesiune',   icon: '🎓', q: 'Cum mă pregătesc eficient pentru sesiunea de examene? Sfaturi practice.' },
          ]

          return (
            <motion.div key="reco" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-4">

              {/* Header */}
              <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
                <div className="relative flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/50 text-[11px] uppercase tracking-widest mb-0.5">{dayLabel}, {dateLabel}</p>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <span>{periodEmoji}</span> Campus Pulse
                    </h2>
                  </div>
                  <button
                    onClick={() => { setPulseLoaded(false); setPulseData(null); loadPulse() }}
                    disabled={pulseLoading}
                    className="flex items-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-xl font-medium cursor-pointer disabled:cursor-not-allowed"
                  >
                    {pulseLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    {pulseLoading ? 'Analizez...' : 'Actualizează'}
                  </button>
                </div>
                <div className="relative grid grid-cols-3 gap-2">
                  {[
                    { label: 'Ora', value: timeLabel, emoji: '⏰' },
                    { label: 'Trafic', value: crowdLabel, emoji: '👥', valueClass: crowdColor },
                    { label: 'Activi', value: totalUsers > 0 ? `${totalUsers}` : '–', emoji: '🏃' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center">
                      <div className="text-base mb-0.5">{s.emoji}</div>
                      <div className="text-[9px] text-white/50 uppercase tracking-wide">{s.label}</div>
                      <div className={`text-xs font-bold mt-0.5 ${s.valueClass || 'text-white'}`}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick chips */}
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Sparkles size={10} /> Întreabă rapid
                </p>
                <div className="flex gap-2 flex-wrap">
                  {QUICK_CHIPS.map(chip => (
                    <button key={chip.label} onClick={() => sendRecoChat(chip.q)}
                      className="flex items-center gap-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all px-3 py-1.5 rounded-xl cursor-pointer">
                      <span>{chip.icon}</span> {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Cards */}
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Lightbulb size={10} className="text-amber-400" /> Recomandări acum
                </p>

                {pulseLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.05] p-4 animate-pulse">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.07] shrink-0" />
                          <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 bg-white/[0.07] rounded w-3/4" />
                            <div className="h-2.5 bg-white/[0.04] rounded w-full" />
                            <div className="h-2.5 bg-white/[0.04] rounded w-2/3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!pulseLoading && pulseData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {pulseData.briefing && (
                      <p className="text-sm text-slate-400 italic border-l-2 border-indigo-500/40 pl-3">
                        {pulseData.briefing}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(pulseData.cards || []).map((card, i) => {
                        const style = urgencyStyle[card.urgency] || urgencyStyle.low
                        return (
                          <motion.div key={card.id || i}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`rounded-2xl border ${style.border} ${style.bg} p-4 flex gap-3`}>
                            <div className="text-2xl leading-none pt-0.5 shrink-0">{card.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-white leading-tight">{card.title}</p>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {!pulseLoading && !pulseData && (
                  <div className="text-center py-8 text-slate-600 text-sm">
                    Nu s-au putut genera recomandări.
                  </div>
                )}
              </div>

              {/* Reco AI Chat Zone */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.05]">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Sparkles size={13} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white">Asistent Campus</p>
                    <p className="text-[10px] text-slate-600 truncate">Întreabă despre campus, sesiune, viața studențească</p>
                  </div>
                  {recoMessages.length > 0 && (
                    <button
                      onClick={() => { setRecoMessages([]); recoHistory.current = [] }}
                      className="text-slate-700 hover:text-slate-400 transition-colors shrink-0"
                      title="Șterge conversația"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {recoMessages.length > 0 && (
                  <div className="max-h-72 overflow-y-auto p-4 space-y-3">
                    {recoMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-indigo-600/25 border border-indigo-500/25 text-slate-200 rounded-br-sm'
                            : 'bg-white/[0.05] border border-white/[0.07] text-slate-300 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {recoLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2">
                          <Loader2 size={12} className="animate-spin text-indigo-400" />
                          <span className="text-[12px] text-slate-500">Analizez...</span>
                        </div>
                      </div>
                    )}
                    <div ref={recoChatBottomRef} />
                  </div>
                )}

                <form
                  onSubmit={e => { e.preventDefault(); sendRecoChat(recoInput) }}
                  className="flex items-center gap-2 p-3 border-t border-white/[0.05]"
                >
                  <input
                    value={recoInput}
                    onChange={e => setRecoInput(e.target.value)}
                    disabled={recoLoading}
                    placeholder="Întreabă ceva despre campus sau sesiune..."
                    className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2 text-[13px] text-slate-300 placeholder-slate-700 outline-none focus:border-indigo-500/40 transition-colors disabled:opacity-50 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={recoLoading || !recoInput.trim()}
                    className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-600/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send size={13} className="text-indigo-400" />
                  </button>
                </form>
              </div>
            </motion.div>
          )
        })()}

        {activeTab === 'indoor' && (
          <motion.div key="indoor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4">
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white">{campus.indoorLabel}</h2>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-36">
                  <label className="text-xs text-slate-400 mb-1 block">De la</label>
                  <select value={fromRoom} onChange={e => { setFromRoom(e.target.value); setIndoorPath(null) }}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] text-slate-200 text-sm border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Alege sala...</option>
                    {IND_ROOMS.map(r => (
                      <option key={r.id} value={r.id} className="bg-slate-900">{r.label} ({r.floor === 0 ? 'Parter' : `Etaj ${r.floor}`})</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-36">
                  <label className="text-xs text-slate-400 mb-1 block">La</label>
                  <select value={toRoom} onChange={e => { setToRoom(e.target.value); setIndoorPath(null) }}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] text-slate-200 text-sm border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Alege sala...</option>
                    {IND_ROOMS.map(r => (
                      <option key={r.id} value={r.id} className="bg-slate-900">{r.label} ({r.floor === 0 ? 'Parter' : `Etaj ${r.floor}`})</option>
                    ))}
                  </select>
                </div>
                <Button onClick={() => { if (fromRoom && toRoom) setIndoorPath(bfsIndoor(fromRoom, toRoom, IND_GRAPH)) }}
                  disabled={!fromRoom || !toRoom}>
                  <Route size={15} />
                  Calculează
                </Button>
                {(fromRoom || toRoom) && (
                  <button onClick={() => { setFromRoom(''); setToRoom(''); setIndoorPath(null) }}
                    className="text-xs text-slate-400 hover:text-red-400 cursor-pointer transition-colors">
                    Resetează
                  </button>
                )}
              </div>
              {indoorPath && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-slate-400 flex items-center gap-1 flex-wrap">
                  <Route size={11} className="text-indigo-400 shrink-0 mr-0.5" />
                  {indoorPath.map((id, i) => {
                    const room = IND_ROOMS.find(r => r.id === id)
                    const label = room?.label ?? `Scară Et.${id.split('_')[1] === '0' ? 'P' : id.split('_')[1]}`
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
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-600" /><span>Start</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-600" /><span>Destinație</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-900 border border-blue-500/40" /><span>Pe traseu</span></div>
              <span className="ml-auto italic">Click pe sală = selectare rapidă</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic overlay */}
      <AnimatePresence>
        {cinematicMode && (() => {
          const currentStep = cinematicSteps[cinematicStep]
          const isLast = cinematicStep === cinematicSteps.length - 1
          return (
            <motion.div
              key="cinematic-overlay"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-[9998] px-3 pb-5 pt-2"
            >
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl bg-[#080d1a]/96 backdrop-blur-2xl border border-white/[0.12] shadow-2xl overflow-hidden">
                  {/* Progress bar */}
                  <div className="h-1 bg-white/[0.06]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      animate={{ width: `${((cinematicStep + 1) / cinematicSteps.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="p-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                          <Play size={10} fill="white" className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                          Guided Tour
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {cinematicStep + 1} / {cinematicSteps.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const next = !voiceEnabled
                            setVoiceEnabled(next)
                            if (!next) window.speechSynthesis?.cancel()
                            else speak(currentStep?.instruction, true)
                          }}
                          className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                          title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
                        >
                          {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                        </button>
                        <button
                          onClick={exitCinematicMode}
                          className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                          title="Exit tour"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Step content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={cinematicStep}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.22 }}
                        className="flex items-start gap-3 mb-4"
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          currentStep?.isFinal
                            ? 'bg-green-500/15 border border-green-500/25'
                            : 'bg-indigo-500/15 border border-indigo-500/20'
                        }`}>
                          {currentStep?.icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-sm font-semibold text-white leading-relaxed whitespace-pre-line">
                            {currentStep?.instruction}
                          </p>
                          {currentStep?.isFinal && (
                            <p className="text-xs text-green-400 mt-1 flex items-center gap-1.5">
                              <CheckCircle size={11} /> Destination reached
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goCinematicPrev}
                        disabled={cinematicStep === 0}
                        className="flex-1 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-25 border border-white/[0.07] text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ChevronLeft size={15} /> Back
                      </button>
                      {!isLast ? (
                        <button
                          onClick={goCinematicNext}
                          className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
                        >
                          Next <ChevronRight size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={exitCinematicMode}
                          className="flex-1 h-9 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
                        >
                          <CheckCircle size={14} /> Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Camera modal */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            key="camera-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 inset-x-0 z-10">
              <div>
                <p className="text-white font-semibold text-sm">AI Compass</p>
                <p className="text-white/50 text-xs">Fotografia devine context pentru ghidare</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={flipCamera}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
                  title="Schimbă camera"
                >
                  <FlipHorizontal size={18} className="text-white" />
                </button>
                <button
                  onClick={closeCamera}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Video stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Viewfinder overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-72 h-72">
                <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
              </div>
            </div>

            {/* Capture button */}
            <div className="absolute bottom-0 inset-x-0 pb-10 pt-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-3">
              <p className="text-white/60 text-xs">Poziționează clădirea în cadru</p>
              <button
                onClick={capturePhoto}
                className="w-18 h-18 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center"
                style={{ width: 72, height: 72 }}
              >
                <div className="w-14 h-14 rounded-full bg-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
