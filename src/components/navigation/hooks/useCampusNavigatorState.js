import { useRef, useState } from 'react'

export function useCampusNavigatorState() {
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [activeTab, setActiveTab] = useState('map')
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: 'Salut! Sunt asistentul tău de navigare. Cum te pot ajuta?' },
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
  const [cinematicMode, setCinematicMode] = useState(false)
  const [cinematicStep, setCinematicStep] = useState(0)
  const [cinematicSteps, setCinematicSteps] = useState([])

  return {
    selectedBuilding, setSelectedBuilding,
    activeTab, setActiveTab,
    chatMessages, setChatMessages,
    chatInput, setChatInput,
    chatAttachment, setChatAttachment,
    chatLoading, setChatLoading,
    lastPhotoContext, setLastPhotoContext,
    pulseData, setPulseData,
    pulseLoading, setPulseLoading,
    pulseLoaded, setPulseLoaded,
    cameraOpen, setCameraOpen,
    cameraStream, setCameraStream,
    cameraFacing, setCameraFacing,
    chatHistory,
    recoHistory,
    recoMessages, setRecoMessages,
    recoInput, setRecoInput,
    recoLoading, setRecoLoading,
    fromRoom, setFromRoom,
    toRoom, setToRoom,
    indoorPath, setIndoorPath,
    showCrowd, setShowCrowd,
    showPOI, setShowPOI,
    routeFrom, setRouteFrom,
    routeTo, setRouteTo,
    routeMode, setRouteMode,
    routePath, setRoutePath,
    routeLoading, setRouteLoading,
    routeInfo, setRouteInfo,
    cinematicMode, setCinematicMode,
    cinematicStep, setCinematicStep,
    cinematicSteps, setCinematicSteps,
  }
}
