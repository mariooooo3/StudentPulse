import { createContext, useContext, useState, useCallback, createElement } from 'react'

const Ctx = createContext({ count: 0, report: () => {} })

export function OnlineCountProvider({ children }) {
  const [count, setCount] = useState(0)
  const report = useCallback((n) => setCount(n), [])
  return createElement(Ctx.Provider, { value: { count, report } }, children)
}

export function useOnlineCount() {
  return useContext(Ctx)
}
