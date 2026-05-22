import { resolve } from 'node:path'

export const TEXT_MODEL = 'llama-3.3-70b-versatile'
export const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
export const KEY_FILES = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '..', '..', 'navigatie', 'key.txt'),
  resolve(process.cwd(), '..', '..', '..', 'navigatie', 'navigator-export', 'key.txt'),
]

export const TUIASI_SYSTEM_PROMPT = `E?ti Campus AI, asistentul inteligent al studen?ilor de la Universitatea Tehnica "Gheorghe Asachi" din Ia?i (TUIASI).
Raspunzi �NTOTDEAUNA �n rom�na, concis ?i practic. E?ti prietenos dar la obiect � nu filozofa, nu da raspunsuri vagi.

---------------------------------------
CORP C � DEP. CALCULATOARE (CTI)
---------------------------------------
PARTER: Secretariat AC (L-V 09:00-13:00), Amf. AC0-1, Lab. A0-1, Sala AC0-2
ETAJ 1: Lab. C1-1, Lab. C1-2
ETAJ 2: Lab. C2-1, Birou C2-5 (Prof. Ciobanu)
ETAJ 3: Lab. A3-1 (DAIA), Sala A3-2
ETAJ 4: Sala Conferin?e
SCARA: la capatul coridorului principal.

---------------------------------------
CORP A � DEP. AUTOMATICA (IS/DAIA)
---------------------------------------
Birouri profesori DAIA, laboratoare de control ?i automatizare, sali de seminar.

---------------------------------------
ALTE CLADIRI TUIASI & SERVICII
---------------------------------------
- Biblioteca Gh. Asachi: L-V 08:00-20:00, S 09:00-14:00; ~9 min de la AC
- Cantina Studen?easca TUIASI: L-V 11:00-15:00, pr�nz ~15 lei; 2 min de la AC
- Facultatea ETTI: Bd. Carol I 11A; ~12 min cu tramvaiul
- Facultatea IEEIA: Bd. Prof. D. Mangeron, ~5 min pe jos
- Facultatea MEC: Bd. Prof. D. Mangeron, ~3 min pe jos
- Camine Tudor Vladimirescu: ~500m de facultate, 7 min pe jos
- Iulius Mall: 2km nord-vest; acces tramvai, L-D 10:00-22:00
- ATM BRD Mangeron: la intrarea AC, 24/7
- Magazin Petru / Magazin Luca: L-D 07:00-22:00, 2 min de facultate
- Copisterie Mangeron: l�nga AC, L-V 08:00-17:00
- Farmacie Dacia: Bd. Mangeron, L-V 08:00-20:00

---------------------------------------
REGULI DE RASPUNS
---------------------------------------
1. Sala (ex: "unde e Lab C1-1"): spune ETAJUL ?i cum se ajunge.
2. Traseu: pa?i clari ?i concre?i.
3. Orar (secretariat, cantina, biblioteca): ore exacte.
4. M�ncare: Cantina TUIASI (pr�nz ieftin), Magazin Petru/Luca (snacks).
5. Daca NU e despre campus: "Nu am informa?ii despre asta, dar te pot ajuta sa navighezi campusul TUIASI."
6. NU inventa. Daca nu ?tii sigur: "Nu am date exacte despre asta."
7. Maxim 4-5 propozi?ii. Fii specific.`

