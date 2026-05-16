export const studentLifeData = {
  discounts: {
    categories: ['All', 'Restaurant', 'Cinema', 'Transport', 'Gym', 'Cafe', 'Tech', 'Books'],
    offers: [
      { id: 1, brand: "McDonald's", initials: 'MC', color: '#c2410c', category: 'Restaurant', discount: 20, city: 'all', popular: true, verified: true, description: 'Student-card discount on meals at participating restaurants.' },
      { id: 2, brand: 'Cineplex', initials: 'CP', color: '#1e293b', category: 'Cinema', discount: 40, city: 'all', popular: true, verified: true, description: 'Reduced student tickets for standard and 3D screenings.' },
      { id: 3, brand: 'STB Student Pass', initials: 'ST', color: '#2563eb', category: 'Transport', discount: 50, city: 'Bucharest', popular: false, verified: true, description: 'Subsidised monthly public transport pass for students.' },
      { id: 4, brand: 'Carturesti', initials: 'CA', color: '#7c2d12', category: 'Books', discount: 15, city: 'Bucharest', popular: false, verified: true, description: 'Lower pricing for books, notebooks, and academic stationery.' },
      { id: 5, brand: 'World Class', initials: 'WC', color: '#0f172a', category: 'Gym', discount: 30, city: 'Bucharest', popular: true, verified: true, description: 'Student membership with no enrolment fee and reduced monthly cost.' },
      { id: 6, brand: 'Starbucks', initials: 'SB', color: '#047857', category: 'Cafe', discount: 10, city: 'all', popular: false, verified: false, description: 'Discount on drinks when student identification is shown.' },
      { id: 7, brand: 'Spotify Student', initials: 'SP', color: '#16a34a', category: 'Tech', discount: 50, city: 'all', popular: true, verified: true, description: 'Student plan with verification through institutional email.' },
      { id: 8, brand: 'Adobe Creative Cloud', initials: 'AD', color: '#dc2626', category: 'Tech', discount: 60, city: 'all', popular: true, verified: true, description: 'Creative Cloud institutional pricing for eligible students.' },
      { id: 9, brand: 'Humanitas', initials: 'HU', color: '#1d4ed8', category: 'Books', discount: 20, city: 'Bucharest', popular: false, verified: true, description: 'Academic and reference books at student pricing.' },
    ],
  },
  career: {
    CS: [
      { id: 101, company: 'Google', initials: 'G', color: '#2563eb', role: 'Frontend Intern', baseMatch: 93, remote: true, paid: true, tags: ['React', 'TypeScript', 'Web APIs'], type: 'Internship', minYear: 2, cities: ['all'] },
      { id: 102, company: 'Tremend', initials: 'T', color: '#5b21b6', role: 'Backend Intern', baseMatch: 78, remote: true, paid: true, tags: ['Node.js', 'AWS', 'MongoDB'], type: 'Internship', minYear: 1, cities: ['all'] },
      { id: 103, company: 'Startup Weekend', initials: 'SW', color: '#047857', role: 'Tech Volunteer', baseMatch: 60, remote: true, paid: false, tags: ['Agile', 'MVP', 'Product'], type: 'Volunteer', minYear: 1, cities: ['all'] },
      { id: 104, company: 'Microsoft', initials: 'M', color: '#0284c7', role: 'Software Development Intern', baseMatch: 90, remote: false, paid: true, tags: ['C#', 'Azure', '.NET'], type: 'Internship', minYear: 2, cities: ['Bucharest'] },
      { id: 105, company: 'Bitdefender', initials: 'BD', color: '#b91c1c', role: 'Security Research Intern', baseMatch: 81, remote: false, paid: true, tags: ['Python', 'C++', 'Reverse Engineering'], type: 'Internship', minYear: 3, cities: ['Bucharest'] },
      { id: 106, company: 'Endava Cluj', initials: 'EC', color: '#ea580c', role: 'Full Stack Intern', baseMatch: 80, remote: false, paid: true, tags: ['Java', 'React', 'REST'], type: 'Internship', minYear: 1, cities: ['Cluj-Napoca'] },
    ],
    MEDICINE: [
      { id: 201, company: 'UMF Research Institute', initials: 'UR', color: '#7c3aed', role: 'Remote Research Assistant', baseMatch: 70, remote: true, paid: false, tags: ['Research', 'Statistics', 'Publications'], type: 'Research', minYear: 3, cities: ['all'] },
      { id: 202, company: 'Floreasca Hospital', initials: 'FH', color: '#dc2626', role: 'Clinical Assistant - Surgery', baseMatch: 91, remote: false, paid: false, tags: ['Surgery', 'Emergency', 'Patient Care'], type: 'Internship', minYear: 3, cities: ['Bucharest'] },
      { id: 203, company: 'MedLife', initials: 'ML', color: '#16a34a', role: 'Medical Extern', baseMatch: 84, remote: false, paid: true, tags: ['Diagnostics', 'Patient Care'], type: 'Internship', minYear: 2, cities: ['Bucharest'] },
      { id: 204, company: 'Synevo', initials: 'SY', color: '#2563eb', role: 'Lab Technician Intern', baseMatch: 80, remote: false, paid: true, tags: ['Biochemistry', 'Lab', 'LIMS'], type: 'Internship', minYear: 2, cities: ['Bucharest', 'Cluj-Napoca', 'Iasi'] },
    ],
    ECONOMICS: [
      { id: 301, company: 'eMAG', initials: 'EM', color: '#f26522', role: 'Marketing Intern', baseMatch: 79, remote: true, paid: true, tags: ['Digital Marketing', 'SEO', 'Analytics'], type: 'Internship', minYear: 1, cities: ['all'] },
      { id: 302, company: 'Deloitte', initials: 'D', color: '#65a30d', role: 'Audit Intern', baseMatch: 90, remote: false, paid: true, tags: ['Financial Audit', 'Excel', 'IFRS'], type: 'Internship', minYear: 2, cities: ['Bucharest'] },
      { id: 303, company: 'BCR', initials: 'B', color: '#dc2626', role: 'Financial Analyst Intern', baseMatch: 84, remote: false, paid: true, tags: ['Banking', 'Financial Modelling'], type: 'Internship', minYear: 1, cities: ['Bucharest', 'Cluj-Napoca'] },
    ],
    LAW: [
      { id: 401, company: 'RTPR', initials: 'RT', color: '#1e3a8a', role: 'Corporate Legal Intern', baseMatch: 92, remote: false, paid: true, tags: ['Corporate Law', 'M&A', 'Contracts'], type: 'Internship', minYear: 3, cities: ['Bucharest'] },
      { id: 402, company: 'Musat & Asociatii', initials: 'MA', color: '#374151', role: 'Litigation Intern', baseMatch: 88, remote: false, paid: false, tags: ['Litigation', 'Civil', 'Courts'], type: 'Internship', minYear: 2, cities: ['Bucharest'] },
      { id: 403, company: 'Baroul Iasi', initials: 'BI', color: '#7c3aed', role: 'Junior Legal Assistant', baseMatch: 84, remote: false, paid: false, tags: ['Civil', 'Criminal', 'Bar'], type: 'Internship', minYear: 3, cities: ['Iasi'] },
    ],
    ARCHITECTURE: [
      { id: 501, company: 'Zaha Hadid Architects', initials: 'ZH', color: '#0f172a', role: 'Architecture Intern', baseMatch: 88, remote: false, paid: true, tags: ['Revit', 'BIM', 'Parametric'], type: 'Internship', minYear: 3, cities: ['all'] },
      { id: 502, company: 'Biro Arhitectura', initials: 'BA', color: '#7c3aed', role: 'Design Assistant', baseMatch: 86, remote: false, paid: true, tags: ['AutoCAD', '3ds Max'], type: 'Internship', minYear: 2, cities: ['Bucharest'] },
      { id: 503, company: 'Planwerk Cluj', initials: 'PW', color: '#0f766e', role: 'Urban Design Intern', baseMatch: 84, remote: false, paid: true, tags: ['Revit', 'Urban Planning', 'BIM'], type: 'Internship', minYear: 2, cities: ['Cluj-Napoca'] },
    ],
  },
  community: {
    activities: ['Football', 'Basketball', 'Running', 'Gaming', 'Study group', 'Coffee meetup', 'Hiking', 'Cinema', 'Startup circle', 'Language exchange'],
    groups: [
      { id: 1, name: 'Saturday Football', type: 'Sport', description: 'Relaxed 5-a-side every Saturday morning. All skill levels.', members: 14, interests: ['football', 'sport'], open: true },
      { id: 2, name: 'Gaming Night - CS2', type: 'Gaming', description: 'Ranked sessions every Friday evening with students from several faculties.', members: 8, interests: ['gaming'], open: true },
      { id: 3, name: 'Algorithms & DS Prep', type: 'Study', description: 'Structured exam prep for data structures, OOP, and algorithms.', members: 6, interests: ['coding', 'study'], open: true },
      { id: 4, name: 'Morning Coffee Group', type: 'Social', description: 'Early coffee before lectures, with rotating campus cafes.', members: 9, interests: ['coffee', 'social'], open: true },
      { id: 5, name: 'Tech Talks Bucharest', type: 'Tech', description: 'Weekly engineering and startup discussions. Open talks, limited seats.', members: 22, interests: ['coding', 'tech', 'startup'], open: false },
      { id: 6, name: 'Bucegi Hike - 24 May', type: 'Outdoor', description: 'Day trip to Bucegi Mountains with shared transport planning.', members: 11, interests: ['hiking', 'outdoor'], open: true },
      { id: 7, name: 'Friday Cinema Club', type: 'Social', description: 'New film every Friday. Group discount applies when enough students join.', members: 7, interests: ['movies', 'social'], open: true },
      { id: 8, name: 'Startup Builders', type: 'Tech', description: 'Build MVPs, validate ideas, and meet potential co-founders.', members: 15, interests: ['coding', 'startup'], open: true },
    ],
  },
}

export const facultyCareerKeys = {
  CS: 'CS',
  IT: 'CS',
  INFO: 'CS',
  MED: 'MEDICINE',
  MEDICINE: 'MEDICINE',
  ECONOMICS: 'ECONOMICS',
  ECON: 'ECONOMICS',
  LAW: 'LAW',
  ARCHITECTURE: 'ARCHITECTURE',
  ARCH: 'ARCHITECTURE',
}
