import Groq from 'groq-sdk'
import Exifr from 'exifr'
import { query, nowIso } from '../db/database.js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ─── Groq client ─────────────────────────────────────────────────────────────
const KEY_FILES = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '..', '..', 'navigatie', 'key.txt'),
]

function loadGroqKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY
  for (const f of KEY_FILES) {
    if (existsSync(f)) {
      const raw = readFileSync(f, 'utf8')
      const m = raw.match(/GROQ_API_KEY\s*=\s*(.+)/)
      if (m) return m[1].trim()
    }
  }
  return null
}

const groq = new Groq({ apiKey: loadGroqKey() || 'no-key' })
const TEXT_MODEL  = 'llama-3.3-70b-versatile'
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

// ─── Challenge definitions ────────────────────────────────────────────────────
const DAILY_POOL = [
  {
    id: 'd1', title: 'Mers pe jos 30 de minute',
    description: 'Fă o plimbare de cel puțin 30 de minute — pe campus, în parc sau în oraș.',
    category: 'sănătate', points: 50, icon: 'walking',
    verifyType: 'screenshot', requiresDate: true,
    screenshotHint: 'Încarcă un screenshot din Google Fit, Strava, Samsung Health sau Apple Health care să arate activitatea de azi (mers ≥ 30 min cu data vizibilă).',
  },
  {
    id: 'd2', title: 'Sesiune Focus de 25 minute',
    description: 'Completează o sesiune de studiu în Focus Mode din aplicație fără întreruperi.',
    category: 'academic', points: 50, icon: 'focus',
    verifyType: 'in-app', inAppAction: 'focus-session', requiredCount: 1,
  },
  {
    id: 'd3', title: 'Hidratare zilnică',
    description: 'Bea cel puțin 8 pahare de apă pe parcursul zilei.',
    category: 'sănătate', points: 30, icon: 'water',
    verifyType: 'text',
  },
  {
    id: 'd4', title: 'Citit 15 pagini',
    description: 'Citește 15 pagini dintr-o carte, curs sau articol academic.',
    category: 'academic', points: 50, icon: 'book',
    verifyType: 'text',
  },
  {
    id: 'd5', title: 'Oră de curs fără telefon',
    description: 'Participă activ la o oră de curs cu telefonul pe silențios și închis în geantă.',
    category: 'academic', points: 40, icon: 'class',
    verifyType: 'text',
  },
  {
    id: 'd6', title: 'Stretching 10 minute',
    description: 'Fă 10 minute de stretching sau exerciții ușoare dimineața sau seara.',
    category: 'sănătate', points: 30, icon: 'stretch',
    verifyType: 'text', requiresDate: false,
  },
  {
    id: 'd7', title: 'Contactează un coleg',
    description: 'Trimite un mesaj util unui coleg — o resursă, un sfat sau o întrebare pentru un proiect comun.',
    category: 'social', points: 40, icon: 'message',
    verifyType: 'in-app', inAppAction: 'message-sent', requiredCount: 1,
  },
  {
    id: 'd8', title: 'Organizează-ți notițele',
    description: 'Organizează sau rezumă notițele de la cursul de azi în maxim 30 de minute.',
    category: 'academic', points: 40, icon: 'notes',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă un screenshot sau o poză cu notițele organizate (Notion, Word, caiet, etc.) — să se vadă că sunt structurate și complete.',
  },
  {
    id: 'd9', title: 'Pauză digitală 1 oră',
    description: 'Stai departe de rețelele sociale și entertainment timp de o oră. Folosește timpul pentru ceva concret.',
    category: 'wellbeing', points: 60, icon: 'digital',
    verifyType: 'text',
  },
  {
    id: 'd10', title: 'Explică un concept nou',
    description: 'Învață un concept nou de la cursuri și explică-l cu cuvintele tale — scris sau verbal unui coleg.',
    category: 'academic', points: 60, icon: 'brain',
    verifyType: 'text',
  },
]