export const UAIC_SYSTEM_PROMPT = `E?ti Campus AI, asistentul inteligent al studen?ilor de la Universitatea Alexandru Ioan Cuza din Ia?i (UAIC).
Raspunzi �NTOTDEAUNA �n rom�na, concis ?i practic. E?ti prietenos dar la obiect � nu filozofa, nu da raspunsuri vagi.

---------------------------------------
CORP B � FACULTATEA DE INFORMATICA (FII)
---------------------------------------
PARTER: Secretariat FII (L-V 09:00-13:00), Amf. �E. Otelea", Lab. Info 0-1, Sala Info 0-2
ETAJ 1: Lab. Info 1-1, Lab. Info 1-2
ETAJ 2: Lab. Info 2-1, Birouri Profesori
ETAJ 3: Lab. Info 3-1, Decanat FII
ETAJ 4: Sala Conferin?e
SCARA: la capatul coridorului principal.

---------------------------------------
CORP A � RECTORAT UAIC & ALTE FACULTA?I (Bd. Carol I 11)
---------------------------------------
Rectorat UAIC, Facultatea de Matematica, Fizica, Chimie, Biologie � toate pe Bd. Carol I nr. 11.

---------------------------------------
ALTE CLADIRI UAIC & SERVICII
---------------------------------------
- BCU Biblioteca Centrala �Mihai Eminescu": L-V 09:00-20:00, S 09:00-14:00; ~7 min de la FII
- Cantina UAIC: L-V 11:00-19:00; ~5 min de la FII
- FEAA (Facultatea de Economie): Bd. Carol I 22; ~3 min pe jos, u?or spre nord
- Facultatea de Drept: Bd. Carol I 11, �n campus
- Camine Codrescu (Aleea M. Sadoveanu): ~700m de FII; 10 min pe jos
- Pia?a Unirii: ~5 min pe jos, sta?ii de transport, cafenele, banci
- Parcul Copou: ~10 min pe jos; teiul lui Eminescu, studiu outdoor
- Minimarket Profi: Bd. Carol I; alimente ?i produse zilnice
- Farmacie Salvator: Bd. Carol I; L-V 08:00-20:00
- ATM BRD: Bd. Carol I, la intrarea principala UAIC; 24/7

---------------------------------------
REGULI DE RASPUNS
---------------------------------------
1. Sala (ex: "unde e Lab Info 1-1"): spune ETAJUL ?i cum se ajunge.
2. Traseu: pa?i clari ?i concre?i.
3. Orar (secretariat, cantina, biblioteca): ore exacte.
4. M�ncare: Cantina UAIC, cafenele pe Bd. Carol I, Minimarket Profi.
5. Daca NU e despre campus: "Nu am informa?ii despre asta, dar te pot ajuta sa navighezi campusul UAIC."
6. NU inventa. Daca nu ?tii sigur: "Nu am date exacte despre asta."
7. Maxim 4-5 propozi?ii. Fii specific.`

function makeUmfSystemPrompt(universityName, city, address, extraFaculties, nearbyHospital) {
  return `Ești Campus AI, asistentul inteligent al studenților de la ${universityName} din ${city} (${address}).
Raspunzi ÎNTOTDEAUNA în română, concis și practic. Ești prietenos dar la obiect — nu filozofa, nu da raspunsuri vagi.

---------------------------------------
CORP PRINCIPAL – PARTER
---------------------------------------
Secretariat (L-V 09:00-13:00), Amfiteatre Medicină, Laboratoare Anatomie.

---------------------------------------
ETAJE SUPERIOARE
---------------------------------------
ETAJ 1: Laboratoare Fiziologie, Farmacologie/Microbiologie
ETAJ 2: Laboratoare Biochimie, Săli Clinice
ETAJ 3: Laborator Simulare Clinică, Decanat
ETAJ 4: Sală Conferințe
SCARA: la capătul coridorului principal.

---------------------------------------
FACULTĂȚI & SERVICII
---------------------------------------
- Facultatea de Medicină – în Corp Principal
- Facultatea de Medicină Dentară – corp separat sau etaj dedicat${extraFaculties}
- Facultatea de Farmacie – corp separat sau etaj dedicat
- Biblioteca universitară: L-V 09:00-20:00, S 09:00-14:00
- Cantina studențească: L-V 11:00-19:00
- Centru de Simulare Clinică – manechine medicale, echipamente de monitoring
- Cămine studențești – în campus sau apropiat
- ${nearbyHospital} – clinică universitară pentru stagii

---------------------------------------
REGULI DE RASPUNS
---------------------------------------
1. Sala (ex: "unde e Laboratorul de Anatomie"): spune ETAJUL și cum se ajunge.
2. Traseu: pași clari și concreți.
3. Orar (secretariat, cantina, biblioteca): ore exacte dacă știi.
4. Mâncare: Cantina ${universityName} (L-V 11:00-19:00).
5. Dacă NU e despre campus: "Nu am informații despre asta, dar te pot ajuta să navighezi campusul ${universityName}."
6. NU inventa. Dacă nu știi sigur: "Nu am date exacte despre asta."
7. Maxim 4-5 propoziții. Fii specific.`
}

