import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'sc_view_state'

function parseUrlState(defaultViewByMode) {
  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')
  const academic = params.get('academic')
  const life = params.get('life')
  if (!mode && !academic && !life) return null

  const platformMode = mode === 'life' ? 'life' : 'academic'
  return {
    platformMode,
    currentViewByMode: {
      academic: academic || defaultViewByMode.academic,
      life: life || defaultViewByMode.life,
    },
  }
}

function loadStoredState(defaultViewByMode) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      platformMode: parsed?.platformMode === 'life' ? 'life' : 'academic',
      currentViewByMode: {
        academic: parsed?.currentViewByMode?.academic || defaultViewByMode.academic,
        life: parsed?.currentViewByMode?.life || defaultViewByMode.life,
      },
    }
  } catch {
    return null
  }
}

function toUrl(mode, views) {
  const params = new URLSearchParams()
  params.set('mode', mode)
  params.set('academic', views.academic)
  params.set('life', views.life)
  return `${window.location.pathname}?${params.toString()}`
}

function persist(mode, views) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ platformMode: mode, currentViewByMode: views }))
  } catch {}
}

export function useAppNavigation(defaultViewByMode) {
  const initial = useMemo(
    () => parseUrlState(defaultViewByMode) || loadStoredState(defaultViewByMode) || {
      platformMode: 'academic',
      currentViewByMode: defaultViewByMode,
    },
    [defaultViewByMode],
  )

  const [platformMode, setPlatformMode] = useState(initial.platformMode)
  const [currentViewByMode, setCurrentViewByMode] = useState(initial.currentViewByMode)

  useEffect(() => {
    const url = toUrl(initial.platformMode, initial.currentViewByMode)
    window.history.replaceState(
      { platformMode: initial.platformMode, currentViewByMode: initial.currentViewByMode },
      '',
      url,
    )
    persist(initial.platformMode, initial.currentViewByMode)
  }, [initial])

  useEffect(() => {
    const onPopState = (event) => {
      const state = event.state
      if (!state || !state.currentViewByMode) return
      const mode = state.platformMode === 'life' ? 'life' : 'academic'
      const views = {
        academic: state.currentViewByMode.academic || defaultViewByMode.academic,
        life: state.currentViewByMode.life || defaultViewByMode.life,
      }
      setPlatformMode(mode)
      setCurrentViewByMode(views)
      persist(mode, views)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [defaultViewByMode])

  const pushHistory = useCallback((mode, views, method = 'pushState') => {
    const url = toUrl(mode, views)
    window.history[method]({ platformMode: mode, currentViewByMode: views }, '', url)
    persist(mode, views)
  }, [])

  const navigate = useCallback((view, mode) => {
    const targetMode = mode || platformMode
    setCurrentViewByMode((prev) => {
      const next = { ...prev, [targetMode]: view }
      pushHistory(targetMode, next, 'pushState')
      return next
    })
    if (targetMode !== platformMode) setPlatformMode(targetMode)
  }, [platformMode, pushHistory])

  const changeMode = useCallback((mode) => {
    setCurrentViewByMode((prev) => {
      const next = { ...prev, [mode]: prev[mode] || defaultViewByMode[mode] }
      pushHistory(mode, next, 'pushState')
      return next
    })
    setPlatformMode(mode)
  }, [defaultViewByMode, pushHistory])

  return { platformMode, currentViewByMode, navigate, changeMode }
}
