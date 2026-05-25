import { TEXT_MODEL, safeJson } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'

async function handleAdaptationProfile(req, res) {
  const body = await readJson(req)
  const { answers = {} } = body

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `Ești un asistent de onboarding pentru studenți români. Primești răspunsurile unui chestionar și generezi un profil personalizat.
Răspunzi ÎNTOTDEAUNA în română. Răspunsul tău este STRICT un obiect JSON valid, fără text suplimentar.

Reguli stricte:
- urgentTasks: exact 3 sarcini concrete, formulate ca "Verb + obiect" (ex: "Mergi la secretariat cu dosarul", "Activează cardul de transport"). Max 55 caractere per task. Bazează-le pe situația reală din răspunsuri.
- tips: exact 2 sfaturi practice și specifice contextului studentului. Nu sfaturi generice.
- personalityTag: alege UNUL din: "Student practic", "Vizual & colaborativ", "Teoretician metodic", "Social & activ", "Independent & autodidact", "Orientat spre carieră", "Echilibrat & organizat". Alege cel mai potrivit pe baza răspunsurilor.
- recommendedModules: exact 3 module din: "Campus Navigator", "Schedule Hub", "Peer Tutoring", "Messages", "Student Life", "City Adaptation", "Thesis Finder". Alege pe cele mai relevante pentru profilul studentului.`,
      },
      {
        role: 'user',
        content: `Analizează răspunsurile și generează un profil JSON cu exact aceste câmpuri:
{
  "welcomeMessage": "mesaj personalizat de 1-2 propoziții care să reflecte situația concretă a studentului (nu generic)",
  "urgentTasks": ["Verb + obiect concret", "Verb + obiect concret", "Verb + obiect concret"],
  "tips": ["sfat specific situației 1", "sfat specific situației 2"],
  "personalityTag": "unul din tag-urile enumerate",
  "recommendedModules": ["Modul1", "Modul2", "Modul3"]
}

Răspunsuri onboarding:
${JSON.stringify(answers, null, 2)}`,
      },
    ],
    max_tokens: 600,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const fallback = {
    welcomeMessage: 'Bun venit în StudentCompass! Am personalizat platforma în funcție de profilul tău.',
    urgentTasks: ['Mergi la secretariat cu dosarul', 'Obține carnetul de student', 'Configurează orarul'],
    tips: ['Explorează Campus Navigator pentru a te orienta rapid', 'Verifică orarul în Schedule Hub'],
    personalityTag: 'Student motivat',
    recommendedModules: ['Campus Navigator', 'Schedule Hub', 'Peer Tutoring'],
  }

  const parsed = safeJson(raw, fallback)
  sendJson(res, 200, {
    welcomeMessage: String(parsed.welcomeMessage || fallback.welcomeMessage),
    urgentTasks: Array.isArray(parsed.urgentTasks) ? parsed.urgentTasks.slice(0, 4).map(String) : fallback.urgentTasks,
    tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3).map(String) : fallback.tips,
    personalityTag: String(parsed.personalityTag || fallback.personalityTag),
    recommendedModules: Array.isArray(parsed.recommendedModules) ? parsed.recommendedModules.slice(0, 4).map(String) : fallback.recommendedModules,
  })
}


export { handleAdaptationProfile }