export const UMF_IASI_SYSTEM_PROMPT    = makeUmfSystemPrompt('UMF „Grigore T. Popa" Iași',   'Iași',        'Str. Universității 16',  '\n- Facultatea de Bioinginerie Medicală – corp separat', 'Spitalul Sf. Spiridon')
export const UMF_BUC_SYSTEM_PROMPT     = makeUmfSystemPrompt('UMF „Carol Davila" București',  'București',   'Str. Dionisie Lupu 37',  '',                                                      'Spitalul Universitar de Urgență')
export const UMF_TGM_SYSTEM_PROMPT     = makeUmfSystemPrompt('UMFST „G.E. Palade" Tg. Mureș','Târgu Mureș', 'Str. Gh. Marinescu 38',  '\n- Facultatea de Inginerie și Informatică Medicală',    'Spitalul Clinic Județean Mureș')
export const UMF_CRAIOVA_SYSTEM_PROMPT = makeUmfSystemPrompt('UMF Craiova',                   'Craiova',     'Str. Petru Rareș 2-4',   '',                                                      'Spitalul Clinic Județean de Urgență Craiova')

export function getSystemPrompt(university) {
  switch (university) {
    case 'uaic':        return UAIC_SYSTEM_PROMPT
    case 'umf-iasi':    return UMF_IASI_SYSTEM_PROMPT
    case 'umf-buc':     return UMF_BUC_SYSTEM_PROMPT
    case 'umf-tgm':     return UMF_TGM_SYSTEM_PROMPT
    case 'umf-craiova': return UMF_CRAIOVA_SYSTEM_PROMPT
    default:            return TUIASI_SYSTEM_PROMPT
  }
}

// Keep SYSTEM_PROMPT as alias for backward compat
export const SYSTEM_PROMPT = TUIASI_SYSTEM_PROMPT

export const COPILOT_JSON_SCHEMA = `{
  "answer": "Raspuns scurt, conversational, in romana.",
  "detectedLocation": {
    "type": "indoor|outdoor|unknown",
    "label": "Locatia probabila",
    "building": "Cladirea probabila sau null",
    "room": "id sala cunoscuta sau null",
    "confidence": 0.82
  },
  "destination": {
    "type": "indoor|outdoor|unknown",
    "label": "Destinatia ceruta sau null",
    "room": "id sala cunoscuta sau null",
    "buildingId": "id cladire cunoscuta sau null"
  },
  "actions": ["Pas concret 1", "Pas concret 2", "Pas concret 3"],
  "routeSuggestion": {
    "type": "indoor|outdoor|none",
    "from": "id start sau null",
    "to": "id destinatie sau null"
  }
}`

export const KNOWN_INDOOR_ROOMS_TUIASI      = ['secretariat-ac', 'amf-ac0-1', 'lab-a0-1', 'sala-ac0-2', 'lab-c1-1', 'lab-c1-2', 'lab-c2-1', 'birou-c2-5', 'lab-a3-1', 'sala-a3-2', 'sala-conf']
export const KNOWN_INDOOR_ROOMS_UAIC        = ['secretariat-fii', 'amf-otelea', 'lab-info-0', 'sala-info-0', 'lab-info-1a', 'lab-info-1b', 'lab-info-2a', 'birou-prof', 'lab-info-3a', 'decanat-fii', 'sala-conf-fii']
export const KNOWN_INDOOR_ROOMS_UMF_IASI    = ['secretariat-umf', 'amf-med-0', 'lab-anatomie', 'sala-med-0', 'lab-fiziopatol', 'lab-farmacol', 'lab-biochimie', 'sala-clinica', 'lab-simulare', 'decanat-med', 'sala-conf-umf']
export const KNOWN_INDOOR_ROOMS_UMF_BUC     = ['secretariat-umfb', 'amf-carol-0', 'lab-anat-buc', 'sala-med-buc', 'lab-fizio-buc', 'lab-farm-buc', 'lab-biochimic', 'sala-clin-buc', 'lab-sim-buc', 'decanat-buc', 'sala-conf-buc']
export const KNOWN_INDOOR_ROOMS_UMF_TGM     = ['secretariat-tgm', 'amf-med-tgm', 'lab-anat-tgm', 'sala-tgm-0', 'lab-fizio-tgm', 'lab-micro-tgm', 'lab-bioc-tgm', 'sala-clin-tgm', 'lab-sim-tgm', 'decanat-tgm', 'sala-conf-tgm']
export const KNOWN_INDOOR_ROOMS_UMF_CRAIOVA = ['secretariat-cv', 'amf-med-cv', 'lab-anat-cv', 'sala-cv-0', 'lab-fizio-cv', 'lab-farm-cv', 'lab-bioc-cv', 'sala-clin-cv', 'lab-sim-cv', 'decanat-cv', 'sala-conf-cv']
export const KNOWN_INDOOR_ROOMS = [
  ...KNOWN_INDOOR_ROOMS_TUIASI, ...KNOWN_INDOOR_ROOMS_UAIC,
  ...KNOWN_INDOOR_ROOMS_UMF_IASI, ...KNOWN_INDOOR_ROOMS_UMF_BUC,
  ...KNOWN_INDOOR_ROOMS_UMF_TGM, ...KNOWN_INDOOR_ROOMS_UMF_CRAIOVA,
]

