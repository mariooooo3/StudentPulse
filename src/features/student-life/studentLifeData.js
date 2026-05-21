export * from './studentLifeData.datasets.js'

export function getScopedDiscountOffers(lifeProfile, studentLifeData) {
  const city = String(lifeProfile?.city || '').toLowerCase()
  const universityId = String(lifeProfile?.universityId || '').toLowerCase()
  return (studentLifeData?.discounts?.offers || []).filter((offer) => {
    const offerCity = String(offer.city || 'all').toLowerCase()
    const cityOk = offerCity === 'all' || offerCity === city
    const uaicOnly = /uaic/i.test(offer.brand) || /uaic/i.test(offer.description || '')
    const tuiasiOnly = /tuiasi/i.test(offer.brand) || /tuiasi/i.test(offer.description || '') || /campus\.tuiasi/i.test(offer.url || '')
    if (uaicOnly && universityId !== 'uaic') return false
    if (tuiasiOnly && universityId !== 'tuiasi') return false
    return cityOk
  })
}

export function getScopedCommunityGroups(lifeProfile, studentLifeData) {
  const universityId = String(lifeProfile?.universityId || '').toLowerCase()
  return (studentLifeData?.community?.groups || []).filter((group) => {
    const uni = String(group.university || 'all').toLowerCase()
    return uni === 'all' || uni === universityId
  })
}

export function getScopedEvents(lifeProfile, eventsData) {
  const universityId = String(lifeProfile?.universityId || '').toLowerCase()
  return (eventsData || []).filter((event) => {
    const uni = String(event.university || 'all').toLowerCase()
    return uni === 'all' || uni === universityId
  })
}

export function getScopedToolsData(lifeProfile, { booksData, carpoolData, roommateData }) {
  const facultyCode = String(lifeProfile?.facultyCode || '').toLowerCase()
  const city = String(lifeProfile?.city || '').toLowerCase()
  const books = (booksData || []).filter((book) => !book.faculty || String(book.faculty).toLowerCase() === facultyCode)
  const rides = (carpoolData || []).filter((ride) => {
    const from = String(ride.from || '').toLowerCase()
    const to = String(ride.to || '').toLowerCase()
    return !city || from.includes(city) || to.includes(city)
  })
  const roommates = (roommateData || []).filter((item) => !item.faculty || String(item.faculty).toLowerCase() === facultyCode)
  return { books, rides, roommates }
}
