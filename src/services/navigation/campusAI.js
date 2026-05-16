import Groq from 'groq-sdk'

let groq

function getGroqClient() {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) {
    throw new Error('Lipseste VITE_GROQ_API_KEY in fisierul .env.')
  }

  groq ??= new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  return groq
}

const TEXT_MODEL = 'llama-3.3-70b-versatile'
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

const SYSTEM_PROMPT = `Ești Campus AI, asistentul inteligent al studenților de la UAIC Iași (Universitatea Alexandru Ioan Cuza).
Răspunzi ÎNTOTDEAUNA în română, concis și practic. Ești prietenos dar la obiect — nu filozofa, nu da răspunsuri vagi.

═══════════════════════════════════════
CORP C — FACULTATEA DE INFORMATICĂ
═══════════════════════════════════════
PARTER:
- Secretariat FII: intrare stânga, program L-V 09:00-13:00
- C2 (Aula Mare): 250 locuri, amfiteatru principal, parter dreapta
- Lab 101, Lab 102: laboratoare PC, parter mijloc
- Avizier + decanat: culoarul principal parter

ETAJ 1:
- C112, C114, C116, C118: săli de curs medii ~80 locuri
- Birouri profesori: capătul coridorului

ETAJ 2:
- C210, C212: săli de curs ~60 locuri
- Lab 205, Lab 206: laboratoare specializate

ETAJ 3:
- C308, C310, C315: săli de curs ~60 locuri
- Sala de consiliu: C305

ETAJ 4:
- C420 (Amfiteatru Mare): 300 locuri, cel mai mare din facultate
- C418: sală conferințe

SCARA principală: dreapta intrării principale. LIFT: lângă secretariat.

═══════════════════════════════════════
CORP A — MATEMATICĂ & INFORMATICĂ
═══════════════════════════════════════
- A1: amfiteatru mare, parter
- A205, A210: săli etaj 2
- Birou profesori matematică: etaj 1-3
- Acces: din curtea interioară sau Bd. Carol I

═══════════════════════════════════════
ALTE CLĂDIRI CAMPUS
═══════════════════════════════════════
- Biblioteca Centrală UAIC: L-V 08:00-20:00, S 09:00-14:00; în spatele Corp A; necesită legitimație student
- Cantina Studențească: L-V 11:00-15:00, prânz ~15 lei; lângă cămine, 5 min de Corp C
- Rectorat: Bd. Carol I nr. 11 (10 min pe jos de FII)
- Casa de Cultură Studențească: lângă cămine

═══════════════════════════════════════
PUNCTE DE INTERES (magazine, servicii)
═══════════════════════════════════════
- Magazin Petru Luca (minimarket): colț campus, L-D 07:00-22:00, 2 min de Corp C
- Farmacia Catena: Bd. Carol I, L-V 08:00-20:00, S 09:00-15:00
- Coffee Campus (cafenea): L-V 07:30-19:00, Wi-Fi gratuit, prize la fiecare masă
- Kebab & Pizza Express: L-D 10:00-24:00, lângă campus
- Profi Copou (supermarket): 5 min pe jos, L-D 07:00-22:00
- ATM BRD: lângă Corp C, 24/7, gratuit pentru clienți BRD
- Copisterie FII: în Corp C, L-V 08:00-17:00 (print, spiralare, laminare)
- Librărie Universității: L-V 09:00-18:00

═══════════════════════════════════════
NAVIGARE ȘI TRASEE
═══════════════════════════════════════
- Corp C → Corp A: 5 min pe jos, treci prin curtea interioară
- Corp C → Bibliotecă: 3 min, ieși pe ușa din spate Corp C
- Corp C → Cantină: 8 min pe jos, urmează aleea principală spre cămine
- Corp C → Rectorat: 10 min pe jos pe Bd. Carol I
- Intrare principală campus: Bd. Carol I (tramvai 7, 13)
- Parcare studenți: lateral de Corp C

═══════════════════════════════════════
REGULI DE RĂSPUNS
═══════════════════════════════════════
1. Dacă întreabă unde e o sală (ex: "unde e C310"): spune ETAJUL, cum se ajunge de la intrare, orice detalii utile.
2. Dacă întreabă traseu (ex: "cum ajung de la C2 la C420"): dă pași clari.
3. Dacă întreabă orar (secretariat, cantină, bibliotecă): dă orele exacte.
4. Dacă întreabă despre servicii (print, ATM, mâncare): ghidează spre locul potrivit.
5. Dacă întrebarea NU e despre campus: răspunde politicos "Nu am informații despre asta, dar te pot ajuta să navighezi campusul UAIC."
6. NU inventa informații. Dacă nu știi sigur, spune "Nu am date exacte despre asta."
7. Răspunsuri scurte: maxim 4-5 propoziții. Fii specific, nu vag.`