export const KNOWN_BUILDINGS_TUIASI      = ['corp-c', 'corp-a', 'library', 'canteen', 'secretariat', 'etti', 'ieeia', 'mec', 'ci', 'icpm', 'arh', 'cmmi', 'hgim', 'sim', 'dima']
export const KNOWN_BUILDINGS_UAIC        = ['rectorat-uaic', 'fii', 'matematica', 'fizica', 'chimie', 'biologie', 'drept', 'litere', 'filosofie', 'psihologie', 'feaa', 'geografie', 'bcu', 'secretariat-fii', 'camine-codrescu', 'canteen-uaic']
export const KNOWN_BUILDINGS_UMF_IASI    = ['principal', 'dentara', 'farmacie', 'bioing', 'biblioteca', 'simulare', 'camin', 'spiridon', 'jct-central']
export const KNOWN_BUILDINGS_UMF_BUC     = ['principal', 'farmacie', 'biblioteca', 'simulare', 'camin', 'jct-central']
export const KNOWN_BUILDINGS_UMF_TGM     = ['principal', 'dentara', 'farmacie', 'inginerie', 'biblioteca', 'spital', 'camin', 'jct-central']
export const KNOWN_BUILDINGS_UMF_CRAIOVA = ['principal', 'dentara', 'farmacie', 'biblioteca', 'simulare', 'camin', 'spital', 'jct-central']
export const KNOWN_BUILDINGS = [
  ...KNOWN_BUILDINGS_TUIASI, ...KNOWN_BUILDINGS_UAIC,
  ...KNOWN_BUILDINGS_UMF_IASI, ...KNOWN_BUILDINGS_UMF_BUC,
  ...KNOWN_BUILDINGS_UMF_TGM, ...KNOWN_BUILDINGS_UMF_CRAIOVA,
]

export function knownRooms(university) {
  switch (university) {
    case 'uaic':        return KNOWN_INDOOR_ROOMS_UAIC
    case 'umf-iasi':    return KNOWN_INDOOR_ROOMS_UMF_IASI
    case 'umf-buc':     return KNOWN_INDOOR_ROOMS_UMF_BUC
    case 'umf-tgm':     return KNOWN_INDOOR_ROOMS_UMF_TGM
    case 'umf-craiova': return KNOWN_INDOOR_ROOMS_UMF_CRAIOVA
    default:            return KNOWN_INDOOR_ROOMS_TUIASI
  }
}
export function knownBuildings(university) {
  switch (university) {
    case 'uaic':        return KNOWN_BUILDINGS_UAIC
    case 'umf-iasi':    return KNOWN_BUILDINGS_UMF_IASI
    case 'umf-buc':     return KNOWN_BUILDINGS_UMF_BUC
    case 'umf-tgm':     return KNOWN_BUILDINGS_UMF_TGM
    case 'umf-craiova': return KNOWN_BUILDINGS_UMF_CRAIOVA
    default:            return KNOWN_BUILDINGS_TUIASI
  }
}

