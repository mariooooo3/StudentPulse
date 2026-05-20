import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Camera, Sparkles, Send, X, Loader2, Navigation as NavIcon, Lightbulb, Route, ArrowRight, Users, Wifi, WifiOff, FlipHorizontal, ImagePlus, Play, CheckCircle, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import HeatmapLayer from './HeatmapLayer'
import { useCrowdSocket } from '../../hooks/navigation/useCrowdSocket'
import { useAuth } from '../../app/providers/AuthContext'
import L from 'leaflet'
import { askCampusAI, askRecoAI, askCampusCopilot, analyzePhoto, getSmartRecommendations } from '../../services/navigation/campusAI'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { courses } from '../../shared/data/courses'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ROUTE_PROFILES = {
  foot: {
    label: 'Pe jos',
    osrmProfile: 'foot',
    durationLabel: 'pe jos',
    fallbackSpeedKmh: 4.8,
  },
  driving: {
    label: 'Cu masina',
    osrmProfile: 'driving',
    durationLabel: 'cu masina',
    fallbackSpeedKmh: 24,
  },
}

function formatDistance(meters) {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`
}

function haversineMeters(a, b) {
  const toRad = value => value * Math.PI / 180
  const [lat1, lon1] = a
  const [lat2, lon2] = b
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLon / 2)
  const h = s1 * s1 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2 * s2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function fallbackRouteInfo(from, to, profile) {
  const distance = haversineMeters(from.coords, to.coords)
  const duration = Math.max(1, Math.ceil((distance / 1000) / profile.fallbackSpeedKmh * 60))
  return { distance: formatDistance(distance), duration: `${duration} min`, mode: profile.label }
}

function routeDistance(path) {
  return path.slice(1).reduce((total, point, index) => total + haversineMeters(path[index], point), 0)
}

function nearestWalkNode(nodes, coords) {
  return nodes.reduce((best, node) => {
    const distance = haversineMeters(coords, node.coords)
    return !best || distance < best.distance ? { ...node, distance } : best
  }, null)
}

function dijkstraWalkPath(nodes, edges, startId, endId) {
  const nodeIds = nodes.map(node => node.id)
  const distances = Object.fromEntries(nodeIds.map(id => [id, Infinity]))
  const previous = {}
  const unvisited = new Set(nodeIds)
  distances[startId] = 0

  while (unvisited.size) {
    const current = [...unvisited].sort((a, b) => distances[a] - distances[b])[0]
    if (!current || distances[current] === Infinity) break
    unvisited.delete(current)
    if (current === endId) break

    for (const edge of edges.filter(([a, b]) => a === current || b === current)) {
      const neighbor = edge[0] === current ? edge[1] : edge[0]
      if (!unvisited.has(neighbor)) continue
      const weight = edge[2] || haversineMeters(
        nodes.find(node => node.id === current).coords,
        nodes.find(node => node.id === neighbor).coords,
      )
      const nextDistance = distances[current] + weight
      if (nextDistance < distances[neighbor]) {
        distances[neighbor] = nextDistance
        previous[neighbor] = current
      }
    }
  }

  if (startId !== endId && !previous[endId]) return null
  const path = [endId]
  while (path[0] !== startId) path.unshift(previous[path[0]])
  return path
}

function buildCampusWalkRoute(campus, from, to) {
  if (!campus.walkNodes?.length || !campus.walkEdges?.length) return null
  const start = nearestWalkNode(campus.walkNodes, from.coords)
  const end = nearestWalkNode(campus.walkNodes, to.coords)
  if (!start || !end) return null

  const nodePath = dijkstraWalkPath(campus.walkNodes, campus.walkEdges, start.id, end.id)
  if (!nodePath) return null

  const nodeById = Object.fromEntries(campus.walkNodes.map(node => [node.id, node]))
  const path = [
    from.coords,
    ...nodePath.map(id => nodeById[id].coords),
    to.coords,
  ]
  const distance = routeDistance(path)
  const duration = Math.max(1, Math.ceil((distance / 1000) / ROUTE_PROFILES.foot.fallbackSpeedKmh * 60))
  return {
    path,
    info: { distance: formatDistance(distance), duration: `${duration} min`, mode: ROUTE_PROFILES.foot.label, source: 'campus-walk' },
  }
}

// ─── TUIASI – Bd. Prof. Dimitrie Mangeron 67, Iași ───────────────────────────
const TUIASI_CENTER = [47.153886, 27.593992]

const TUIASI_BUILDINGS = [
  { id: 1,  name: 'Facultatea de Automatică și Calculatoare (AC)', distance: '0m',    time: '-',      type: 'Cursuri',  coords: [47.153886, 27.593992] },
  { id: 2,  name: 'Corp A – Departamentul Automatică',             distance: '80m',   time: '1 min',  type: 'Cursuri',  coords: [47.154232, 27.593145] },
  { id: 3,  name: 'Biblioteca Gh. Asachi',                         distance: '650m',  time: '9 min',  type: 'Studiu',   coords: [47.157030, 27.590140] },
  { id: 4,  name: 'Cantina TUIASI – Tudor Vladimirescu',           distance: '1.3km', time: '17 min', type: 'Servicii', coords: [47.154484, 27.609974] },
  { id: 5,  name: 'Secretariat AC',                                distance: '30m',   time: '1 min',  type: 'Admin',    coords: [47.153886, 27.593992] },
  { id: 6,  name: 'Facultatea ETTI – Bd. Carol I nr. 11A',         distance: '2.8km', time: '35 min', type: 'Cursuri',  coords: [47.174798, 27.571092] },
  { id: 7,  name: 'Rectorat TUIASI',                               distance: '480m',  time: '7 min',  type: 'Admin',    coords: [47.154639, 27.599747] },
  { id: 8,  name: 'Facultatea IEEIA',                              distance: '370m',  time: '5 min',  type: 'Cursuri',  coords: [47.153401, 27.596641] },
  { id: 9,  name: 'Facultatea de Mecanică',                        distance: '200m',  time: '3 min',  type: 'Cursuri',  coords: [47.154029, 27.597939] },
  { id: 10, name: 'Facultatea de Construcții și Instalații',       distance: '290m',  time: '4 min',  type: 'Cursuri',  coords: [47.152241, 27.589035] },
  { id: 11, name: 'Facultatea de Inginerie Chimica si Protectia Mediului „C. Simionescu"', distance: '1.0km', time: '13 min', type: 'Cursuri', coords: [47.155607, 27.603028] },
  { id: 12, name: 'Facultatea de Arhitectură „G.M. Cantacuzino"',  distance: '450m',  time: '6 min',  type: 'Cursuri',  coords: [47.152718, 27.589454] },
  { id: 13, name: 'Facultatea CMMI',                               distance: '240m',  time: '4 min',  type: 'Cursuri',  coords: [47.153802, 27.596924] },
  { id: 14, name: 'Facultatea HGIM',                               distance: '230m',  time: '4 min',  type: 'Cursuri',  coords: [47.155052, 27.599888] },
  { id: 15, name: 'Facultatea SIM',                                distance: '210m',  time: '3 min',  type: 'Cursuri',  coords: [47.154814, 27.597532] },
  { id: 16, name: 'Facultatea DIMA / Textile si Management Industrial', distance: '140m', time: '2 min', type: 'Cursuri', coords: [47.153434, 27.595632] },
]

const TUIASI_POIS = [
  { id: 1,  name: 'Magazin Petru',                    type: 'Minimarket', lat: 47.15378, lng: 27.59570, short: 'PET',  color: '#f97316', desc: 'Minimarket frecventat de studenți – alimente, snacks, băuturi, rechizite.', rating: 4.3, hours: 'L-D: 07:00-22:00' },
  { id: 2,  name: 'Magazin Luca',                     type: 'Minimarket', lat: 47.15440, lng: 27.59600, short: 'LUC',  color: '#fb923c', desc: 'Minimarket de proximitate lângă complexul AC, ideal pentru pauze scurte.', rating: 4.1, hours: 'L-D: 07:00-21:00' },
  { id: 3,  name: 'Iulius Mall Iași',                 type: 'Mall',       lat: 47.155289, lng: 27.605741, short: 'MALL', color: '#8b5cf6', desc: 'Restaurante, Cinema City, supermarket și acces rapid din campusul Tudor Vladimirescu.', rating: 4.7, hours: 'L-D: 10:00-22:00' },
  { id: 4,  name: 'Complex Cămine Tudor Vladimirescu', type: 'Cămin',     lat: 47.154900, lng: 27.608900, short: 'TUD',  color: '#64748b', desc: 'Campus TUIASI cu 21 de cămine și ~8.000 locuri de cazare.', rating: 4.0, hours: '24/7' },
  { id: 5,  name: 'Cantina TUIASI',                   type: 'Cantina',    lat: 47.154484, lng: 27.609974, short: 'CAN',  color: '#ea580c', desc: 'Cantina oficială din campus, Aleea Prof. Vasile Petrescu nr. 29. Program L-V 11:00-19:00.', rating: 4.4, hours: 'L-V: 11:00-19:00' },
  { id: 6,  name: 'Cămine T1–T4',                     type: 'Cămin',      lat: 47.155650, lng: 27.607450, short: 'T1',   color: '#475569', desc: 'Primele cămine ale campusului Tudor Vladimirescu, aproape de zona centrală.', rating: 3.9, hours: '24/7' },
  { id: 7,  name: 'Cămine T5–T11',                    type: 'Cămin',      lat: 47.154950, lng: 27.609450, short: 'T5',   color: '#475569', desc: 'Zonă cu cămine, parc, spații de recreere și acces rapid la cantina.', rating: 4.0, hours: '24/7' },
  { id: 8,  name: 'Cămine T12–T17',                   type: 'Cămin',      lat: 47.153900, lng: 27.610600, short: 'T12',  color: '#475569', desc: 'Grup de cămine în campusul Tudor Vladimirescu, aproape de Iulius Mall.', rating: 4.0, hours: '24/7' },
  { id: 9,  name: 'Cămine T18–T19 / DSS',             type: 'Cămin',      lat: 47.153250, lng: 27.611700, short: 'DSS',  color: '#334155', desc: 'Cămine T18–T19 și Direcția Servicii Studențești, parter. DSS L-V 07:00-15:00.', rating: 4.0, hours: '24/7' },
  { id: 10, name: 'Biblioteca Facultății AC',          type: 'Biblioteca', lat: 47.153920, lng: 27.593900, short: 'BIB',  color: '#f59e0b', desc: 'Sală de lectură și bibliotecă proprie a Facultății AC, în complexul Corp C.', rating: 4.3, hours: 'L-V: 09:00-17:00' },
  { id: 11, name: 'ATM BRD Mangeron',                 type: 'ATM',        lat: 47.153780, lng: 27.594220, short: 'ATM',  color: '#1d4ed8', desc: 'Bancomat BRD la intrarea principală a complexului AC.', rating: null, hours: '24/7' },
  { id: 12, name: 'Farmacie Dacia',                   type: 'Farmacie',   lat: 47.153620, lng: 27.596300, short: 'RX',   color: '#22c55e', desc: 'Farmacie pe Bd. Mangeron, la câteva minute de facultate.', rating: 4.4, hours: 'L-V: 08:00-20:00 | S: 09:00-15:00' },
  { id: 13, name: 'Copisterie Mangeron',               type: 'Copisterie', lat: 47.153760, lng: 27.594360, short: 'PRN',  color: '#475569', desc: 'Printare, laminare și spiralare lângă AC.', rating: 4.3, hours: 'L-V: 08:00-17:00' },
]

const TUIASI_IND_ROOMS = [
  { id: 'secretariat-ac', label: 'Secretariat AC',  floor: 0, rx: 40,  ry: 412, rw: 110, rh: 35, cx: 95  },
  { id: 'amf-ac0-1',      label: 'Amf. AC0-1',      floor: 0, rx: 170, ry: 412, rw: 100, rh: 35, cx: 220 },
  { id: 'lab-a0-1',       label: 'Lab. A0-1',        floor: 0, rx: 290, ry: 412, rw: 80,  rh: 35, cx: 330 },
  { id: 'sala-ac0-2',     label: 'Sala AC0-2',       floor: 0, rx: 390, ry: 412, rw: 80,  rh: 35, cx: 430 },
  { id: 'lab-c1-1',       label: 'Lab. C1-1',        floor: 1, rx: 40,  ry: 309, rw: 90,  rh: 35, cx: 85  },
  { id: 'lab-c1-2',       label: 'Lab. C1-2',        floor: 1, rx: 300, ry: 309, rw: 90,  rh: 35, cx: 345 },
  { id: 'lab-c2-1',       label: 'Lab. C2-1',        floor: 2, rx: 150, ry: 221, rw: 90,  rh: 35, cx: 195 },
  { id: 'birou-c2-5',     label: 'Birou C2-5',       floor: 2, rx: 270, ry: 221, rw: 80,  rh: 35, cx: 310 },
  { id: 'lab-a3-1',       label: 'Lab. A3-1 (DAIA)', floor: 3, rx: 40,  ry: 133, rw: 100, rh: 35, cx: 90  },
  { id: 'sala-a3-2',      label: 'Sala A3-2',        floor: 3, rx: 300, ry: 133, rw: 80,  rh: 35, cx: 340 },
  { id: 'sala-conf',      label: 'Sala Conferințe',  floor: 4, rx: 80,  ry: 40,  rw: 200, rh: 40, cx: 180 },
]

const TUIASI_IND_GRAPH = {
  'secretariat-ac': ['amf-ac0-1', 'lab-a0-1', 'sala-ac0-2', 'stairs_0'],
  'amf-ac0-1':      ['secretariat-ac', 'lab-a0-1', 'stairs_0'],
  'lab-a0-1':       ['secretariat-ac', 'amf-ac0-1', 'sala-ac0-2', 'stairs_0'],
  'sala-ac0-2':     ['secretariat-ac', 'lab-a0-1', 'stairs_0'],
  stairs_0:         ['secretariat-ac', 'amf-ac0-1', 'lab-a0-1', 'sala-ac0-2', 'stairs_1'],
  'lab-c1-1':       ['lab-c1-2', 'stairs_1'],
  'lab-c1-2':       ['lab-c1-1', 'stairs_1'],
  stairs_1:         ['lab-c1-1', 'lab-c1-2', 'stairs_0', 'stairs_2'],
  'lab-c2-1':       ['birou-c2-5', 'stairs_2'],
  'birou-c2-5':     ['lab-c2-1', 'stairs_2'],
  stairs_2:         ['lab-c2-1', 'birou-c2-5', 'stairs_1', 'stairs_3'],
  'lab-a3-1':       ['sala-a3-2', 'stairs_3'],
  'sala-a3-2':      ['lab-a3-1', 'stairs_3'],
  stairs_3:         ['lab-a3-1', 'sala-a3-2', 'stairs_2', 'stairs_4'],
  'sala-conf':      ['stairs_4'],
  stairs_4:         ['sala-conf', 'stairs_3'],
}

const TUIASI_ROUTE_IDS = {
  'corp-c': '1', ac: '1', automatica: '1',
  'corp-a': '2', daia: '2',
  library: '3', biblioteca: '3',
  canteen: '4', cantina: '4',
  secretariat: '5', 'secretariat-ac': '5',
  etti: '6',
  rectorat: '7',
  ieeia: '8',
  mec: '9', mecanica: '9',
  ci: '10', constructii: '10',
  icpm: '11', chimie: '11',
  arh: '12', arhitectura: '12',
  cmmi: '13',
  hgim: '14',
  sim: '15',
  dima: '16',
}

const TUIASI_WALK_NODES = [
  { id: 'constructii', coords: [47.152241, 27.589035] },
  { id: 'arh', coords: [47.152718, 27.589454] },
  { id: 'library', coords: [47.157030, 27.590140] },
  { id: 'corp-a', coords: [47.154232, 27.593145] },
  { id: 'ieeia', coords: [47.153401, 27.596641] },
  { id: 'ac', coords: [47.153886, 27.593992] },
  { id: 'cmmi', coords: [47.153802, 27.596924] },
  { id: 'sim', coords: [47.154814, 27.597532] },
  { id: 'mec', coords: [47.154029, 27.597939] },
  { id: 'icpm', coords: [47.155607, 27.603028] },
  { id: 'dima', coords: [47.153434, 27.595632] },
  { id: 'rectorat', coords: [47.154639, 27.599747] },
  { id: 'hgim', coords: [47.155052, 27.599888] },
  { id: 'tudor-entry', coords: [47.154600, 27.603500] },
  { id: 'mall', coords: [47.155289, 27.605741] },
  { id: 'dorms-north', coords: [47.155650, 27.607450] },
  { id: 'dorms-center', coords: [47.154950, 27.609450] },
  { id: 'canteen', coords: [47.154484, 27.609974] },
  { id: 'dorms-south', coords: [47.153900, 27.610600] },
  { id: 'copou-hub', coords: [47.175000, 27.572000] },
  { id: 'etti', coords: [47.174798, 27.571092] },
]

const TUIASI_WALK_EDGES = [
  ['constructii', 'arh'],
  ['arh', 'corp-a'],
  ['constructii', 'ieeia'],
  ['library', 'corp-a'],
  ['corp-a', 'ac'],
  ['ieeia', 'ac'],
  ['ac', 'cmmi'],
  ['cmmi', 'sim'],
  ['sim', 'mec'],
  ['mec', 'icpm'],
  ['icpm', 'dima'],
  ['dima', 'rectorat'],
  ['rectorat', 'hgim'],
  ['rectorat', 'tudor-entry'],
  ['tudor-entry', 'mall'],
  ['mall', 'dorms-north'],
  ['mall', 'dorms-center'],
  ['dorms-center', 'canteen'],
  ['canteen', 'dorms-south'],
  ['dorms-center', 'dorms-south'],
  ['library', 'copou-hub'],
  ['copou-hub', 'etti'],
]

const TUIASI_AI_DESTINATIONS = [
  { label: 'C210', query: 'Vreau să ajung la sala C210', type: 'Sală' },
  { label: 'C308', query: 'Vreau să ajung la sala C308', type: 'Sală' },
  { label: 'Secretariat', query: 'Vreau să ajung la Secretariatul AC', type: 'Admin' },
  { label: 'Biblioteca', query: 'Cum ajung la Biblioteca Gh. Asachi?', type: 'Campus' },
  { label: 'Cantina', query: 'Cum ajung la cantina TUIASI?', type: 'Campus' },
  { label: 'Corp A', query: 'Cum ajung la Corp A de la AC?', type: 'Campus' },
  { label: 'AC', query: 'Cum ajung la Facultatea de Automatica si Calculatoare?', type: 'Facultate' },
  { label: 'ETTI', query: 'Cum ajung la Facultatea ETTI?', type: 'Facultate' },
  { label: 'IEEIA', query: 'Cum ajung la Facultatea IEEIA?', type: 'Facultate' },
  { label: 'Mecanica', query: 'Cum ajung la Facultatea de Mecanica?', type: 'Facultate' },
  { label: 'Constructii', query: 'Cum ajung la Facultatea de Constructii si Instalatii?', type: 'Facultate' },
  { label: 'Chimie', query: 'Cum ajung la Facultatea de Inginerie Chimica si Protectia Mediului?', type: 'Facultate' },
  { label: 'Arhitectura', query: 'Cum ajung la Facultatea de Arhitectura?', type: 'Facultate' },
  { label: 'CMMI', query: 'Cum ajung la Facultatea CMMI?', type: 'Facultate' },
  { label: 'HGIM', query: 'Cum ajung la Facultatea HGIM?', type: 'Facultate' },
  { label: 'SIM', query: 'Cum ajung la Facultatea SIM?', type: 'Facultate' },
  { label: 'DIMA', query: 'Cum ajung la Facultatea DIMA?', type: 'Facultate' },
  { label: 'Rectorat', query: 'Cum ajung la Rectoratul TUIASI?', type: 'Admin' },
]

// ─── UAIC – Bd. Carol I nr. 11, Iași ─────────────────────────────────────────
const UAIC_CENTER = [47.174207, 27.571376]

const UAIC_BUILDINGS = [
  { id: 1,  name: 'Corp A - Universitatea Alexandru Ioan Cuza',     distance: '0m',    time: '-',      type: 'Admin',   coords: [47.174207, 27.571376] },
  { id: 2,  name: 'Facultatea de Informatica - FII',                distance: '350m',  time: '5 min',  type: 'Cursuri', coords: [47.173984, 27.574863] },
  { id: 3,  name: 'Facultatea de Matematica',                       distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 4,  name: 'Facultatea de Fizica',                           distance: '190m',  time: '3 min',  type: 'Cursuri', coords: [47.175112, 27.573861] },
  { id: 5,  name: 'Facultatea de Chimie',                           distance: '190m',  time: '3 min',  type: 'Cursuri', coords: [47.175112, 27.573861] },
  { id: 6,  name: 'Facultatea de Biologie',                         distance: '190m',  time: '3 min',  type: 'Cursuri', coords: [47.175112, 27.573861] },
  { id: 7,  name: 'Facultatea de Drept',                            distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 8,  name: 'Facultatea de Litere',                           distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 9,  name: 'Facultatea de Filosofie si Stiinte Social-Politice', distance: '0m', time: '-', type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 10, name: 'Facultatea de Psihologie si Stiinte ale Educatiei', distance: '650m', time: '9 min', type: 'Cursuri', coords: [47.173648, 27.564996] },
  { id: 11, name: 'Facultatea de Economie si Administrarea Afacerilor - FEAA', distance: '350m', time: '5 min', type: 'Cursuri', coords: [47.172152, 27.574391] },
  { id: 12, name: 'Facultatea de Geografie si Geologie',             distance: '190m',  time: '3 min',  type: 'Cursuri', coords: [47.175112, 27.573861] },
  { id: 13, name: 'Biblioteca Centrala Mihai Eminescu - BCU',        distance: '350m',  time: '5 min',  type: 'Studiu',  coords: [47.170261, 27.575235] },
  { id: 14, name: 'Secretariat FII',                                distance: '350m',  time: '5 min',  type: 'Admin',   coords: [47.173984, 27.574863] },
  { id: 15, name: 'Camine Codrescu',                                distance: '500m',  time: '7 min',  type: 'Camin',   coords: [47.177743, 27.573077] },
  { id: 16, name: 'Facultatea de Istorie',                          distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 17, name: 'Facultatea de Teologie Ortodoxa',                distance: '1.5km', time: '20 min', type: 'Cursuri', coords: [47.162385, 27.580734] },
  { id: 18, name: 'Facultatea de Educatie Fizica si Sport',         distance: '650m',  time: '9 min',  type: 'Cursuri', coords: [47.173648, 27.564996] },
  { id: 19, name: 'Facultatea de Teologie Romano-Catolica',         distance: '0m',    time: '-',      type: 'Cursuri', coords: [47.174207, 27.571376] },
  { id: 20, name: 'Cantina Titu Maiorescu UAIC',                    distance: '200m',  time: '3 min',  type: 'Servicii', coords: [47.174453, 27.569726] },
]

const UAIC_POIS = [
  { id: 1,  name: 'Cantina Titu Maiorescu UAIC',        type: 'Cantina',    lat: 47.174453, lng: 27.569726, short: 'CAN', color: '#ea580c', desc: 'Cantina UAIC din zona Titu Maiorescu, folosita frecvent de studenti.', rating: 4.2, hours: 'L-V: 11:00-19:00' },
  { id: 2,  name: 'ATM BRD (Bd. Carol I)',              type: 'ATM',        lat: 47.174207, lng: 27.571376, short: 'ATM', color: '#1d4ed8', desc: 'Bancomat in zona corpului principal UAIC.', rating: null, hours: '24/7' },
  { id: 3,  name: 'Cafenea Studenteasca FII',           type: 'Cafenea',    lat: 47.173984, lng: 27.574863, short: 'CAF', color: '#92400e', desc: 'Cafenea in zona Facultatii de Informatica, buna pentru pauze intre cursuri.', rating: 4.5, hours: 'L-V: 08:00-18:00' },
  { id: 4,  name: 'Copisterie Carol I',                 type: 'Copisterie', lat: 47.173984, lng: 27.574863, short: 'PRN', color: '#475569', desc: 'Printare, copiere si spiralare in zona FII / Carol I.', rating: 4.3, hours: 'L-V: 08:00-17:00' },
  { id: 5,  name: 'Farmacie Salvator (Bd. Carol I)',    type: 'Farmacie',   lat: 47.175112, lng: 27.573861, short: 'RX',  color: '#22c55e', desc: 'Farmacie pe Bd. Carol I, la cateva minute de universitate.', rating: 4.4, hours: 'L-V: 08:00-20:00 | S: 09:00-15:00' },
  { id: 6,  name: 'Piata Unirii',                       type: 'Reper',      lat: 47.166901, lng: 27.580523, short: 'UNI', color: '#7c3aed', desc: 'Nod central pentru transport, cafenele, banci si acces spre centru.', rating: 4.8, hours: '24/7' },
  { id: 7,  name: 'Camine Codrescu',                    type: 'Camin',      lat: 47.177743, lng: 27.573077, short: 'COD', color: '#64748b', desc: 'Complex de camine UAIC din zona Codrescu.', rating: 4.0, hours: '24/7' },
  { id: 8,  name: 'Biblioteca Centrala BCU',            type: 'Biblioteca', lat: 47.170261, lng: 27.575235, short: 'BCU', color: '#f59e0b', desc: 'Biblioteca Centrala Universitara Mihai Eminescu. Program L-V 09:00-20:00.', rating: 4.6, hours: 'L-V: 09:00-20:00 | S: 09:00-14:00' },
  { id: 9,  name: 'Minimarket Profi (Bd. Carol I)',     type: 'Minimarket', lat: 47.175112, lng: 27.573861, short: 'PRO', color: '#f97316', desc: 'Minimarket in zona Carol I pentru produse zilnice.', rating: 4.2, hours: 'L-D: 07:00-22:00' },
  { id: 10, name: 'Parcul Copou',                       type: 'Parc',       lat: 47.18158, lng: 27.57243, short: 'CPO', color: '#16a34a', desc: 'Parcul Copou - Teiul lui Eminescu si zone de studiu outdoor.', rating: 4.9, hours: '24/7' },
]

const UAIC_IND_ROOMS = [
  { id: 'secretariat-fii', label: 'Secretariat FII',   floor: 0, rx: 40,  ry: 412, rw: 110, rh: 35, cx: 95  },
  { id: 'amf-otelea',      label: 'Amf. „E. Otelea"',  floor: 0, rx: 170, ry: 412, rw: 100, rh: 35, cx: 220 },
  { id: 'lab-info-0',      label: 'Lab. Info 0-1',      floor: 0, rx: 290, ry: 412, rw: 80,  rh: 35, cx: 330 },
  { id: 'sala-info-0',     label: 'Sala Info 0-2',      floor: 0, rx: 390, ry: 412, rw: 80,  rh: 35, cx: 430 },
  { id: 'lab-info-1a',     label: 'Lab. Info 1-1',      floor: 1, rx: 40,  ry: 309, rw: 90,  rh: 35, cx: 85  },
  { id: 'lab-info-1b',     label: 'Lab. Info 1-2',      floor: 1, rx: 300, ry: 309, rw: 90,  rh: 35, cx: 345 },
  { id: 'lab-info-2a',     label: 'Lab. Info 2-1',      floor: 2, rx: 150, ry: 221, rw: 90,  rh: 35, cx: 195 },
  { id: 'birou-prof',      label: 'Birouri Profesori',  floor: 2, rx: 270, ry: 221, rw: 80,  rh: 35, cx: 310 },
  { id: 'lab-info-3a',     label: 'Lab. Info 3-1',      floor: 3, rx: 40,  ry: 133, rw: 100, rh: 35, cx: 90  },
  { id: 'decanat-fii',     label: 'Decanat FII',        floor: 3, rx: 300, ry: 133, rw: 80,  rh: 35, cx: 340 },
  { id: 'sala-conf-fii',   label: 'Sala Conferințe',    floor: 4, rx: 80,  ry: 40,  rw: 200, rh: 40, cx: 180 },
]

const UAIC_IND_GRAPH = {
  'secretariat-fii': ['amf-otelea', 'lab-info-0', 'sala-info-0', 'stairs_0'],
  'amf-otelea':      ['secretariat-fii', 'lab-info-0', 'stairs_0'],
  'lab-info-0':      ['secretariat-fii', 'amf-otelea', 'sala-info-0', 'stairs_0'],
  'sala-info-0':     ['secretariat-fii', 'lab-info-0', 'stairs_0'],
  stairs_0:          ['secretariat-fii', 'amf-otelea', 'lab-info-0', 'sala-info-0', 'stairs_1'],
  'lab-info-1a':     ['lab-info-1b', 'stairs_1'],
  'lab-info-1b':     ['lab-info-1a', 'stairs_1'],
  stairs_1:          ['lab-info-1a', 'lab-info-1b', 'stairs_0', 'stairs_2'],
  'lab-info-2a':     ['birou-prof', 'stairs_2'],
  'birou-prof':      ['lab-info-2a', 'stairs_2'],
  stairs_2:          ['lab-info-2a', 'birou-prof', 'stairs_1', 'stairs_3'],
  'lab-info-3a':     ['decanat-fii', 'stairs_3'],
  'decanat-fii':     ['lab-info-3a', 'stairs_3'],
  stairs_3:          ['lab-info-3a', 'decanat-fii', 'stairs_2', 'stairs_4'],
  'sala-conf-fii':   ['stairs_4'],
  stairs_4:          ['sala-conf-fii', 'stairs_3'],
}

const UAIC_ROUTE_IDS = {
  rectorat: '1', 'rectorat-uaic': '1', uaic: '1',
  fii: '2', informatica: '2',
  matematica: '3',
  fizica: '4',
  chimie: '5',
  biologie: '6',
  drept: '7',
  litere: '8',
  filosofie: '9',
  psihologie: '10',
  feaa: '11', economie: '11',
  geografie: '12', geologie: '12',
  bcu: '13', biblioteca: '13',
  secretariat: '14', 'secretariat-fii': '14',
  camine: '15', 'camine-codrescu': '15',
  istorie: '16',
  teologie: '17',
  sport: '18',
  catolica: '19',
  cantina: '20', 'canteen-uaic': '20',
}

const UAIC_AI_DESTINATIONS = [
  { label: 'Secretariat FII', query: 'Unde se afla Secretariatul FII?', type: 'Admin' },
  { label: 'Decanat FII', query: 'Cum ajung la Decanatul FII?', type: 'Admin' },
  { label: 'Lab Info', query: 'Unde sunt laboratoarele de informatica?', type: 'Sala' },
  { label: 'BCU', query: 'Cum ajung la Biblioteca Centrala BCU?', type: 'Studiu' },
  { label: 'Cantina', query: 'Cum ajung la cantina UAIC?', type: 'Campus' },
  { label: 'Camine', query: 'Cum ajung la caminele Codrescu?', type: 'Camin' },
  { label: 'Matematica', query: 'Cum ajung la Facultatea de Matematica UAIC?', type: 'Facultate' },
  { label: 'Fizica', query: 'Cum ajung la Facultatea de Fizica UAIC?', type: 'Facultate' },
  { label: 'Chimie', query: 'Cum ajung la Facultatea de Chimie UAIC?', type: 'Facultate' },
  { label: 'Biologie', query: 'Cum ajung la Facultatea de Biologie UAIC?', type: 'Facultate' },
  { label: 'Drept', query: 'Cum ajung la Facultatea de Drept UAIC?', type: 'Facultate' },
  { label: 'Litere', query: 'Cum ajung la Facultatea de Litere UAIC?', type: 'Facultate' },
  { label: 'Filosofie', query: 'Cum ajung la Facultatea de Filosofie UAIC?', type: 'Facultate' },
  { label: 'Psihologie', query: 'Cum ajung la Facultatea de Psihologie UAIC?', type: 'Facultate' },
  { label: 'FEAA', query: 'Cum ajung la FEAA UAIC?', type: 'Facultate' },
  { label: 'Geografie', query: 'Cum ajung la Facultatea de Geografie si Geologie UAIC?', type: 'Facultate' },
  { label: 'Istorie', query: 'Cum ajung la Facultatea de Istorie UAIC?', type: 'Facultate' },
  { label: 'Teologie', query: 'Cum ajung la Facultatea de Teologie Ortodoxa UAIC?', type: 'Facultate' },
  { label: 'Sport', query: 'Cum ajung la Facultatea de Educatie Fizica si Sport UAIC?', type: 'Facultate' },
]

// ─── Campus config – keyed by university ID ───────────────────────────────────
const CAMPUS_CONFIG = {
  tuiasi: {
    center:          TUIASI_CENTER,
    buildings:       TUIASI_BUILDINGS,
    pois:            TUIASI_POIS,
    indRooms:        TUIASI_IND_ROOMS,
    indGraph:        TUIASI_IND_GRAPH,
    outdoorRouteIds: TUIASI_ROUTE_IDS,
    walkNodes:       TUIASI_WALK_NODES,
    walkEdges:       TUIASI_WALK_EDGES,
    aiDestinations:  TUIASI_AI_DESTINATIONS,
    name:            'TUIASI – Gh. Asachi',
    greeting:        'Salut! Sunt asistentul tău de navigare pentru campusul TUIASI. Cum te pot ajuta?',
    indoorLabel:     'Navigare interioară – Corp C (AC)',
    indoorDefault:   'secretariat-ac',
  },
  uaic: {
    center:          UAIC_CENTER,
    buildings:       UAIC_BUILDINGS,
    pois:            UAIC_POIS,
    indRooms:        UAIC_IND_ROOMS,
    indGraph:        UAIC_IND_GRAPH,
    outdoorRouteIds: UAIC_ROUTE_IDS,
    aiDestinations:  UAIC_AI_DESTINATIONS,
    name:            'UAIC Iași',
    greeting:        'Salut! Sunt asistentul tău de navigare pentru campusul UAIC. Cum te pot ajuta?',
    indoorLabel:     'Navigare interioară – Facultatea de Informatică FII',
    indoorDefault:   'secretariat-fii',
  },
}

function makePOIIcon(label, color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="
          min-width:36px;height:36px;padding:0 6px;
          background:${color};
          border:2.5px solid #fff;
          border-radius:999px;
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:800;color:#fff;
          box-shadow:0 2px 10px rgba(0,0,0,0.28);
        ">${label}</div>
        <div style="
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid ${color};
          margin-top:-1px;
        "></div>
      </div>`,
    iconSize: [42, 46],
    iconAnchor: [21, 46],
    popupAnchor: [0, -48],
  })
}