const WEEKLY_POOL = [
  {
    id: 'w1', title: 'Sesiune de tutoring sau Skill Swap',
    description: 'Rezervă o sesiune de Peer Tutoring sau Skill Swap din aplicație cu un coleg.',
    category: 'academic', points: 150, icon: 'tutoring',
    verifyType: 'in-app', inAppAction: 'tutoring-booked', requiredCount: 1,
  },
  {
    id: 'w2', title: 'Aplică la un internship',
    description: 'Aplică la un internship sau oportunitate de practică din secțiunea Carieră a aplicației.',
    category: 'carieră', points: 200, icon: 'briefcase',
    verifyType: 'in-app', inAppAction: 'career-apply', requiredCount: 1,
  },
  {
    id: 'w3', title: 'Vizitează biblioteca',
    description: 'Mergi fizic la biblioteca campusului și studiază acolo cel puțin o oră.',
    category: 'campus', points: 150, icon: 'library',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă o fotografie în interiorul bibliotecii — raft cu cărți, sală de lectură sau intrare. Nu trebuie data vizibilă, poza singură e suficientă.',
  },
  {
    id: 'w4', title: 'Sesiune de studiu în grup',
    description: 'Organizează sau participă la o sesiune de studiu în grup cu minimum 2 colegi.',
    category: 'social', points: 150, icon: 'group',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă o poză la sesiunea de studiu cu colegii (birou, laptop-uri deschise, whiteboard) sau un screenshot dintr-un apel video de grup de studiu.',
  },
  {
    id: 'w5', title: 'Workout 45 minute',
    description: 'Fă un antrenament de 45 de minute — sală, alergat, înot sau sport de echipă.',
    category: 'sănătate', points: 150, icon: 'workout',
    verifyType: 'screenshot', requiresDate: true,
    screenshotHint: 'Încarcă un screenshot din Google Fit, Strava, Samsung Health, Nike Run Club sau orice aplicație de sport care arată antrenamentul de azi (≥ 45 min, data vizibilă).',
  },
  {
    id: 'w6', title: 'Participă la un eveniment de campus',
    description: 'Mergi la un eveniment studențesc — conferință, club, workshop sau activitate culturală.',
    category: 'campus', points: 200, icon: 'event',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă o fotografie la eveniment (afișul, sala, certificat de participare) sau un screenshot cu confirmarea înregistrării/biletului.',
  },
  {
    id: 'w7', title: 'Aleargă 5 km',
    description: 'Aleargă 5 kilometri într-o singură sesiune — pe stradă, în parc sau pe bandă.',
    category: 'sănătate', points: 200, icon: 'workout',
    verifyType: 'screenshot', requiresDate: true,
    screenshotHint: 'Încarcă un screenshot din Strava, Nike Run Club, Google Fit sau orice aplicație de alergare care arată distanța ≥ 5 km cu data din această săptămână vizibilă.',
  },
  {
    id: 'w8', title: 'Curăță și organizează-ți spațiul de lucru',
    description: 'Fă curat la birou sau în camera ta, organizează materialele de studiu și elimină distragerile din jur.',
    category: 'wellbeing', points: 150, icon: 'notes',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă o poză cu biroul sau spațiul de lucru organizat — să se vadă că e curat și aranjat.',
  },
  {
    id: 'w9', title: 'Actualizează-ți profilul LinkedIn',
    description: 'Adaugă o experiență nouă, un proiect sau un skill la profilul tău LinkedIn și fă un screenshot cu profilul actualizat.',
    category: 'carieră', points: 150, icon: 'briefcase',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă un screenshot cu profilul tău LinkedIn actualizat — să se vadă secțiunea adăugată (experiență, proiect sau skill) și numele tău.',
  },
  {
    id: 'w10', title: 'Participă la un club studențesc',
    description: 'Mergi la o întâlnire a unui club studențesc, asociații sau cerc academic de pe campus și fă o poză acolo.',
    category: 'social', points: 150, icon: 'group',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă o fotografie la întâlnire (sală, oameni, prezentare sau afiș) sau un screenshot cu confirmarea înscrierii/grupului.',
  },
  {
    id: 'w11', title: 'Fă voluntariat o oră',
    description: 'Dedică cel puțin o oră unui act de voluntariat — la o organizație, eveniment sau activitate comunitară.',
    category: 'social', points: 200, icon: 'users',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă o fotografie de la activitatea de voluntariat sau un screenshot cu confirmarea/badge-ul de participare de la organizație.',
  },
  {
    id: 'w12', title: 'Fă un plan de studiu săptămânal',
    description: 'Scrie un plan detaliat de studiu pentru săptămâna viitoare: materii, ore alocate și priorități.',
    category: 'academic', points: 150, icon: 'notes',
    verifyType: 'text',
  },
  {
    id: 'w13', title: 'Citește o lucrare sau articol academic',
    description: 'Citește un articol complet dintr-o revistă academică sau o lucrare de cercetare relevantă domeniului tău. Descrie titlul, ideea principală și ce ai reținut.',
    category: 'academic', points: 150, icon: 'book',
    verifyType: 'text',
  },
  {
    id: 'w14', title: 'Donează sânge',
    description: 'Donează sânge la centrul de transfuzie sau la o campanie organizată pe campus.',
    category: 'social', points: 300, icon: 'users',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Fă o poză cu adeverința/certificatul de donare sau cu confirmarea programării la centrul de transfuzie.',
  },
]

