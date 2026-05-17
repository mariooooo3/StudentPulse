import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Camera, Upload, Sparkles, Send, X, Loader2, Navigation as NavIcon, Lightbulb, Route, ArrowRight, Users, Wifi, WifiOff, FlipHorizontal } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import HeatmapLayer from './HeatmapLayer'
import { useCrowdSocket } from '../../hooks/navigation/useCrowdSocket'
import { useAuth } from '../../app/providers/AuthContext'
import L from 'leaflet'
import { askCampusAI, analyzePhoto, getSmartRecommendations } from '../../services/navigation/campusAI'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { courses } from '../../shared/data/courses'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CAMPUS_CENTER = [47.1764, 27.5733]

const buildings = [
  { id: 1, name: 'Corp C - Informatică', distance: '350m', time: '5 min', type: 'Cursuri', coords: [47.1771, 27.5742] },
  { id: 2, name: 'Corp A - Matematică', distance: '520m', time: '7 min', type: 'Seminarii', coords: [47.1758, 27.5728] },
  { id: 3, name: 'Biblioteca Centrală', distance: '200m', time: '3 min', type: 'Studiu', coords: [47.1753, 27.5747] },
  { id: 4, name: 'Cantina Studențească', distance: '180m', time: '2 min', type: 'Servicii', coords: [47.1783, 27.5718] },
  { id: 5, name: 'Secretariat FII', distance: '400m', time: '5 min', type: 'Admin', coords: [47.1771, 27.5742] },
]

const POIS = [
  {
    id: 1, name: 'Magazin Petru Luca', type: 'Minimarket',
    lat: 47.1769, lng: 27.5757, emoji: '🛒', color: '#f97316',
    desc: 'Minimarket cu produse alimentare, snacks și băuturi reci.',
    rating: 4.2, hours: 'L–D: 07:00 – 22:00',
  },
  {
    id: 2, name: 'Farmacia Catena', type: 'Farmacie',
    lat: 47.1748, lng: 27.5737, emoji: '💊', color: '#22c55e',
    desc: 'Farmacia studenților — consultanță gratuită.',
    rating: 4.6, hours: 'L–V: 08:00–20:00 | S: 09:00–15:00',
  },
  {
    id: 3, name: 'Coffee Campus', type: 'Cafenea',
    lat: 47.1782, lng: 27.5722, emoji: '☕', color: '#8b5cf6',
    desc: 'Cafenea cozy cu Wi‑Fi gratuit și prize lângă fiecare loc.',
    rating: 4.5, hours: 'L–V: 07:30 – 19:00',
  },
  {
    id: 4, name: 'Profi Copou', type: 'Supermarket',
    lat: 47.1744, lng: 27.5768, emoji: '🏪', color: '#0ea5e9',
    desc: 'Supermarket complet la 5 minute de campus.',
    rating: 4.1, hours: 'L–D: 07:00 – 22:00',
  },
  {
    id: 5, name: 'ATM BRD Campus', type: 'ATM',
    lat: 47.1776, lng: 27.5730, emoji: '🏧', color: '#1d4ed8',
    desc: 'Bancomat gratuit pentru studenții BRD.',
    rating: null, hours: '24/7',
  },
  {
    id: 6, name: 'Kebab & Pizza Express', type: 'Fast-food',
    lat: 47.1762, lng: 27.5756, emoji: '🌯', color: '#ef4444',
    desc: 'Mâncare rapidă și ieftină. Livrare disponibilă.',
    rating: 4.0, hours: 'L–D: 10:00 – 24:00',
  },
  {
    id: 7, name: 'Librărie Universității', type: 'Librărie',
    lat: 47.1752, lng: 27.5720, emoji: '📚', color: '#92400e',
    desc: 'Cărți, suporturi de curs și rechizite pentru studenți.',
    rating: 4.3, hours: 'L–V: 09:00 – 18:00',
  },
  {
    id: 8, name: 'Copisterie FII', type: 'Copisterie',
    lat: 47.1774, lng: 27.5744, emoji: '🖨️', color: '#475569',
    desc: 'Printare, laminare și spiralare. Prețuri studențești.',
    rating: 4.4, hours: 'L–V: 08:00 – 17:00',
  },
]

