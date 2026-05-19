const API_URL = import.meta.env.VITE_NAVIGATION_API_URL || '/api/navigation'

const FEATURE_GUIDE = {
  dashboard: 'Dashboard-ul arata pe scurt modulele, urmatorul curs, orarul si notificarile.',
  navigator: 'Campus Navigator ajuta cu trasee in campus, rute indoor intre sali, recunoastere din poza si prezentari ghidate.',
  schedule: 'Schedule Hub gestioneaza orarul saptamanal, recuperarile si schimburile de sloturi intre studenti.',
  thesis: 'Thesis Finder ajuta studentii sa gaseasca profesori, sa verifice cerinte si sa trimita cereri de licenta.',
  tutoring: 'Peer Tutoring ajuta studentii sa gaseasca tutori sau colegi cu care pot face schimb de competente.',
  messages: 'Mesajele intre studenti sunt limitate la aceeasi universitate si facultate, iar conversatiile cu profesorii sunt in portalul profesorului.',
  discounts: 'Student Life include reduceri, beneficii, evenimente, comunitati si resurse utile pentru studenti.',
  career: 'Zona de cariera include practica, voluntariat, consiliere si oportunitati relevante pentru studenti.',
  citylife: 'City Adaptation acopera cazarea, transportul, zonele sigure, ponturile locale si ghidarea pentru prima saptamana.',
  professor: 'Portalul profesorului gestioneaza cereri de licenta, cereri de recuperare, profil academic si conversatii student-profesor.',
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function profileLine(context) {
  if (context?.role === 'professor') {
    return 'Esti in portalul profesorului. Poti verifica cereri de la studenti, actualiza profilul academic si raspunde la mesaje.'
  }
  const faculty = context?.faculty || context?.detectedFaculty || 'facultatea ta'
  const year = context?.year || 'anul tau de studiu'
  return `Folosesti spatiul de student pentru ${faculty}, ${year}.`
}

export function localVirtualAssistantAnswer(message, context = {}) {
  const q = normalize(message)
  const current = context?.currentView
  const currentGuide = FEATURE_GUIDE[current]

  if (!q.trim()) {
    return {
      answer: `Intreaba-ma despre cont, module, cereri de licenta, orar, mesaje, navigarea prin campus sau viata studenteasca. ${profileLine(context)}`,
      suggestions: defaultSuggestions(context),
    }
  }

  if (q.includes('cont') || q.includes('account') || q.includes('profil') || q.includes('profile')) {
    return {
      answer: context?.role === 'professor'
        ? 'Contul de profesor pastreaza profilul academic, cursurile publicate, orele de consultatii, cererile de licenta, cererile de recuperare si conversatiile cu studentii.'
        : 'Contul de student foloseste emailul institutional, universitatea detectata, facultatea detectata si profilul din onboarding. Pentru demo, codul este 0000. Daca onboarding-ul apare din nou, completeaza-l o data si profilul ramane salvat local.',
      suggestions: ['Cum functioneaza notificarile?', 'Unde sunt mesajele?', 'Cum schimb sectiunea?'],
    }
  }

  if (q.includes('parola') || q.includes('cod') || q.includes('login') || q.includes('logare') || q.includes('sign in')) {
    return {
      answer: 'Pentru demo, autentificarea foloseste un email de tip institutional si codul 0000. Demo-ul de profesor foloseste mihai.ciobanu@academic.tuiasi.ro cu acelasi cod.',
      suggestions: ['Ce poate face un student?', 'Ce poate face un profesor?'],
    }
  }

  if (q.includes('notific')) {
    return {
      answer: 'Notificarile apar pentru decizii ale profesorilor, actualizari la cereri de recuperare, mesaje directe si potriviri de schimburi in orar. Notificarile student-profesor sunt salvate si local, ca demo-ul sa ramana functional fara baza de date.',
      suggestions: ['Deschide mesajele', 'Cum functioneaza cererile de licenta?'],
    }
  }

  if (q.includes('mesaj') || q.includes('message') || q.includes('chat')) {
    return {
      answer: context?.role === 'professor'
        ? 'In portalul profesorului, Mesaje contine conversatiile pornite din cereri de licenta sau recuperari. Selectezi discutia cu studentul si raspunzi direct.'
        : 'Mesajele intre studenti folosesc canale WebSocket si sunt limitate la colegi din aceeasi universitate si facultate. Conversatiile cu profesorii sunt gestionate prin fluxul din portalul profesorului.',
      suggestions: ['Cum functioneaza notificarile?', 'Deschide mesajele'],
    }
  }

  if (q.includes('licenta') || q.includes('thesis') || q.includes('profesor')) {
    return {
      answer: context?.role === 'professor'
        ? 'In portalul profesorului, zona de licenta permite verificarea cererilor primite, citirea ideii si motivatiei studentului, acceptarea sau respingerea cererii, adaugarea unei note optionale si continuarea discutiei in Mesaje.'
        : 'Thesis Finder permite studentilor sa filtreze profesorii dupa domeniu si disponibilitate, sa citeasca cerintele si sa trimita o cerere cu fisier optional. Profesorii pot accepta sau respinge cererea si pot trimite un raspuns.',
      suggestions: context?.role === 'professor'
        ? ['Deschide cererile de licenta', 'Cum functioneaza mesajele?', 'Cum functioneaza notificarile?']
        : ['Deschide Thesis Finder', 'Cum apar notificarile de la profesori?'],
    }
  }

  if (q.includes('orar') || q.includes('schedule') || q.includes('recuper')) {
    return {
      answer: 'Schedule Hub arata cursurile saptamanale, optiunile de recuperare si schimburile de sloturi intre studenti. Cand doua cereri compatibile se potrivesc, aplicatia trimite un eveniment in timp real.',
      suggestions: ['Deschide Schedule Hub', 'Cum functioneaza notificarile?'],
    }
  }

  if (
    q.includes('harta') || q.includes('campus') || q.includes('navig') || q.includes('sala') || q.includes('room') ||
    q.includes('mangeron') || q.includes('corp c') || q.includes('corp a') || q.includes('daia') || q.includes('cti') ||
    q.includes('ac ') || q.includes(' ac') || q === 'ac' ||
    q.includes('automatica') || q.includes('calculatoare') || q.includes('asachi') ||
    q.includes('etti') || q.includes('ieeia') || q.includes('mec ') || q.includes('rectorat') ||
    q.includes('biblioteca') || q.includes('cantina') || q.includes('secretariat') || q.includes('laborator')
  ) {
    const isCampusNav = q.includes('harta') || q.includes('campus') || q.includes('navig') || q.includes('sala') || q.includes('room')
    if (isCampusNav) {
      return {
        answer: 'Campus Navigator include trasee outdoor prin campus, rute indoor intre salile cunoscute, ajutor pe baza de poza si prezentari ghidate cu voce.',
        suggestions: ['Deschide Campus Navigator', 'Cum functioneaza recunoasterea din poza?'],
      }
    }
    return {
      answer: 'Universitatea Tehnica "Gheorghe Asachi" din Iasi are campusul principal pe Bd. Prof. Dimitrie Mangeron. Facultatea de Automatica si Calculatoare include CTI in Corp C si IS/DAIA in Corp A. Harta include si ETTI, IEEIA, MEC, Constructii, Rectoratul, Biblioteca, Cantina si caminele din Tudor.',
      suggestions: ['Deschide Campus Navigator', 'Unde este Corp C?', 'Unde este ETTI?'],
    }
  }

  if (q.includes('camin') || q.includes('transport') || q.includes('reduc') || q.includes('oras') || q.includes('city')) {
    return {
      answer: 'City Adaptation si Student Life acopera cazarea, transportul, reducerile pentru studenti, zonele sigure, ponturile locale, comunitatile, evenimentele si serviciile practice din jurul vietii de student.',
      suggestions: ['Deschide City Adaptation', 'Deschide Student Life'],
    }
  }

  if (q.includes('pagina') || q.includes('unde sunt') || q.includes('current') || q.includes('sectiune')) {
    return {
      answer: currentGuide
        ? `Esti acum in ${context.currentLabel || current}. ${currentGuide}`
        : profileLine(context),
      suggestions: defaultSuggestions(context),
    }
  }

  return {
    answer: `Te pot ajuta cu intrebari despre cont, navigarea prin StudentCompass, explicarea modulelor, cereri de licenta, orar, mesaje si viata studenteasca. ${currentGuide ? `Sectiunea curenta: ${currentGuide}` : profileLine(context)}`,
    suggestions: defaultSuggestions(context),
  }
}

export function defaultSuggestions(context = {}) {
  if (context.role === 'professor') {
    return ['Ce pot gestiona aici?', 'Cum functioneaza cererile de licenta?', 'Cum functioneaza mesajele?']
  }
  return ['Ce pot face aici?', 'Deschide Campus Navigator', 'Cum functioneaza cererile de licenta?']
}

export async function askVirtualAssistant({ message, context, history }) {
  try {
    const response = await fetch(`${API_URL}/support-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, history }),
    })
    if (!response.ok) throw new Error(`Assistant API ${response.status}`)
    const data = await response.json()
    return {
      answer: data.answer || localVirtualAssistantAnswer(message, context).answer,
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : defaultSuggestions(context),
    }
  } catch {
    return localVirtualAssistantAnswer(message, context)
  }
}