const FLOOR_Y = [455, 352, 264, 176, 88]
const STAIR_X = 510

function bfsIndoor(start, end, graph) {
  if (start === end) return [start]
  const q = [[start]]
  const visited = new Set([start])
  while (q.length) {
    const path = q.shift()
    for (const next of graph[path[path.length - 1]] || []) {
      if (next === end) return [...path, next]
      if (!visited.has(next)) { visited.add(next); q.push([...path, next]) }
    }
  }
  return null
}

function indoorPathPoints(nodePath, indRooms) {
  const pts = []
  for (let i = 0; i < nodePath.length; i++) {
    const id = nodePath[i]
    const room = indRooms.find(r => r.id === id)
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

function mapsQuery(item) {
  const name = item?.name || 'Universitate Iași'
  const coords = item?.coords || (item?.lat && item?.lng ? [item.lat, item.lng] : null)
  return coords ? `${name} ${coords[0]},${coords[1]}` : name
}

function googleMapsUrl(item) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(item))}`
}

function wazeUrl(item) {
  const coords = item?.coords || (item?.lat && item?.lng ? [item.lat, item.lng] : null)
  if (coords) return `https://waze.com/ul?ll=${coords[0]},${coords[1]}&navigate=yes`
  return `https://waze.com/ul?q=${encodeURIComponent(item?.name || 'Universitate Iași')}&navigate=yes`
}