function makePOIIcon(emoji, color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="
          width:36px;height:36px;
          background:${color};
          border:2.5px solid #fff;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:17px;
          box-shadow:0 2px 10px rgba(0,0,0,0.28);
        ">${emoji}</div>
        <div style="
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid ${color};
          margin-top:-1px;
        "></div>
      </div>`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -48],
  })
}

const FLOOR_Y = [455, 352, 264, 176, 88]
const STAIR_X = 510

const IND_ROOMS = [
  { id: 'secretariat', label: 'Secretariat', floor: 0, rx: 40, ry: 412, rw: 100, rh: 35, cx: 90 },
  { id: 'lab101', label: 'Lab 101', floor: 0, rx: 165, ry: 412, rw: 70, rh: 35, cx: 200 },
  { id: 'lab102', label: 'Lab 102', floor: 0, rx: 255, ry: 412, rw: 70, rh: 35, cx: 290 },
  { id: 'c2', label: 'C2 Aula', floor: 0, rx: 355, ry: 412, rw: 85, rh: 35, cx: 397 },
  { id: 'c112', label: 'C112', floor: 1, rx: 40, ry: 309, rw: 80, rh: 35, cx: 80 },
  { id: 'c118', label: 'C118', floor: 1, rx: 300, ry: 309, rw: 80, rh: 35, cx: 340 },
  { id: 'c210', label: 'C210', floor: 2, rx: 150, ry: 221, rw: 80, rh: 35, cx: 190 },
  { id: 'c308', label: 'C308', floor: 3, rx: 40, ry: 133, rw: 80, rh: 35, cx: 80 },
  { id: 'c315', label: 'C315', floor: 3, rx: 300, ry: 133, rw: 80, rh: 35, cx: 340 },
  { id: 'c420', label: 'C420 Amfiteatru', floor: 4, rx: 80, ry: 40, rw: 200, rh: 40, cx: 180 },
]

const IND_GRAPH = {
  secretariat: ['lab101', 'lab102', 'c2', 'stairs_0'],
  lab101: ['secretariat', 'lab102', 'c2', 'stairs_0'],
  lab102: ['secretariat', 'lab101', 'c2', 'stairs_0'],
  c2: ['secretariat', 'lab101', 'lab102', 'stairs_0'],
  stairs_0: ['secretariat', 'lab101', 'lab102', 'c2', 'stairs_1'],
  c112: ['c118', 'stairs_1'],
  c118: ['c112', 'stairs_1'],
  stairs_1: ['c112', 'c118', 'stairs_0', 'stairs_2'],
  c210: ['stairs_2'],
  stairs_2: ['c210', 'stairs_1', 'stairs_3'],
  c308: ['c315', 'stairs_3'],
  c315: ['c308', 'stairs_3'],
  stairs_3: ['c308', 'c315', 'stairs_2', 'stairs_4'],
  c420: ['stairs_4'],
  stairs_4: ['c420', 'stairs_3'],
}

function bfsIndoor(start, end) {
  if (start === end) return [start]
  const q = [[start]]
  const visited = new Set([start])
  while (q.length) {
    const path = q.shift()
    for (const next of IND_GRAPH[path[path.length - 1]] || []) {
      if (next === end) return [...path, next]
      if (!visited.has(next)) { visited.add(next); q.push([...path, next]) }
    }
  }
  return null
}

function indoorPathPoints(nodePath) {
  const pts = []
  for (let i = 0; i < nodePath.length; i++) {
    const id = nodePath[i]
    const room = IND_ROOMS.find(r => r.id === id)
    const cx = room ? room.cx : STAIR_X
    const cy = room ? FLOOR_Y[room.floor] : FLOOR_Y[parseInt(id.split('_')[1])]
    if (i === 0 && room) pts.push([room.cx, room.ry + room.rh / 2])
    pts.push([cx, cy])
    if (i === nodePath.length - 1 && room) pts.push([room.cx, room.ry + room.rh / 2])
  }
  return pts
}

function FlyTo({ coords }) {
  const map = useMap()
  if (coords) map.flyTo(coords, 17, { duration: 1.2 })
  return null
}

function FitRoute({ path }) {
  const map = useMap()
  useEffect(() => {
    if (path && path.length > 1) {
      map.fitBounds(L.latLngBounds(path), { padding: [50, 50], duration: 1 })
    }
  }, [path])
  return null
}

function makeLabel(letter, color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${letter}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export default function CampusNavigator() {
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [activeTab, setActiveTab] = useState('map')
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'Salut! Sunt asistentul tău de navigare pentru campusul UAIC. Cum te pot ajuta?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [photoResult, setPhotoResult] = useState(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [pulseData, setPulseData] = useState(null)
  const [pulseLoading, setPulseLoading] = useState(false)
  const [pulseLoaded, setPulseLoaded] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraFacing, setCameraFacing] = useState('environment')
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const chatBottomRef = useRef(null)
  const chatHistory = useRef([])
  const [fromRoom, setFromRoom] = useState('')
  const [toRoom, setToRoom] = useState('')
  const [indoorPath, setIndoorPath] = useState(null)

  const [showCrowd, setShowCrowd] = useState(false)
  const { zones, totalUsers, connected, mode } = useCrowdSocket(showCrowd)

  const { profile } = useAuth()
  const firstName = profile?.name?.split(' ')[0] ?? 'Student'

  useEffect(() => {
    if (activeTab !== 'reco' || pulseLoaded) return
    loadPulse()
  }, [activeTab])

  useEffect(() => {
    if (cameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraOpen, cameraStream])

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

  const [showPOI, setShowPOI] = useState(false)
  const poiIcons = useRef({})
  function getPoiIcon(poi) {
    if (!poiIcons.current[poi.id]) {
      poiIcons.current[poi.id] = makePOIIcon(poi.emoji, poi.color)
    }
    return poiIcons.current[poi.id]
  }

  const [routeFrom, setRouteFrom] = useState('')
  const [routeTo, setRouteTo] = useState('')
  const [routePath, setRoutePath] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)

  async function fetchRoute() {
    const from = buildings.find(b => String(b.id) === routeFrom)
    const to = buildings.find(b => String(b.id) === routeTo)
    if (!from || !to) return
    setRouteLoading(true)
    setRoutePath(null)
    setRouteInfo(null)
    try {
      const [lat1, lon1] = from.coords
      const [lat2, lon2] = to.coords
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`
      )
      const data = await res.json()
      if (data.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        setRoutePath(coords)
        const dist = data.routes[0].distance
        const dur = Math.ceil(data.routes[0].duration / 60)
        setRouteInfo({ distance: dist < 1000 ? `${Math.round(dist)}m` : `${(dist/1000).toFixed(1)}km`, duration: `${dur} min` })
      }
    } catch {
      setRoutePath([from.coords, to.coords])
      setRouteInfo({ distance: from.distance, duration: from.time })
    }
    setRouteLoading(false)
  }

  async function sendChat(e) {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)

    try {
      const response = await askCampusAI(userMsg, chatHistory.current)
      chatHistory.current = [
        ...chatHistory.current,
        { role: 'user', content: userMsg },
        { role: 'assistant', content: response },
      ]
      setChatMessages((prev) => [...prev, { role: 'model', text: response }])
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: 'model', text: `Eroare: ${err.message}` }])
    }
    setChatLoading(false)
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      setPhotoPreview(dataUrl)
      setPhotoResult(null)
      setPhotoLoading(true)

      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type

      try {
        const result = await analyzePhoto(base64, mimeType)
        setPhotoResult(result)
      } catch (err) {
        setPhotoResult(`Eroare: ${err.message}`)
      }
      setPhotoLoading(false)
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
    setPhotoPreview(dataUrl)
    setPhotoResult(null)
    setPhotoLoading(true)
    analyzePhoto(dataUrl.split(',')[1], 'image/jpeg')
      .then(r => setPhotoResult(r))
      .catch(e => setPhotoResult(`Eroare: ${e.message}`))
      .finally(() => setPhotoLoading(false))
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Navigator Campus</h1>
        <p className="text-slate-400 mt-1">Hartă, AI chat și recunoaștere vizuală.</p>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'map', label: 'Hartă', icon: MapPin },
          { id: 'chat', label: 'AI Chat', icon: Sparkles },
          { id: 'photo', label: 'Recunoaștere Poză', icon: Camera },
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

      <AnimatePresence mode="wait">
        {activeTab === 'map' && (
          <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4">

            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Route size={15} className="text-indigo-400" /> Calculează traseu
              </h2>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-36">
                  <label className="text-xs text-slate-400 mb-1 block">De la</label>
                  <select value={routeFrom} onChange={e => { setRouteFrom(e.target.value); setRoutePath(null) }}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] text-slate-200 text-sm border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Alege punct de start...</option>
                    {buildings.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>)}
                  </select>
                </div>
                <ArrowRight size={16} className="text-slate-400 mb-2 shrink-0" />
                <div className="flex-1 min-w-36">
                  <label className="text-xs text-slate-400 mb-1 block">La</label>
                  <select value={routeTo} onChange={e => { setRouteTo(e.target.value); setRoutePath(null) }}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] text-slate-200 text-sm border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
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
                  className="mt-3 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <NavIcon size={14} /> {routeInfo.distance}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">~{routeInfo.duration} pe jos</span>
                  <span className="ml-auto text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded-lg">
                    Traseu calculat
                  </span>
                </motion.div>
              )}
            </div>

            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] px-4 py-3 flex flex-wrap items-center gap-4">
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
                <div className="rounded-2xl overflow-hidden border border-white/[0.06] relative" style={{ height: 460 }}>
                  <MapContainer center={CAMPUS_CENTER} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {showCrowd && <HeatmapLayer zones={zones} />}

                    {showPOI && POIS.map(poi => (
                      <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={getPoiIcon(poi)}>
                        <Popup minWidth={210}>
                          <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <span style={{ fontSize: 26, lineHeight: 1 }}>{poi.emoji}</span>
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
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {buildings.map((b) => (
                      <Marker key={b.id} position={b.coords} eventHandlers={{ click: () => setSelectedBuilding(b) }}>
                        <Popup><strong>{b.name}</strong><br />{b.distance} • {b.time}</Popup>
                      </Marker>
                    ))}

                    {routePath && (() => {
                      const from = buildings.find(b => String(b.id) === routeFrom)
                      const to = buildings.find(b => String(b.id) === routeTo)
                      return <>
                        <Marker position={from.coords} icon={makeLabel('A', '#2563eb')} />
                        <Marker position={to.coords} icon={makeLabel('B', '#16a34a')} />
                      </>
                    })()}

                    {routePath && <>
                      <Polyline positions={routePath} color="#f97316" weight={6} opacity={0.25} />
                      <Polyline positions={routePath} color="#ffffff" weight={4} opacity={0.8} />
                      <Polyline positions={routePath} color="#f97316" weight={3} opacity={1} dashArray="10 6" />
                    </>}

                    <FlyTo coords={!routePath ? selectedBuilding?.coords : null} />
                    <FitRoute path={routePath} />
                  </MapContainer>

                  {selectedBuilding && !routePath && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 left-4 right-4 bg-[#0c1120] rounded-xl shadow-lg p-4 border border-white/[0.07] z-[1000]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{selectedBuilding.name}</p>
                          <p className="text-xs text-slate-400">{selectedBuilding.distance} • {selectedBuilding.time}</p>
                        </div>
                        <div className="flex gap-2">
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

              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-white">Destinații</h2>
                {buildings.map((building) => (
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
            className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden h-[520px] flex flex-col">
            <div className="p-4 border-b border-white/[0.05] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Campus Assistant</p>
                <p className="text-xs text-slate-500">Powered by Groq / Llama</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {chatMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-white/[0.05] text-slate-200 rounded-bl-md'
                    }`}>
                      {msg.text}
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

            <form onSubmit={sendChat} className="p-4 border-t border-white/[0.05]">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Unde e sala C310? Cum ajung la cantină?..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] text-slate-200 border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm placeholder:text-slate-600"
                />
                <button type="submit" disabled={!chatInput.trim() || chatLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'photo' && (
          <motion.div key="photo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white">Recunoaștere Vizuală</h2>
              <p className="text-sm text-slate-400 mt-1">Fă o poză la o clădire și AI-ul îți spune unde ești și cum navighezi.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-900/10 transition-all group"
              >
                <Upload size={28} className="text-slate-500 group-hover:text-indigo-400 mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-slate-200">Alege poză</p>
                <p className="text-xs text-slate-500 mt-1">Din galerie / fișiere</p>
              </div>
              <div
                onClick={() => openCamera()}
                className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-900/10 transition-all group"
              >
                <Camera size={28} className="text-slate-500 group-hover:text-violet-400 mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-slate-200">Fă o poză</p>
                <p className="text-xs text-slate-500 mt-1">Cu camera live</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

            {photoPreview && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <img src={photoPreview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl border border-white/[0.06]" />
                {photoLoading ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30">
                    <Loader2 size={18} className="animate-spin text-indigo-400" />
                    <span className="text-sm text-indigo-300">AI analizează imaginea...</span>
                  </div>
                ) : photoResult ? (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={15} className="text-indigo-400" />
                      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Analiză AI</p>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{photoResult}</p>
                  </div>
                ) : null}
              </motion.div>
            )}
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
            { label: 'Cel mai scurt traseu', icon: '🛤️', q: 'Care e cel mai scurt traseu de la intrarea principală la Biblioteca Centrală?' },
            { label: 'ATM sau bancă?',       icon: '🏧', q: 'Unde e cel mai apropiat ATM de Corp C?' },
            { label: 'Secretariatul?',       icon: '📋', q: 'Secretariatul FII e deschis acum? Unde se află?' },
            { label: 'O cafea rapidă',       icon: '☕', q: 'Unde fac o cafea rapidă lângă campus?' },
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
                    <button key={chip.label} onClick={() => sendQuickChat(chip.q)}
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
            </motion.div>
          )
        })()}

        {activeTab === 'indoor' && (
          <motion.div key="indoor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4">
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white">Navigare interioară – Corp C</h2>
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
                <Button onClick={() => { if (fromRoom && toRoom) setIndoorPath(bfsIndoor(fromRoom, toRoom)) }}
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
                        if (!fromRoom) { setFromRoom(room.id); setIndoorPath(null) }
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
                  const pts = indoorPathPoints(indoorPath)
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
                <p className="text-white font-semibold text-sm">Recunoaștere vizuală</p>
                <p className="text-white/50 text-xs">Îndreaptă camera spre o clădire</p>
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