const MONTHLY_POOL = [
  {
    id: 'm1', title: 'Sesiune de învățare cu un coleg',
    description: 'Organizează pe aplicație o sesiune completă de învățare cu un coleg — cel puțin 2 ore pe o temă de examen.',
    category: 'academic', points: 500, icon: 'learn',
    verifyType: 'text',
  },
  {
    id: 'm2', title: 'Aplică la 3 oportunități de carieră',
    description: 'Aplică la minimum 3 internship-uri, job-uri de practică sau programe de cercetare în această lună.',
    category: 'carieră', points: 600, icon: 'career',
    verifyType: 'in-app', inAppAction: 'career-apply', requiredCount: 3,
  },
  {
    id: 'm3', title: 'Participă la un hackathon sau eveniment mare',
    description: 'Participă la un hackathon, conferință, olimpiadă sau eveniment academic major.',
    category: 'campus', points: 700, icon: 'hackathon',
    verifyType: 'screenshot', requiresDate: false,
    screenshotHint: 'Încarcă o fotografie de la eveniment, un screenshot cu confirmarea înscrierii sau un certificat de participare.',
  },
  {
    id: 'm4', title: '10 sesiuni Focus în aceeași lună',
    description: 'Completează 10 sesiuni de Focus Mode în această lună calendaristică.',
    category: 'academic', points: 500, icon: 'streak',
    verifyType: 'in-app', inAppAction: 'focus-session', requiredCount: 10,
  },
]

// ─── Period key helpers ───────────────────────────────────────────────────────
function getDailyKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function getWeeklyKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function getMonthlyKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// ─── Deterministic shuffle ────────────────────────────────────────────────────
function seededPick(pool, count, seed) {
  let s = seed
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}