export function safeJson(raw, fallback) {
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    const match = String(raw || '').match(/\{[\s\S]*\}/)
    if (!match) return fallback
    try {
      const parsed = JSON.parse(match[0])
      return parsed && typeof parsed === 'object' ? parsed : fallback
    } catch {
      return fallback
    }
  }
}

export function normalizeCopilotPayload(payload, fallbackAnswer = '') {
  const detected = payload.detectedLocation || {}
  const destination = payload.destination || {}
  const route = payload.routeSuggestion || {}

  const routeType = ['indoor', 'outdoor', 'none'].includes(route.type) ? route.type : 'none'
  const from = typeof route.from === 'string' ? route.from : null
  const to = typeof route.to === 'string' ? route.to : null

  return {
    answer: String(payload.answer || fallbackAnswer || 'Am analizat contextul, dar am nevoie de o poza mai clara sau o destinatie.'),
    detectedLocation: {
      type: ['indoor', 'outdoor', 'unknown'].includes(detected.type) ? detected.type : 'unknown',
      label: detected.label ? String(detected.label) : 'Locatie neconfirmata',
      building: detected.building ? String(detected.building) : null,
      room: KNOWN_INDOOR_ROOMS.includes(detected.room) ? detected.room : null,
      confidence: Math.max(0, Math.min(1, Number(detected.confidence) || 0)),
    },
    destination: {
      type: ['indoor', 'outdoor', 'unknown'].includes(destination.type) ? destination.type : 'unknown',
      label: destination.label ? String(destination.label) : null,
      room: KNOWN_INDOOR_ROOMS.includes(destination.room) ? destination.room : null,
      buildingId: KNOWN_BUILDINGS.includes(destination.buildingId) ? destination.buildingId : null,
    },
    actions: Array.isArray(payload.actions) ? payload.actions.slice(0, 4).map(String) : [],
    routeSuggestion: {
      type: routeType,
      from: routeType === 'indoor' && KNOWN_INDOOR_ROOMS.includes(from) ? from : routeType === 'outdoor' && KNOWN_BUILDINGS.includes(from) ? from : null,
      to: routeType === 'indoor' && KNOWN_INDOOR_ROOMS.includes(to) ? to : routeType === 'outdoor' && KNOWN_BUILDINGS.includes(to) ? to : null,
    },
  }
}

export function inferVisualLocation(text, university = 'tuiasi') {
  const normalized = String(text || '').toLowerCase()
  // For UAIC users, don't override � let the AI answer stand
  if (university === 'uaic') return null
  // For TUIASI: if the AI mistakenly says FII/Informatica, correct it to AC TUIASI
  if (
    normalized.includes('corp c') ||
    normalized.includes('automatica si calculatoare')
  ) {
    return {
      type: 'outdoor',
      label: 'Facultatea de Automatica si Calculatoare TUIASI',
      building: 'Facultatea de Automatica si Calculatoare TUIASI',
      room: null,
      confidence: 0.82,
    }
  }
  return null
}

export function normalizeVisibleLocationText(text, inferredLocation) {
  if (!inferredLocation?.label) return String(text || '')
  return String(text || '')
    .replace(/\bCorpul C\b/gi, inferredLocation.label)
    .replace(/\bCorp C\b/gi, inferredLocation.label)
}

export function applyVisualLocation(payload, visualAnswer, university = 'tuiasi') {
  const inferred = inferVisualLocation(visualAnswer, university)
  if (!inferred) return payload

  payload.detectedLocation = {
    ...(payload.detectedLocation || {}),
    ...inferred,
  }
  payload.answer = normalizeVisibleLocationText(payload.answer, inferred)
  return payload
}

