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

const SYSTEM_PROMPT = `Ești un asistent AI pentru studenții de la Facultatea de Informatică, UAIC Iași.
Ajuți studenții să navigheze campusul. Cunoști:
- Corp C (Informatică): C2, C112, C118, C210, C308, C315, C420, laboratoare la parter
- Corp A (Matematică): A1, A205, amfiteatre
- Biblioteca Centrală: L-V 08:00-20:00, în spatele Corpului A
- Cantina: 11:00-15:00, lângă cămine
- Secretariat FII: L-V 09:00-13:00, Corp C parter stânga
- Rectorat: Bd. Carol I nr. 11
Răspunde concis în română. Dacă nu e despre campus, redirecționează politicos.`

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
            text: `Ești un ghid de campus UAIC. Analizează imaginea:
1. Identifică clădirea/locația (dacă recunoști)
2. Descrie ce vezi
3. Oferă indicații utile pentru un student
Răspunde în română, concis.`,
          },
        ],
      },
    ],
    max_tokens: 500,
  })

  return response.choices[0].message.content
}

export async function getSmartRecommendations(schedule) {
  const response = await getGroqClient().chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Pe baza orarului: ${JSON.stringify(schedule)}, oferă 3 recomandări smart pentru azi:
- ruta optimă între săli
- cum să folosești timpul liber (bibliotecă, cantină)
- avertismente (distanțe mari între săli consecutive)
Răspunde în română, bullet points, max 100 cuvinte.`,
      },
    ],
    max_tokens: 300,
  })

  return response.choices[0].message.content
}
