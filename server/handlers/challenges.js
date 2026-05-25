import Groq from 'groq-sdk'
import { db, nowIso } from '../db/database.js'
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
// verifyType:
//   'screenshot' → user uploads fitness app screenshot → AI vision verifies
//   'text'       → user writes what they did → AI text verifies

const DAILY_POOL = [
  {
    id: 'd1', title: 'Mers pe jos 30 de minute',
    description: 'Fă o plimbare de cel puțin 30 de minute — pe campus, în parc sau în oraș.',
    category: 'sănătate', points: 50, icon: 'walking',
    verifyType: 'screenshot',
    screenshotHint: 'Încarcă un screenshot din Google Fit, Strava, Samsung Health sau Apple Health care să arate activitatea de azi (mers ≥ 30 min cu data vizibilă).',
  },
  {
    id: 'd2', title: 'Sesiune Focus de 25 minute',
    description: 'Completează o sesiune de studiu în Focus Mode din aplicație fără întreruperi.',
    category: 'academic', points: 50, icon: 'focus',
    verifyType: 'text',
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
    verifyType: 'screenshot',
    screenshotHint: 'Încarcă un screenshot din Google Fit, Samsung Health sau orice aplicație de fitness care arată o activitate fizică de azi (yoga, stretching, exerciții ușoare).',
  },
  {
    id: 'd7', title: 'Contactează un coleg',
    description: 'Trimite un mesaj util unui coleg — o resursă, un sfat sau o întrebare pentru un proiect comun.',
    category: 'social', points: 40, icon: 'message',
    verifyType: 'text',
  },
  {
    id: 'd8', title: 'Organizează-ți notițele',
    description: 'Organizează sau rezumă notițele de la cursul de azi în maxim 30 de minute.',
    category: 'academic', points: 40, icon: 'notes',
    verifyType: 'text',
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
    description: 'Participă la o sesiune de Peer Tutoring sau Skill Swap din aplicație cu un coleg.',
    category: 'academic', points: 150, icon: 'tutoring',
    verifyType: 'text',
  },
  {
    id: 'w2', title: 'Aplică la un internship',
    description: 'Aplică la un internship sau oportunitate de practică din secțiunea Carieră a aplicației.',
    category: 'carieră', points: 200, icon: 'briefcase',
    verifyType: 'text',
  },
  {
    id: 'w3', title: 'Vizitează biblioteca',
    description: 'Mergi fizic la biblioteca campusului și studiază acolo cel puțin o oră.',
    category: 'campus', points: 150, icon: 'library',
    verifyType: 'screenshot',
    screenshotHint: 'Fă o fotografie în interiorul bibliotecii (raft cu cărți, sală de lectură, intrare) cu data de azi vizibilă sau trimite-o direct ca dovadă.',
  },
  {
    id: 'w4', title: 'Sesiune de studiu în grup',
    description: 'Organizează sau participă la o sesiune de studiu în grup cu minimum 2 colegi.',
    category: 'social', points: 150, icon: 'group',
    verifyType: 'text',
  },
  {
    id: 'w5', title: 'Workout 45 minute',
    description: 'Fă un antrenament de 45 de minute — sală, alergat, înot sau sport de echipă.',
    category: 'sănătate', points: 150, icon: 'workout',
    verifyType: 'screenshot',
    screenshotHint: 'Încarcă un screenshot din Google Fit, Strava, Samsung Health, Nike Run Club sau orice aplicație de sport care arată antrenamentul de azi (≥ 45 min, data vizibilă).',
  },
  {
    id: 'w6', title: 'Participă la un eveniment de campus',
    description: 'Mergi la un eveniment studențesc — conferință, club, workshop sau activitate culturală.',
    category: 'campus', points: 200, icon: 'event',
    verifyType: 'screenshot',
    screenshotHint: 'Fă o fotografie la eveniment (afișul, sala, certificat de participare) sau un screenshot cu confirmarea înregistrării/biletului.',
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
    verifyType: 'text',
  },
  {
    id: 'm3', title: 'Participă la un hackathon sau eveniment mare',
    description: 'Participă la un hackathon, conferință, olimpiadă sau eveniment academic major.',
    category: 'campus', points: 700, icon: 'hackathon',
    verifyType: 'screenshot',
    screenshotHint: 'Încarcă o fotografie de la eveniment, un screenshot cu confirmarea înscrierii sau un certificat de participare.',
  },
  {
    id: 'm4', title: '10 sesiuni Focus în aceeași lună',
    description: 'Completează 10 sesiuni de Focus Mode în această lună calendaristică.',
    category: 'academic', points: 500, icon: 'streak',
    verifyType: 'text',
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

  // Slot 0: always a screenshot task (physical) — rotates among screenshot-only daily tasks
  const screenshotDailyPool = DAILY_POOL.filter(c => c.verifyType === 'screenshot')
  const textDailyPool       = DAILY_POOL.filter(c => c.verifyType !== 'screenshot')
  const [screenshotTask] = seededPick(screenshotDailyPool, 1, seed)
  const textTasks        = seededPick(textDailyPool, 2, seed ^ 0xdeadbeef)
  const daily = [screenshotTask, ...textTasks].map(c => ({ ...c, type: 'daily', periodKey: dailyKey }))

  const weekly  = seededPick(WEEKLY_POOL,  2, dateSeed(weeklyKey)).map(c => ({ ...c, type: 'weekly',  periodKey: weeklyKey }))
  const monthly = seededPick(MONTHLY_POOL, 1, dateSeed(monthlyKey)).map(c => ({ ...c, type: 'monthly', periodKey: monthlyKey }))

  return { daily, weekly, monthly }
}

// ─── Text proof verification (AI text model) ─────────────────────────────────
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

// ─── Screenshot verification (AI vision model) ───────────────────────────────
async function verifyWithScreenshot(challengeTitle, challengeDescription, screenshotBase64, mimeType) {
  const today = getDailyKey()  // e.g. "2026-05-25"

  const prompt = `Ești un verificator de provocări studențești. Analizezi un screenshot trimis ca dovadă.

DATA DE AZI: ${today}
PROVOCARE: "${challengeTitle}"
CE TREBUIE SĂ VERIFICI: "${challengeDescription}"

INSTRUCȚIUNI DE ANALIZĂ:
1. Identifică aplicația din screenshot (Google Fit, Strava, Samsung Health, Apple Health, Nike Run, Fitbit, Garmin, etc.)
2. Verifică dacă data activității din screenshot corespunde cu data de azi (${today}) sau este din ziua curentă
3. Verifică dacă activitatea din screenshot corespunde cu provocarea (tip activitate, durată minimă)
4. Verifică dacă pare un screenshot real (nu editat evident)

CRITERII DE APROBARE:
- Este o aplicație de fitness / sport / sănătate reală? → DA sau NU
- Data din screenshot este de azi (${today})? → DA, NU sau NECLAR
- Activitatea corespunde provocării? → DA sau NU
- Durata/distanța îndeplinește minimul cerut? → DA, NU sau NECLAR

Răspunde DOAR cu JSON valid:
{
  "approved": true/false,
  "app_detected": "numele aplicației sau 'necunoscut'",
  "date_matches": true/false/null,
  "activity_matches": true/false,
  "feedback": "1-2 propoziții în română, explică decizia"
}

Fii STRICT cu data — dacă nu se vede data de azi clar, approved=false.
Fii STRICT cu aplicația — dacă nu e o aplicație reală de fitness/sport, approved=false.`

  try {
    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${screenshotBase64}` } },
            { type: 'text', text: prompt },
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
      const placeholders = periodKeys.map(() => '?').join(',')
      const completions = periodKeys.length > 0
        ? db.prepare(`SELECT challenge_id, period_key, status, ai_feedback, points, submitted_at FROM challenge_completions WHERE user_id = ? AND period_key IN (${placeholders})`).all(userId, ...periodKeys)
        : []

      const completionMap = new Map(completions.map(r => [`${r.period_key}:${r.challenge_id}`, r]))

      const enrich = (c) => {
        const comp = completionMap.get(`${c.periodKey}:${c.id}`)
        return {
          ...c,
          status: comp?.status || 'available',
          aiFeedback: comp?.ai_feedback || null,
          earnedPoints: comp?.points || 0,
          submittedAt: comp?.submitted_at || null,
        }
      }

      const totalRow = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM challenge_completions WHERE user_id = ? AND status = ?').get(userId, 'approved')

      res.writeHead(200)
      res.end(JSON.stringify({
        daily: daily.map(enrich),
        weekly: weekly.map(enrich),
        monthly: monthly.map(enrich),
        totalPoints: totalRow?.total || 0,
        periods: { daily: getDailyKey(), weekly: getWeeklyKey(), monthly: getMonthlyKey() },
      }))
      return
    }

    // POST /api/challenges/submit
    if (req.method === 'POST' && req.url === '/api/challenges/submit') {
      let body = ''
      for await (const chunk of req) body += chunk
      let parsed
      try { parsed = JSON.parse(body) } catch {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); return
      }

      const {
        userId, challengeId, challengeType, periodKey,
        proofText, proofImage, proofImageMime,
        verifyType,
        challengeTitle, challengeDescription,
      } = parsed

      if (!userId || !challengeId) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'userId și challengeId sunt necesare' })); return
      }

      if (verifyType === 'screenshot' && !proofImage) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Screenshot-ul este necesar pentru această provocare.' })); return
      }
      if (verifyType === 'text' && !proofText?.trim()) {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Descrierea dovezii este necesară.' })); return
      }

      // Already approved → block
      const existing = db.prepare('SELECT status FROM challenge_completions WHERE user_id = ? AND period_key = ? AND challenge_id = ?').get(userId, periodKey, challengeId)
      if (existing?.status === 'approved') {
        res.writeHead(409); res.end(JSON.stringify({ error: 'Provocarea a fost deja completată.' })); return
      }

      const pointsMap = { daily: 50, weekly: 150, monthly: 500 }
      const basePoints = pointsMap[challengeType] || 50

      // Verify based on type
      let verifyResult
      if (verifyType === 'screenshot') {
        verifyResult = await verifyWithScreenshot(
          challengeTitle || challengeId,
          challengeDescription || '',
          proofImage,
          proofImageMime || 'image/jpeg',
        )
      } else {
        verifyResult = await verifyWithText(
          challengeTitle || challengeId,
          challengeDescription || '',
          proofText?.trim() || '',
        )
      }

      const { approved, feedback } = verifyResult
      const id = `chal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const status = approved ? 'approved' : 'rejected'
      const points = approved ? basePoints : 0
      const storedProof = verifyType === 'screenshot' ? '[screenshot]' : (proofText?.trim() || '')

      db.prepare(`
        INSERT INTO challenge_completions (id, user_id, period_key, challenge_id, status, proof_text, ai_feedback, points, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, period_key, challenge_id) DO UPDATE SET
          status = excluded.status, proof_text = excluded.proof_text,
          ai_feedback = excluded.ai_feedback, points = excluded.points, submitted_at = excluded.submitted_at
      `).run(id, userId, periodKey, challengeId, status, storedProof, feedback, points, nowIso())

      const totalRow = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM challenge_completions WHERE user_id = ? AND status = ?').get(userId, 'approved')

      res.writeHead(200)
      res.end(JSON.stringify({ approved, feedback, points, totalPoints: totalRow?.total || 0 }))
      return
    }

    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Not found' }))
  }
}