export function inferIndoorRoom(university, ...texts) {
  const normalized = texts.map(text => String(text || '').toLowerCase()).join(' ')
  const rooms = knownRooms(university)
  for (const room of rooms) {
    if (normalized.includes(room)) return room
  }
  if (university === 'uaic') {
    if (normalized.includes('secretariat') || normalized.includes('fii')) return 'secretariat-fii'
    if (normalized.includes('otelea') || normalized.includes('amfiteatru')) return 'amf-otelea'
    if (normalized.includes('decanat')) return 'decanat-fii'
    if ((normalized.includes('lab') || normalized.includes('laborator')) && normalized.includes('info')) return 'lab-info-1a'
    if (normalized.includes('birouri') || normalized.includes('profesori')) return 'birou-prof'
  } else if (university === 'umf-iasi') {
    if (normalized.includes('secretariat')) return 'secretariat-umf'
    if (normalized.includes('anatomie')) return 'lab-anatomie'
    if (normalized.includes('decanat')) return 'decanat-med'
    if (normalized.includes('amfiteatru') || normalized.includes('amf')) return 'amf-med-0'
    if (normalized.includes('simulare')) return 'lab-simulare'
    if (normalized.includes('biochimie')) return 'lab-biochimie'
  } else if (university === 'umf-buc') {
    if (normalized.includes('secretariat')) return 'secretariat-umfb'
    if (normalized.includes('anatomie')) return 'lab-anat-buc'
    if (normalized.includes('decanat')) return 'decanat-buc'
    if (normalized.includes('amfiteatru') || normalized.includes('carol')) return 'amf-carol-0'
    if (normalized.includes('simulare')) return 'lab-sim-buc'
    if (normalized.includes('biochimie')) return 'lab-biochimic'
  } else if (university === 'umf-tgm') {
    if (normalized.includes('secretariat')) return 'secretariat-tgm'
    if (normalized.includes('anatomie')) return 'lab-anat-tgm'
    if (normalized.includes('decanat')) return 'decanat-tgm'
    if (normalized.includes('amfiteatru') || normalized.includes('amf')) return 'amf-med-tgm'
    if (normalized.includes('simulare')) return 'lab-sim-tgm'
    if (normalized.includes('biochimie')) return 'lab-bioc-tgm'
  } else if (university === 'umf-craiova') {
    if (normalized.includes('secretariat')) return 'secretariat-cv'
    if (normalized.includes('anatomie')) return 'lab-anat-cv'
    if (normalized.includes('decanat')) return 'decanat-cv'
    if (normalized.includes('amfiteatru') || normalized.includes('amf')) return 'amf-med-cv'
    if (normalized.includes('simulare')) return 'lab-sim-cv'
    if (normalized.includes('biochimie')) return 'lab-bioc-cv'
  } else {
    if (normalized.includes('c 210') || normalized.includes('c210') || normalized.includes('lab c2')) return 'lab-c2-1'
    if (normalized.includes('c 308') || normalized.includes('c308') || normalized.includes('a3') || normalized.includes('daia')) return 'lab-a3-1'
    if (normalized.includes('c 112') || normalized.includes('c112') || normalized.includes('lab c1')) return 'lab-c1-1'
    if (normalized.includes('secretariat')) return 'secretariat-ac'
  }
  return null
}