function openExternalMap(item, provider = 'google') {
  window.open(provider === 'waze' ? wazeUrl(item) : googleMapsUrl(item), '_blank', 'noopener,noreferrer')
}

function coordsParam(item) {
  const coords = item?.coords || (item?.lat && item?.lng ? [item.lat, item.lng] : null)
  return coords ? `${coords[0]},${coords[1]}` : ''
}

function googleDirectionsUrl(from, to, mode = 'foot') {
  const travelmode = mode === 'driving' ? 'driving' : 'walking'
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(coordsParam(from))}&destination=${encodeURIComponent(coordsParam(to))}&travelmode=${travelmode}`
}

function wazeRouteUrl(to) {
  const coords = coordsParam(to)
  return coords
    ? `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(to?.name || 'Universitate Iasi')}&navigate=yes`
}

function openExternalRoute(from, to, provider = 'google', mode = 'foot') {
  window.open(provider === 'waze' ? wazeRouteUrl(to) : googleDirectionsUrl(from, to, mode), '_blank', 'noopener,noreferrer')
}

function speak(text, enabled) {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'en-US'
  utt.rate = 0.92
  window.speechSynthesis.speak(utt)
}

function buildIndoorCinematicSteps(nodePath, indRooms) {
  const steps = []
  const startRoom = indRooms.find(r => r.id === nodePath[0])
  steps.push({
    instruction: `Ești la ${startRoom?.label || nodePath[0]}${startRoom ? ` — ${startRoom.floor === 0 ? 'Parter' : 'Etaj ' + startRoom.floor}` : ''}`,
    icon: '📍',
    highlightRoom: nodePath[0],
  })
  for (let i = 1; i < nodePath.length; i++) {
    const id = nodePath[i]
    const room = indRooms.find(r => r.id === id)
    const isLast = i === nodePath.length - 1
    if (id.startsWith('stairs_')) {
      const prevRoom = indRooms.find(r => r.id === nodePath[i - 1])
      const nextRoom = indRooms.find(r => r.id === nodePath[i + 1])
      const goingUp = nextRoom && prevRoom && nextRoom.floor > prevRoom.floor
      steps.push({
        instruction: goingUp
          ? `Mergi la scări și urcă la etajul ${nextRoom?.floor ?? ''}`
          : `Mergi la scări și coboară la etajul ${nextRoom?.floor === 0 ? 'parter' : nextRoom?.floor ?? ''}`,
        icon: '🪜',
        highlightRoom: id,
      })
    } else if (room) {
      steps.push({
        instruction: isLast
          ? `${room.label} — ai ajuns la destinație!`
          : `Continuă prin ${room.label} (${room.floor === 0 ? 'Parter' : 'Etaj ' + room.floor})`,
        icon: isLast ? '✅' : '🚪',
        highlightRoom: id,
        isFinal: isLast,
      })
    }
  }
  return steps
}

function buildOutdoorCinematicSteps(pathData, actions, fromBuilding, toBuilding) {
  const steps = []
  steps.push({
    instruction: `Starting from ${fromBuilding?.name || 'your current location'}`,
    icon: '📍',
    pathSlice: pathData.slice(0, Math.max(1, Math.floor(pathData.length * 0.05))),
  })
  const acts = actions?.length > 0 ? actions : []
  acts.forEach((action, i) => {
    const ratio = (i + 1) / (acts.length + 1)
    const idx = Math.max(2, Math.floor(ratio * pathData.length))
    steps.push({ instruction: action, icon: '🚶', pathSlice: pathData.slice(0, idx) })
  })
  steps.push({
    instruction: `You've arrived!\n${toBuilding?.name || 'Destination'}`,
    icon: '✅',
    pathSlice: pathData,
    isFinal: true,
  })
  return steps
}

