import { Component } from 'react'

/**
 * Catches runtime render errors anywhere in the React tree and shows a recovery
 * screen instead of unmounting to a blank page. The boot-time fallback in
 * main.jsx only covers errors thrown before/at mount; this covers everything
 * that happens afterwards.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surface to the console for debugging; wire to a reporting service later.
    console.error('[ErrorBoundary] Uncaught render error:', error, info)
  }

  handleReload = () => {
    this.setState({ error: null })
    if (typeof window !== 'undefined') window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050810] text-slate-200 p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <h1 className="text-lg font-bold text-white mb-2">Ceva nu a mers bine</h1>
          <p className="text-[13px] text-slate-400 mb-5">
            A apărut o eroare neașteptată. Reîncarcă pagina pentru a continua.
          </p>
          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-colors"
          >
            Reîncarcă aplicația
          </button>
        </div>
      </div>
    )
  }
}