export function inferOutdoorBuilding(university, ...texts) {
  const normalized = texts.map(text => String(text || '').toLowerCase()).join(' ')
  if (university === 'uaic') {
    if (normalized.includes('biblioteca') || normalized.includes('bcu')) return 'bcu'
    if (normalized.includes('cantina')) return 'canteen-uaic'
    if (normalized.includes('feaa') || normalized.includes('economie')) return 'feaa'
    if (normalized.includes('informatica') || normalized.includes('fii') || normalized.includes('corp b')) return 'fii'
    if (normalized.includes('rectorat')) return 'rectorat-uaic'
    if (normalized.includes('drept')) return 'drept'
    if (normalized.includes('matematica')) return 'matematica'
    if (normalized.includes('fizica')) return 'fizica'
    if (normalized.includes('chimie')) return 'chimie'
    if (normalized.includes('biologie')) return 'biologie'
    if (normalized.includes('litere')) return 'litere'
    if (normalized.includes('filosofie')) return 'filosofie'
    if (normalized.includes('psihologie')) return 'psihologie'
    if (normalized.includes('geografie') || normalized.includes('geologie')) return 'geografie'
    if (normalized.includes('camine') || normalized.includes('codrescu')) return 'camine-codrescu'
    if (normalized.includes('secretariat')) return 'secretariat-fii'
  } else if (university.startsWith('umf-')) {
    if (normalized.includes('biblioteca')) return 'biblioteca'
    if (normalized.includes('camin')) return 'camin'
    if (normalized.includes('dentara') || normalized.includes('stomatologie') || normalized.includes('dental')) return 'dentara'
    if (normalized.includes('farmacie') || normalized.includes('farmacologie')) return 'farmacie'
    if (normalized.includes('simulare') || normalized.includes('centru de simulare')) return 'simulare'
    if (normalized.includes('spiridon') || normalized.includes('spital') || normalized.includes('clinica') || normalized.includes('clinică')) return university === 'umf-iasi' ? 'spiridon' : 'spital'
    if (normalized.includes('inginerie') || normalized.includes('informatica medicala')) return 'inginerie'
    if (normalized.includes('bioinginerie')) return 'bioing'
    if (normalized.includes('medicina') || normalized.includes('medicin') || normalized.includes('principal') || normalized.includes('secretariat') || normalized.includes('rectorat')) return 'principal'
  } else {
    if (normalized.includes('biblioteca')) return 'library'
    if (normalized.includes('cantina')) return 'canteen'
    if (normalized.includes('corp a')) return 'corp-a'
    if (normalized.includes('corp c') || normalized.includes('automatic') || normalized.includes('calculatoare') || normalized.includes('informatic')) return 'corp-c'
    if (normalized.includes('secretariat')) return 'secretariat'
    if (normalized.includes('etti') || normalized.includes('electronica') || normalized.includes('telecomunicatii')) return 'etti'
    if (normalized.includes('ieeia') || normalized.includes('electrica') || normalized.includes('energetica')) return 'ieeia'
    if (normalized.includes('mecanica') || normalized.includes('mecanic')) return 'mec'
    if (normalized.includes('constructii') || normalized.includes('instalatii')) return 'ci'
    if (normalized.includes('chimie') || normalized.includes('chimica') || normalized.includes('icpm') || normalized.includes('simionescu')) return 'icpm'
    if (normalized.includes('arhitectura') || normalized.includes('cantacuzino')) return 'arh'
    if (normalized.includes('cmmi') || normalized.includes('masini') || normalized.includes('management industrial')) return 'cmmi'
    if (normalized.includes('hgim') || normalized.includes('hidrotehnica') || normalized.includes('geodezie')) return 'hgim'
    if (normalized.includes('sim') || normalized.includes('materialelor')) return 'sim'
    if (normalized.includes('dima') || normalized.includes('design industrial')) return 'dima'
  }
  return null
}

export function withImageOnlyPrompt(payload, visualAnswer, message, university = 'tuiasi') {
  const normalizedMessage = String(message || '').trim()
  const inferred = inferVisualLocation(visualAnswer, university)
  const hasDestination = payload.destination?.room || payload.destination?.buildingId

  applyVisualLocation(payload, visualAnswer, university)

  if (!hasDestination && !normalizedMessage) {
    const cleanVisionAnswer = normalizeVisibleLocationText(String(visualAnswer || '').trim(), inferred)
    const exampleDest = university === 'uaic'
      ? 'Lab Info 1-1, Secretariat FII, BCU sau Cantina.'
      : university.startsWith('umf-')
        ? 'Lab. Anatomie, Secretariat, Biblioteca sau Centru Simulare.'
        : 'C210, Secretariat, Biblioteca sau Cantina.'
    payload.answer = inferred
      ? `${cleanVisionAnswer || `Recunosc zona: pare sa fie ${inferred.label}.`} Unde vrei sa ajungi de aici?`
      : `Am analizat poza. Unde vrei sa ajungi? De exemplu: ${exampleDest}`
    payload.destination = { type: 'unknown', label: null, room: null, buildingId: null }
    payload.routeSuggestion = { type: 'none', from: null, to: null }
    payload.actions = [
      `Spune destinatia, de exemplu ${exampleDest}`,
      'Daca esti pe coridor, trimite o poza cu usa salii sau cu indicatorul de etaj.',
    ]
  }

  return payload
}

