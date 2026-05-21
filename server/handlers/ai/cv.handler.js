import { TEXT_MODEL, safeJson } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'
import { asArray, asObject, asString } from '../navigation.validation.js'

async function handleCVAnalysis(req, res) {
  const body = asObject(await readJson(req))
  const cvText = asString(body.cvText, 'cvText', { required: true, min: 30 })
  const jobs = asArray(body.jobs, 'jobs')

  if (!cvText || cvText.trim().length < 30) {
    sendJson(res, 400, { error: 'CV text prea scurt. Adaugă mai mult conținut.' })
    return
  }

  const jobsContext = jobs
    .map(j => `ID:${j.id} | ${j.role} la ${j.company} | Skills: ${(j.tags || []).join(', ')} | Tip: ${j.type}`)
    .join('\n')

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `Ești un consultant de carieră specializat pentru studenți din România. Analizezi CV-uri și identifici potrivirea cu oportunități de stagii și internship-uri.
Răspunzi ÎNTOTDEAUNA în română, concis și specific. Răspunsul tău este STRICT un obiect JSON valid, fără text suplimentar.`,
      },
      {
        role: 'user',
        content: `Analizează CV-ul următor și returnează un JSON cu exact aceste câmpuri:
{
  "skills": ["skill1", "skill2", ...],           // max 10 skill-uri tehnice/soft extrase din CV
  "experienceLevel": "fara experienta" | "incepator" | "intermediar" | "avansat",
  "summary": "rezumat profesional 1-2 propoziții în română",
  "jobAdjustments": [                             // DOAR pentru joburi cu adjustment diferit de 0
    { "jobId": <number>, "adjustment": <-20 to +35>, "reason": "motiv scurt în română" }
  ]
}

Joburi disponibile:
${jobsContext || 'Niciun job disponibil'}

CV:
${cvText.slice(0, 4000)}`,
      },
    ],
    max_tokens: 900,
    response_format: { type: 'json_object' },
  })

  let parsed = {}
  try { parsed = JSON.parse(raw) } catch { parsed = {} }

  sendJson(res, 200, {
    skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 10).map(String) : [],
    experienceLevel: parsed.experienceLevel || 'incepator',
    summary: String(parsed.summary || ''),
    jobAdjustments: Array.isArray(parsed.jobAdjustments)
      ? parsed.jobAdjustments.filter(j => j.jobId && typeof j.adjustment === 'number')
      : [],
  })
}


export { handleCVAnalysis }

