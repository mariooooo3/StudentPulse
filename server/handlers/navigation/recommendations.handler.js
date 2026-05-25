import { TEXT_MODEL, getSystemPrompt } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'

const recoCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

async function handleRecommendations(req, res) {
  const body = await readJson(req)
  const university = String(body.university || 'tuiasi').toLowerCase()
  const hour = Number.isFinite(Number(body.hour)) ? Number(body.hour) : new Date().getHours()
  const totalUsers = Number.isFinite(Number(body.totalUsers)) ? Number(body.totalUsers) : 0
  const crowdLevel = totalUsers === 0 ? 'necunoscut' : totalUsers < 80 ? 'scazut' : totalUsers < 160 ? 'moderat' : 'ridicat'
  const timeSlot = hour < 10 ? 'dimineata' : hour < 13 ? 'la pranz' : hour < 17 ? 'dupa-amiaza' : 'seara'

  const cacheKey = `${university}:${hour}:${crowdLevel}`
  const cached = recoCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    sendJson(res, 200, cached.data)
    return
  }

  const fallback = {
    briefing: `Campusul este ${crowdLevel}, iar tu esti in intervalul ${timeSlot}.`,
    cards: [
      {
        id: 'route-now',
        emoji: '🧭',
        title: 'Pleaca acum',
        desc: 'Porneste spre urmatorul curs cu 8 minute inainte pentru a evita pauzele aglomerate.',
        urgency: 'medium',
      },
      {
        id: 'quiet-zone',
        emoji: '📚',
        title: 'Zona linistita',
        desc: 'Biblioteca este o alegere buna intre cursuri daca vrei lucru concentrat.',
        urgency: 'low',
      },
      {
        id: 'canteen-window',
        emoji: '🍽️',
        title: 'Evita cantina',
        desc: 'Intervalul de la pranz este cel mai aglomerat; mergi mai devreme sau mai tarziu.',
        urgency: 'high',
      },
      {
        id: 'next-stop',
        emoji: '📍',
        title: 'Urmatorul reper',
        desc: `Verifica traseul dupa orar pentru ${Array.isArray(body.schedule) && body.schedule.length ? 'urmatorul curs' : 'urmatorul reper'}.`,
        urgency: 'low',
      },
    ],
  }

  try {
    const raw = await grokChat({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt(university) },
        {
          role: 'user',
          content: `Ora curenta: ${hour}:00 (${timeSlot}). Trafic campus: ${crowdLevel} (${totalUsers} studenti activi).
Orar student: ${JSON.stringify(body.schedule || [])}.

Genereaza exact 4 recomandari smart si practice. Raspunde doar cu JSON valid in formatul:
{
  "briefing": "O propozitie specifica despre starea campusului ACUM (mentioneza traficul si ora).",
  "cards": [
    {
      "id": "unic-id-kebab-case",
      "emoji": "emoji relevant",
      "title": "Titlu scurt (max 25 caractere)",
      "desc": "Descriere practica si specifica contextului (ora, trafic, orar). Max 2 propozitii.",
      "urgency": "low|medium|high"
    }
  ]
}

Reguli pentru urgency:
- "high" = actionabil in urmatoarele 30 minute (ex: curs care incepe curand, cantina se inchide)
- "medium" = relevant in urmatoarele 2 ore
- "low" = sugestie flexibila, fara constrangere de timp

Reguli pentru diversitate:
- Cele 4 carduri trebuie sa fie din categorii diferite: navigare/traseu, mancare/cantina, studiu/biblioteca, social/activitate
- Nu genera 2 carduri despre acelasi subiect
- Daca studentul are curs in urmatoarea ora (din orar), primul card trebuie sa fie despre acel curs`,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.cards)) throw new Error('Invalid recommendations payload')
    const result = { briefing: parsed.briefing || fallback.briefing, cards: parsed.cards.slice(0, 4) }
    recoCache.set(cacheKey, { ts: Date.now(), data: result })
    sendJson(res, 200, result)
  } catch {
    sendJson(res, 200, fallback)
  }
}


export { handleRecommendations }
