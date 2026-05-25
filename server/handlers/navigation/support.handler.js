import { TEXT_MODEL, safeJson } from '../navigation.constants.js'
import { grokChat, readJson, sendJson } from '../navigation.http.js'
import { asArray, asObject, asString } from '../navigation.validation.js'

async function handleSupportAssistant(req, res) {
  const body = asObject(await readJson(req))
  const context = body.context ? asObject(body.context, 'context') : {}
  const fallbackSuggestions = context.role === 'professor'
    ? ['Ce pot gestiona aici?', 'Cum functioneaza cererile de licenta?', 'Cum functioneaza mesajele?']
    : ['Ce pot face aici?', 'Deschide Campus Navigator', 'Cum functioneaza cererile de licenta?']

  const raw = await grokChat({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content: `Esti asistentul virtual de suport din StudentCompass.
Raspunde intotdeauna in romana. Fii concis, practic si orientat pe produs.

Poti ajuta cu:
- acces la cont, email institutional, onboarding si profil
- module de student: Dashboard, Campus Navigator, Schedule Hub, Thesis Finder, Peer Tutoring, Messages, Student Life, City Adaptation
- module de profesor: dashboard, profil academic, cereri de licenta, cereri de recuperare si mesaje
- intrebari de baza despre viata studenteasca

Reguli:
- Nu spune ca ai modificat datele contului daca utilizatorul nu a folosit un control din aplicatie.
- Nu inventa politici, note, sfaturi juridice/medicale/financiare sau date private.
- Daca intrebarea este in afara StudentCompass, raspunde scurt daca este ceva de baza; altfel redirectioneaza catre ce poate face aplicatia.
- Foloseste campul "currentView" si "currentLabel" din context pentru a da raspunsuri relevante pentru sectiunea curenta.
- answer: maxim 3 propozitii clare si directe.
- suggestions: exact 3 intrebari scurte (max 45 caractere fiecare) pe care utilizatorul le-ar putea pune in continuare, relevante pentru contextul curent.
- Returneaza doar JSON cu forma: {"answer":"...", "suggestions":["...", "...", "..."]}.`,
      },
      {
        role: 'user',
        content: `Contextul curent al aplicatiei:
${JSON.stringify({
  role: context.role,
  university: context.university,
  faculty: context.faculty || context.detectedFaculty,
  year: context.year,
  platformMode: context.platformMode,
  currentView: context.currentView,
  currentLabel: context.currentLabel,
})}

Conversatia recenta:
${JSON.stringify(asArray(body.history, 'history').slice(-8))}

Intrebarea utilizatorului:
${asString(body.message, 'message')}`,
      },
    ],
    max_tokens: 520,
    response_format: { type: 'json_object' },
  })

  const parsed = safeJson(raw, { answer: raw, suggestions: fallbackSuggestions })
  sendJson(res, 200, {
    answer: String(parsed.answer || raw || 'Te pot ajuta cu intrebari despre cont, module, mesaje, orar, cereri de licenta si viata studenteasca.'),
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.slice(0, 3).map(String)
      : fallbackSuggestions,
  })
}

export { handleSupportAssistant }
