import { TEXT_MODEL, VISION_MODEL, getSystemPrompt, COPILOT_JSON_SCHEMA, safeJson, normalizeCopilotPayload, inferIndoorRoom, inferOutdoorBuilding, withImageOnlyPrompt, applyVisualLocation, knownRooms, knownBuildings } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'
import {
  PHOTO_PROMPT_UAIC,
  PHOTO_PROMPT_TUIASI,
  PHOTO_PROMPT_UMF_IASI,
  PHOTO_PROMPT_UMF_BUC,
  PHOTO_PROMPT_UMF_TGM,
  PHOTO_PROMPT_UMF_CRAIOVA,
} from './prompts.js'
import { asArray, asObject, asString } from '../navigation.validation.js'

async function handleCopilot(req, res) {
  const body = asObject(await readJson(req))
  const message = asString(body.message, 'message')
  const image = body.image ? asObject(body.image, 'image') : null
  const context = body.context ? asObject(body.context, 'context') : {}
  const university = String(context.university || body.university || 'tuiasi').toLowerCase()
  let visualAnswer = String(context.visualAnswer || '')

  const indoorRooms = knownRooms(university)
  const outdoorBuildings = knownBuildings(university)
  const UMF_DEFAULT_STARTS = { 'umf-iasi': 'secretariat-umf', 'umf-buc': 'secretariat-umfb', 'umf-tgm': 'secretariat-tgm', 'umf-craiova': 'secretariat-cv' }
  const defaultStart = university === 'uaic' ? 'secretariat-fii' : (UMF_DEFAULT_STARTS[university] ?? 'secretariat-ac')
  const outdoorDefaultStart = university === 'uaic' ? 'fii' : university.startsWith('umf-') ? 'principal' : 'corp-c'
  const sysPrompt = getSystemPrompt(university)

  if (image?.base64 && !visualAnswer) {
    visualAnswer = await grokChat({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${image.mimeType || 'image/jpeg'};base64,${image.base64}` } },
            {
              type: 'text',
              text: `${{ uaic: PHOTO_PROMPT_UAIC, tuiasi: PHOTO_PROMPT_TUIASI, 'umf-iasi': PHOTO_PROMPT_UMF_IASI, 'umf-buc': PHOTO_PROMPT_UMF_BUC, 'umf-tgm': PHOTO_PROMPT_UMF_TGM, 'umf-craiova': PHOTO_PROMPT_UMF_CRAIOVA }[university] ?? PHOTO_PROMPT_TUIASI}

Dacă poți identifica o locație interioară (coridor, sală, panou de etaj, ușă cu număr), menționează etajul sau sala.
Dacă poza e neclară sau nu conține indicii suficiente, spune explicit că nu poți identifica locația în loc să ghicești.
Dacă există un mesaj de la student care indică o destinație, ține cont de el în răspuns.`,
            },
          ],
        },
      ],
      max_tokens: 480,
    })
  }

  const text = `Mesaj student: "${message || 'Nu a scris mesaj.'}"
Analiza vizuala preliminara: ${visualAnswer || 'Nu exista poza atasata.'}

Context cunoscut:
- Campus: ${context.campus || university.toUpperCase()}
- Universitate: ${university.toUpperCase()}
- Sali indoor disponibile: ${JSON.stringify(indoorRooms)}
- Cladiri outdoor disponibile: ${JSON.stringify(outdoorBuildings)}
- Orar apropiat: ${JSON.stringify(context.schedule || [])}
- Ora curenta: ${context.currentTime || new Date().toISOString()}

Comporta-te ca AI Compass pentru StudentPulse. Foloseste analiza vizuala preliminara ca sursa principala pentru locatie. Daca exista poza si nu exista destinatie in mesaj, recunoaste zona si intreaba explicit unde vrea studentul sa ajunga. Daca utilizatorul cere o sala cunoscuta din lista de sali indoor, propune ruta indoor. Daca cere o cladire cunoscuta din lista de cladiri outdoor, propune ruta outdoor.

Raspunde strict cu JSON valid in schema:
${COPILOT_JSON_SCHEMA}

IMPORTANT: Campul "actions" trebuie scris INTOTDEAUNA in engleza (ghidare vocala). Campul "answer" ramane in romana.`

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: sysPrompt },
      ...asArray(body.history, 'history').slice(-6),
      { role: 'user', content: text },
    ],
    max_tokens: 650,
    response_format: { type: 'json_object' },
  })

  const parsed = safeJson(raw, { answer: raw })
  const normalized = normalizeCopilotPayload(parsed, visualAnswer || raw)
  applyVisualLocation(normalized, visualAnswer, university)

  const inferredRoom = inferIndoorRoom(university, message, normalized.answer, normalized.destination.label)
  const inferredBuilding = inferOutdoorBuilding(university, message, normalized.answer, normalized.destination.label)
  if (inferredRoom && !normalized.destination.room) {
    normalized.destination = {
      ...normalized.destination,
      type: 'indoor',
      label: normalized.destination.label || inferredRoom.toUpperCase(),
      room: inferredRoom,
    }
  }
  if (inferredRoom && (!normalized.routeSuggestion.to || normalized.routeSuggestion.type === 'none')) {
    normalized.routeSuggestion = { type: 'indoor', from: normalized.detectedLocation.room || defaultStart, to: inferredRoom }
  }
  if (!inferredRoom && inferredBuilding && !normalized.destination.buildingId) {
    normalized.destination = {
      ...normalized.destination,
      type: 'outdoor',
      label: normalized.destination.label || inferredBuilding,
      buildingId: inferredBuilding,
    }
  }
  if (!inferredRoom && inferredBuilding) {
    normalized.routeSuggestion = { type: 'outdoor', from: outdoorDefaultStart, to: inferredBuilding }
  }

  if (normalized.routeSuggestion.type === 'indoor' && normalized.routeSuggestion.to && !normalized.routeSuggestion.from) {
    normalized.routeSuggestion.from = normalized.detectedLocation.room || defaultStart
  }
  if (normalized.routeSuggestion.type === 'outdoor' && normalized.routeSuggestion.to && !normalized.routeSuggestion.from) {
    normalized.routeSuggestion.from = outdoorDefaultStart
  }
  sendJson(res, 200, withImageOnlyPrompt(normalized, visualAnswer, message, university))
}


export { handleCopilot }