export async function askCampusAI(userMessage, history = []) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ]

  const response = await getGroqClient().chat.completions.create({
    model: TEXT_MODEL,
    messages,
    max_tokens: 500,
  })

  return response.choices[0].message.content
}

export async function analyzePhoto(base64Image, mimeType = 'image/jpeg') {
  const response = await getGroqClient().chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
          {
            type: 'text',
            text: `Ești Campus AI, ghidul studenților de la UAIC Iași. Analizează această imagine din campusul universitar.

CLĂDIRILE UAIC pe care le poți recunoaște vizual:
- Corp C (Facultatea de Informatică): clădire modernă cu 4 etaje, fațadă albă/gri, ferestre mari dreptunghiulare, intrare principală cu trepte, situată pe Bd. Carol I. Are un panou FII la intrare.
- Corp A (Matematică): clădire clasică cu aspect mai vechi, cărămidă sau tencuială, mai multe etaje, curte interioară comună cu Corp C.
- Biblioteca Centrală UAIC: clădire mare, stil arhitectural academic, în spatele corpurilor principale.
- Cantina Studențească: clădire separată mai mică, lângă cămine.
- Rectorat UAIC: clădire impozantă istorică pe Bd. Carol I nr. 11, stil neoclasic.

INSTRUCȚIUNI:
1. Uită-te atent la fațadă, stil arhitectural, ferestre, dimensiuni, culori.
2. Identifică clădirea — dacă seamănă cu Corp C (fațadă modernă albă, ferestre mari, etaje): spune că e FACULTATEA DE INFORMATICĂ - CORP C.
3. Dacă nu poți identifica cu certitudine, descrie ce vezi și sugerează clădirile posibile.
4. Oferă 2-3 indicații practice pentru un student (unde să intre, ce găsește acolo).
5. Răspunde în română, maxim 5 propoziții, fără liste lungi.`,
          },
        ],
      },
    ],
    max_tokens: 400,
  })

  return response.choices[0].message.content
}

export async function getSmartRecommendations({ hour, totalUsers, schedule }) {
  const crowdLevel = totalUsers === 0 ? 'necunoscut' : totalUsers < 80 ? 'scăzut' : totalUsers < 160 ? 'moderat' : 'ridicat'
  const timeSlot = hour < 10 ? 'dimineața' : hour < 13 ? 'la prânz' : hour < 17 ? 'după-amiaza' : 'seara'

  const response = await getGroqClient().chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Ora curentă: ${hour}:00 (${timeSlot}). Trafic campus: ${crowdLevel} (${totalUsers} studenți activi).
Orar student: ${JSON.stringify(schedule)}.

Generează exact 4 recomandări smart și practice pentru acest moment. Răspunde DOAR cu JSON valid, fără text suplimentar:

{
  "briefing": "O propoziție scurtă despre starea campusului acum.",
  "cards": [
    {
      "id": "unic-id",
      "emoji": "emoji relevant",
      "title": "Titlu scurt (max 4 cuvinte)",
      "desc": "Descriere practică, specifică, 1-2 propoziții.",
      "urgency": "low|medium|high"
    }
  ]
}

Reguli: urgency=high pentru lucruri care necesită atenție acum (cantina plină, program care se închide etc.), medium pentru sfaturi utile, low pentru informații generale. Fii specific față de ora și traficul real.`,
      },
    ],
    max_tokens: 600,
    response_format: { type: 'json_object' },
  })

  const raw = response.choices[0].message.content
  try {
    return JSON.parse(raw)
  } catch {
    return { briefing: 'Campus activ.', cards: [] }
  }
}