function dateSeed(periodKey) {
  let h = 2166136261
  for (let i = 0; i < periodKey.length; i++) {
    h ^= periodKey.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function getActiveChallenges() {
  const now = new Date()
  const dailyKey   = getDailyKey(now)
  const weeklyKey  = getWeeklyKey(now)
  const monthlyKey = getMonthlyKey(now)
  const seed = dateSeed(dailyKey)

  const screenshotDailyPool = DAILY_POOL.filter(c => c.verifyType === 'screenshot')
  const textDailyPool       = DAILY_POOL.filter(c => c.verifyType !== 'screenshot')

  const screenshotPicked = screenshotDailyPool.length > 0
    ? seededPick(screenshotDailyPool, 1, seed)
    : []
  const textTasks = seededPick(textDailyPool, screenshotPicked.length > 0 ? 2 : 3, seed ^ 0xdeadbeef)
  const daily = [...screenshotPicked, ...textTasks].map(c => ({ ...c, type: 'daily', periodKey: dailyKey }))

  const weekly  = seededPick(WEEKLY_POOL,  3, dateSeed(weeklyKey)).map(c => ({ ...c, type: 'weekly',  periodKey: weeklyKey }))
  const monthly = seededPick(MONTHLY_POOL, 1, dateSeed(monthlyKey)).map(c => ({ ...c, type: 'monthly', periodKey: monthlyKey }))

  return { daily, weekly, monthly }
}

function findActiveChallenge(challengeId) {
  const { daily, weekly, monthly } = getActiveChallenges()
  return [...daily, ...weekly, ...monthly].find(c => c.id === challengeId) || null
}

// ─── Text proof verification ──────────────────────────────────────────────────
async function verifyWithText(challengeTitle, challengeDescription, proofText) {
  const prompt = `Ești un verificator strict de provocări studențești. Studentul descrie ce a făcut.

PROVOCARE: "${challengeTitle}"
DESCRIERE: "${challengeDescription}"
DOVADA STUDENTULUI: "${proofText}"

Evaluează dacă dovada este specifică și plauzibilă.

Răspunde DOAR cu JSON:
{"approved": true/false, "feedback": "max 2 propoziții în română, prietenos dar direct"}

Reguli stricte:
- approved=true DOAR dacă dovada conține detalii concrete (unde, când, cum, cu cine)
- approved=false dacă: e vagă ("am făcut-o", "da"), sub 30 caractere, sau nu are legătură
- La rejected: explică CE lipsește și cum să corecteze`

  try {
    const completion = await groq.chat.completions.create({
      model: TEXT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 180,
    })
    const raw = completion.choices[0]?.message?.content?.trim() || ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    const result = JSON.parse(jsonMatch[0])
    return {
      approved: Boolean(result.approved),
      feedback: String(result.feedback || 'Mulțumim pentru dovadă!'),
    }
  } catch {
    const approved = proofText.trim().length > 30
    return {
      approved,
      feedback: approved
        ? 'Provocare verificată! Felicitări.'
        : 'Dovada e prea scurtă. Descrie în câteva propoziții ce ai făcut exact (unde, când, cât timp).',
    }
  }
}

// ─── EXIF extraction from base64 image ───────────────────────────────────────
async function extractExif(base64Image) {
  try {
    const buffer = Buffer.from(base64Image, 'base64')
    const exif = await Exifr.parse(buffer, { gps: true, tiff: true, exif: true })
    return exif || null
  } catch {
    return null
  }
}

// ─── Screenshot verification (AI vision model) ───────────────────────────────
async function verifyWithScreenshot(challengeTitle, challengeDescription, screenshotBase64, mimeType, requiresDate = true) {
  const today = getDailyKey()

  // ── EXIF pre-check: if the image has embedded metadata, validate timestamp ──
  const exif = await extractExif(screenshotBase64)
  let exifContext = ''
  if (exif) {
    const exifDate = exif.DateTimeOriginal || exif.CreateDate || exif.DateTime
    if (exifDate) {
      const exifDay = new Date(exifDate).toISOString().slice(0, 10)
      if (requiresDate && exifDay !== today) {
        return {
          approved: false,
          feedback: `Data din metadatele imaginii (${exifDay}) nu corespunde cu ziua de azi (${today}). Asigură-te că poza este de astăzi.`,
        }
      }
      exifContext = `\nMetadate EXIF detectate: data imaginii = ${exifDay} (${exifDay === today ? 'AZI ✓' : exifDay})`
      if (exif.latitude && exif.longitude) {
        exifContext += `, GPS: (${exif.latitude.toFixed(4)}, ${exif.longitude.toFixed(4)})`
      }
    }
  }

  const dateInstruction = requiresDate
    ? `2. Verifică dacă data activității din screenshot corespunde cu data de azi (${today}) sau este din ziua curentă — OBLIGATORIU`
    : `2. Data nu este obligatorie pentru această provocare — ignoră lipsa datei`

  const dateApproval = requiresDate
    ? `- Data din screenshot este de azi (${today})? → DA, NU sau NECLAR (OBLIGATORIU pentru aprobare)`
    : `- Data din screenshot: nu este criteriu de aprobare pentru această provocare`

  const dateStrictness = requiresDate
    ? `Fii STRICT cu data — dacă nu se vede data de azi clar, approved=false.`
    : `Data NU este criteriu de respingere pentru această provocare.`

  const prompt = `Ești un verificator de provocări studențești. Analizezi un screenshot trimis ca dovadă.

DATA DE AZI: ${today}${exifContext}
PROVOCARE: "${challengeTitle}"
CE TREBUIE SĂ VERIFICI: "${challengeDescription}"

INSTRUCȚIUNI DE ANALIZĂ:
1. Identifică ce se vede în screenshot (aplicație fitness, fotografie, document, etc.)
${dateInstruction}
3. Verifică dacă conținutul screenshot-ului corespunde cu provocarea
4. Verifică dacă pare un screenshot/fotografie reală (nu editată evident)

CRITERII DE APROBARE:
- Conținutul corespunde provocării? → DA sau NU
${dateApproval}
- Imaginea pare autentică? → DA sau NU

Răspunde DOAR cu JSON valid:
{
  "approved": true/false,
  "app_detected": "ce s-a detectat în imagine sau 'necunoscut'",
  "date_matches": true/false/null,
  "activity_matches": true/false,
  "feedback": "1-2 propoziții în română, explică decizia"
}

${dateStrictness}
Fii rezonabil cu conținutul — dacă imaginea corespunde clar provocării, aprobă.`

  try {
    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${screenshotBase64}` } },
            { type: 'text',      text: prompt },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 300,
    })
    const raw = completion.choices[0]?.message?.content?.trim() || ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    const result = JSON.parse(jsonMatch[0])
    return {
      approved: Boolean(result.approved),
      feedback: String(result.feedback || 'Analiza imaginii finalizată.'),
      appDetected: result.app_detected || null,
    }
  } catch (err) {
    console.error('[challenges] Vision verification error:', err.message)
    return {
      approved: false,
      feedback: 'Nu am putut analiza imaginea. Asigură-te că screenshot-ul e clar și arată aplicația de fitness cu data de azi vizibilă.',
    }
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export function createChallengesHandler() {
  return async function handleChallenges(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // GET /api/challenges/:userId
    const getMatch = req.url?.match(/^\/api\/challenges\/([^/?]+)$/)
    if (req.method === 'GET' && getMatch) {
      const userId = decodeURIComponent(getMatch[1])
      const { daily, weekly, monthly } = getActiveChallenges()
      const allChallenges = [...daily, ...weekly, ...monthly]

      const periodKeys = [...new Set(allChallenges.map(c => c.periodKey))]
      const completions = periodKeys.length > 0
        ? (await query(
            `SELECT challenge_id, period_key, status, ai_feedback, points, submitted_at
             FROM challenge_completions WHERE user_id = $1 AND period_key = ANY($2)`,
            [userId, periodKeys]
          )).rows
        : []

      const completionMap = new Map(completions.map(r => [`${r.period_key}:${r.challenge_id}`, r]))

      const enrich = async (c) => {
        const comp = completionMap.get(`${c.periodKey}:${c.id}`)
        let progress = undefined
        if (c.verifyType === 'in-app' && c.inAppAction) {
          const { rows } = await query(
            'SELECT count FROM challenge_progress WHERE user_id = $1 AND action_type = $2 AND period_key = $3',
            [userId, c.inAppAction, c.periodKey]
          )
          progress = rows[0]?.count || 0
        }
        return {
          ...c,
          status: comp?.status || 'available',
          aiFeedback: comp?.ai_feedback || null,
          earnedPoints: comp?.points || 0,
          submittedAt: comp?.submitted_at || null,
          progress,
        }
      }

      const { rows: totalRows } = await query(
        `SELECT COALESCE(SUM(points), 0) as total FROM challenge_completions WHERE user_id = $1 AND status = $2`,
        [userId, 'approved']
      )

      const [enrichedDaily, enrichedWeekly, enrichedMonthly] = await Promise.all([
        Promise.all(daily.map(enrich)),
        Promise.all(weekly.map(enrich)),
        Promise.all(monthly.map(enrich)),
      ])

      res.writeHead(200)
      res.end(JSON.stringify({
        daily: enrichedDaily,
        weekly: enrichedWeekly,
        monthly: enrichedMonthly,
        totalPoints: parseInt(totalRows[0]?.total) || 0,
        periods: { daily: getDailyKey(), weekly: getWeeklyKey(), monthly: getMonthlyKey() },
      }))
      return
    }

    // POST /api/challenges/submit
    if (req.method === 'POST' && req.url === '/api/challenges/submit') {
      const MAX_BODY_BYTES = 12 * 1024 * 1024
      let body = ''
      let bodyBytes = 0
      for await (const chunk of req) {
        bodyBytes += Buffer.byteLength(chunk)
        if (bodyBytes > MAX_BODY_BYTES) {
          res.writeHead(413); res.end(JSON.stringify({ error: 'Request prea mare. Maxim 8MB per imagine.' })); return
        }
        body += chunk
      }

      let parsed
      try { parsed = JSON.parse(body) } catch {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); return
      }

      const { userId, challengeId, proofText, proofImage, proofImageMime, userName, userScope } = parsed

      if (!userId || !challengeId) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'userId și challengeId sunt necesare' })); return
      }

      const challenge = findActiveChallenge(challengeId)
      if (!challenge) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Provocare inexistentă sau expirată.' })); return
      }

      const { verifyType, periodKey, type: challengeType, points: basePoints,
              title: challengeTitle, description: challengeDescription,
              requiresDate = true } = challenge

      if (verifyType === 'screenshot' && !proofImage) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Screenshot-ul este necesar pentru această provocare.' })); return
      }
      if (verifyType === 'text' && !proofText?.trim()) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Descrierea dovezii este necesară.' })); return
      }
      if (!periodKey) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Perioadă invalidă.' })); return
      }

      const { rows: existingRows } = await query(
        'SELECT status FROM challenge_completions WHERE user_id = $1 AND period_key = $2 AND challenge_id = $3',
        [userId, periodKey, challengeId]
      )
      if (existingRows[0]?.status === 'approved') {
        res.writeHead(409); res.end(JSON.stringify({ error: 'Provocarea a fost deja completată.' })); return
      }

      let verifyResult
      if (verifyType === 'screenshot') {
        verifyResult = await verifyWithScreenshot(
          challengeTitle, challengeDescription,
          proofImage, proofImageMime || 'image/jpeg', requiresDate,
        )
      } else {
        verifyResult = await verifyWithText(challengeTitle, challengeDescription, proofText?.trim() || '')
      }

      const { approved, feedback } = verifyResult
      const entryId = `chal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const status = approved ? 'approved' : 'rejected'
      const points = approved ? basePoints : 0
      const storedProof = verifyType === 'screenshot' ? '[screenshot]' : (proofText?.trim() || '')

      await query(`
        INSERT INTO challenge_completions (id, user_id, period_key, challenge_id, status, proof_text, ai_feedback, points, submitted_at, user_name, user_scope)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (user_id, period_key, challenge_id) DO UPDATE SET
          status = EXCLUDED.status, proof_text = EXCLUDED.proof_text,
          ai_feedback = EXCLUDED.ai_feedback, points = EXCLUDED.points, submitted_at = EXCLUDED.submitted_at,
          user_name = COALESCE(EXCLUDED.user_name, challenge_completions.user_name),
          user_scope = COALESCE(EXCLUDED.user_scope, challenge_completions.user_scope)
      `, [entryId, userId, periodKey, challengeId, status, storedProof, feedback, points, nowIso(), userName || null, userScope || null])

      const { rows: totalRows } = await query(
        `SELECT COALESCE(SUM(points), 0) as total FROM challenge_completions WHERE user_id = $1 AND status = $2`,
        [userId, 'approved']
      )

      res.writeHead(200)
      res.end(JSON.stringify({ approved, feedback, points, totalPoints: parseInt(totalRows[0]?.total) || 0 }))
      return
    }

    // POST /api/challenges/in-app-action
    if (req.method === 'POST' && req.url === '/api/challenges/in-app-action') {
      let body = ''
      for await (const chunk of req) body += chunk
      let parsed = {}
      try { parsed = JSON.parse(body) } catch {}
      const { userId, actionType, userName, userScope } = parsed

      if (!userId || !actionType) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'userId și actionType necesare' }))
        return
      }

      const { daily, weekly, monthly } = getActiveChallenges()
      const inAppChallenges = [...daily, ...weekly, ...monthly].filter(
        c => c.verifyType === 'in-app' && c.inAppAction === actionType
      )

      const completed = []

      for (const challenge of inAppChallenges) {
        const { id: challengeId, periodKey, points: basePoints, title, requiredCount = 1 } = challenge

        const { rows: existingRows } = await query(
          'SELECT status FROM challenge_completions WHERE user_id = $1 AND period_key = $2 AND challenge_id = $3',
          [userId, periodKey, challengeId]
        )
        if (existingRows[0]?.status === 'approved') continue

        await query(`
          INSERT INTO challenge_progress (user_id, action_type, period_key, count)
          VALUES ($1, $2, $3, 1)
          ON CONFLICT (user_id, action_type, period_key) DO UPDATE SET count = challenge_progress.count + 1
        `, [userId, actionType, periodKey])

        const { rows: progressRows } = await query(
          'SELECT count FROM challenge_progress WHERE user_id = $1 AND action_type = $2 AND period_key = $3',
          [userId, actionType, periodKey]
        )
        const count = progressRows[0]?.count || 0

        if (count >= requiredCount) {
          const compId = `chal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          const feedbackMap = {
            'career-apply': count === 1
              ? 'Provocare completată automat — ai aplicat la un internship din aplicație!'
              : `Provocare completată automat — ai aplicat la ${count} oportunități de carieră!`,
            'focus-session': count < requiredCount
              ? `Progres: ${count}/${requiredCount} sesiuni focus completate.`
              : requiredCount === 1
                ? 'Sesiune Focus de 25 de minute completată automat!'
                : `Felicitări! Ai completat ${count} sesiuni Focus în această lună!`,
            'message-sent': 'Provocare completată automat — ai trimis un mesaj unui coleg din aplicație!',
            'tutoring-booked': 'Sesiune de tutoring sau Skill Swap rezervată din aplicație — provocare completată automat!',
          }
          const feedback = feedbackMap[actionType] || `Provocare "${title}" completată automat!`

          await query(`
            INSERT INTO challenge_completions (id, user_id, period_key, challenge_id, status, proof_text, ai_feedback, points, submitted_at, user_name, user_scope)
            VALUES ($1, $2, $3, $4, 'approved', $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id, period_key, challenge_id) DO UPDATE SET
              status = 'approved', proof_text = EXCLUDED.proof_text,
              ai_feedback = EXCLUDED.ai_feedback, points = EXCLUDED.points, submitted_at = EXCLUDED.submitted_at,
              user_name = COALESCE(EXCLUDED.user_name, challenge_completions.user_name),
              user_scope = COALESCE(EXCLUDED.user_scope, challenge_completions.user_scope)
          `, [compId, userId, periodKey, challengeId, `[in-app: ${actionType} ×${count}]`, feedback, basePoints, nowIso(), userName || null, userScope || null])

          completed.push({ id: challengeId, title, points: basePoints, count, requiredCount })
        }
      }

      const progressMap = {}
      for (const c of inAppChallenges) {
        const { rows } = await query(
          'SELECT count FROM challenge_progress WHERE user_id = $1 AND action_type = $2 AND period_key = $3',
          [userId, c.inAppAction, c.periodKey]
        )
        progressMap[c.id] = { count: rows[0]?.count || 0, requiredCount: c.requiredCount || 1 }
      }

      res.writeHead(200)
      res.end(JSON.stringify({ completed, progressMap }))
      return
    }

    // GET /api/challenges/leaderboard?scope=universityId:facultyCode
    if (req.method === 'GET' && req.url?.startsWith('/api/challenges/leaderboard')) {
      const urlObj = new URL(req.url, 'http://localhost')
      const scope = urlObj.searchParams.get('scope') || null

      const { rows } = await query(`
        SELECT
          user_id,
          COALESCE(MAX(user_name), 'Utilizator') AS display_name,
          SUM(points)::int                        AS total_points,
          COUNT(*)::int                           AS completed_count
        FROM challenge_completions
        WHERE status = 'approved'
          AND ($1::text IS NULL OR user_scope = $1)
        GROUP BY user_id
        ORDER BY total_points DESC
        LIMIT 10
      `, [scope])

      res.writeHead(200)
      res.end(JSON.stringify({ leaderboard: rows, scope }))
      return
    }

    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Not found' }))
  }
}