function confidenceLabel(value) {
  if (!value) return 'neconfirmat'
  return `${Math.round(value * 100)}%`
}

function withDestinationQuestion(text) {
  const cleanText = String(text || '').trim()
  if (/unde\s+vrei\s+sa\s+ajungi/i.test(cleanText)) return cleanText
  return `${cleanText || 'Am analizat poza.'}\n\nUnde vrei sa ajungi de aici?`
}

function VisualCopilotCard({ result, onStartRoute, onStartPresentation }) {
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

  useEffect(() => {
    setFromRoom('')
    setToRoom('')
    setIndoorPath(null)
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

  const [showPOI, setShowPOI] = useState(false)
  const poiIcons = useRef({})
  function getPoiIcon(poi) {
    if (!poiIcons.current[poi.id]) {
      poiIcons.current[poi.id] = makePOIIcon(poi.short, poi.color)
    }
    return poiIcons.current[poi.id]
  }

  const [routeFrom, setRouteFrom] = useState('')
  const [routeTo, setRouteTo] = useState('')
  const [routeMode, setRouteMode] = useState('foot')
  const [routePath, setRoutePath] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)

  const [cinematicMode, setCinematicMode] = useState(false)
  const [cinematicStep, setCinematicStep] = useState(0)
  const [cinematicSteps, setCinematicSteps] = useState([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  async function calculateOutdoorRoute(fromValue, toValue, mode = routeMode) {
    const from = buildings.find(b => String(b.id) === String(fromValue))
    const to = buildings.find(b => String(b.id) === String(toValue))
    if (!from || !to) return
    const profile = ROUTE_PROFILES[mode] || ROUTE_PROFILES.foot
    setRouteLoading(true)
    setRoutePath(null)
    setRouteInfo(null)
    // kmh per mode; OSRM demo only has foot data for this region so always fetch foot geometry
    const speedKmh = mode === 'car' ? 40 : mode === 'bike' ? 15 : 5
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
      const [lat1, lon1] = from.coords
      const [lat2, lon2] = to.coords
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/${profile.osrmProfile}/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`
      )
      const data = await res.json()
      if (data.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        setRoutePath(coords)
        const dist = data.routes[0].distance
        const dur = Math.max(1, Math.ceil((dist / 1000) / speedKmh * 60))
        setRouteInfo({ distance: formatDistance(dist), duration: `${dur} min`, mode: profile.label })
      } else {
        throw new Error('No OSRM route found')
      }
    } catch {
      setRoutePath([from.coords, to.coords])
      setRouteInfo(fallbackRouteInfo(from, to, profile))
    }
    setRouteLoading(false)
  }

  async function fetchRoute() {
    await calculateOutdoorRoute(routeFrom, routeTo, routeMode)
  }

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
      const from = OUTDOOR_ROUTE_IDS[routeSuggestion.from] || routeSuggestion.from || '1'
      const to = OUTDOOR_ROUTE_IDS[routeSuggestion.to] || routeSuggestion.to
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
      const fromId = OUTDOOR_ROUTE_IDS[routeSuggestion.from] || routeSuggestion.from || '1'
      const toId = OUTDOOR_ROUTE_IDS[routeSuggestion.to] || routeSuggestion.to
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
        if (pathData) {
          steps = buildOutdoorCinematicSteps(pathData, actions, fromB, toB)
        } else {
        const [lat1, lon1] = fromB.coords
        const [lat2, lon2] = toB.coords
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/${profile.osrmProfile}/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`
        )
        const data = await res.json()
        if (data.routes?.[0]) {
          pathData = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
          const dist = data.routes[0].distance
          const dur = Math.ceil(data.routes[0].duration / 60)
          setRoutePath(pathData)
          setRouteInfo({ distance: formatDistance(dist), duration: `${dur} min`, mode: profile.label })
        }
        }
      } catch {
        pathData = [fromB.coords, toB.coords]
        setRoutePath(pathData)
        setRouteInfo(fallbackRouteInfo(fromB, toB, profile))
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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Navigator Campus</h1>
        <p className="text-slate-400 mt-1">Hartă, AI chat și recunoaștere vizuală.</p>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
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

      <AnimatePresence mode="wait">
        {activeTab === 'map' && (
          <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4">

            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Route size={15} className="text-indigo-400" /> Calculează traseu
              </h2>
              <div className="flex gap-1.5 mb-1">
                {[{ id: 'foot', label: '🚶 Pe jos' }, { id: 'bike', label: '🚲 Bicicletă' }, { id: 'car', label: '🚗 Mașină' }].map(m => (
                  <button key={m.id} onClick={() => {
                    setRouteMode(m.id)
                    if (routeFrom && routeTo) { calculateOutdoorRoute(routeFrom, routeTo, m.id) }
                    else { setRoutePath(null); setRouteInfo(null) }
                  }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${routeMode === m.id ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.07]'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
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
                  className="mt-3 flex flex-col gap-3 text-sm lg:flex-row lg:items-center">
                  <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                    <NavIcon size={14} /> {routeInfo.distance}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">~{routeInfo.duration} {ROUTE_PROFILES[routeMode]?.durationLabel}</span>
                  <span className="text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded-lg">
                    Traseu calculat
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
                      return <>
                        <Marker position={from.coords} icon={makeLabel('A', '#2563eb')} />
                        <Marker position={to.coords} icon={makeLabel('B', '#16a34a')} />
                      </>
                    })()}

                    {routePath && (() => {
                      const displayPath = cinematicMode && cinematicSteps[cinematicStep]?.pathSlice
                        ? cinematicSteps[cinematicStep].pathSlice
                        : routePath
                      return <>
                        <Polyline positions={displayPath} color="#f97316" weight={6} opacity={0.25} />
                        <Polyline positions={displayPath} color="#ffffff" weight={4} opacity={0.8} />
                        <Polyline positions={displayPath} color="#f97316" weight={3} opacity={1} dashArray="10 6" />
                      </>
                    })()}

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
                <p className="text-sm font-semibold text-white">AI Compass</p>
                <p className="text-xs text-slate-500">Chat, poza si ghidare campus</p>
              </div>
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

            <form onSubmit={sendChat} className="p-4 border-t border-white/[0.05]">
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
              <div className="flex gap-3">
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] text-slate-200 border border-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm placeholder:text-slate-600"
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
