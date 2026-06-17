import { useState } from 'react'

function AuthCard({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (isLogin) {
      if (email === 'a@a.pl' && password === 'admin') {
        onLogin()
      } else {
        alert('Nieprawidłowy email lub hasło')
      }
    } else {
      alert('Rejestracja niedostępna – skontaktuj się z administratorem')
    }
  }

  return (
    <div className="relative max-w-sm">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 bg-white rounded-xl shadow-xl shadow-black/15 px-6 py-2 border border-white/50 whitespace-nowrap">
        <h1 className="text-lg md:text-xl font-serif font-bold text-[#5c2a1e] leading-none text-center">
          Ogłoszenia
        </h1>
        <p className="text-[9px] font-light text-[#8c4a3a] tracking-[0.25em] uppercase mt-0.5 text-center">
          Miasteczkowe
        </p>
      </div>
      <div className="bg-[#fdd5c8] rounded-2xl shadow-2xl shadow-black/20 px-6 py-6 pt-10 border border-white/50">
      <h2 className="text-base font-light text-center text-[#8c4a3a] mb-5">
        {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs text-[#8c4a3a] mb-0.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/80 border border-[#e8b4a8] text-sm text-[#5c2a1e] placeholder-[#c98a7a] focus:outline-none focus:ring-2 focus:ring-[#d68a78] transition"
            placeholder="jan@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[#8c4a3a] mb-0.5">Hasło</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/80 border border-[#e8b4a8] text-sm text-[#5c2a1e] placeholder-[#c98a7a] focus:outline-none focus:ring-2 focus:ring-[#d68a78] transition"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-[#d68a78] text-white text-sm font-medium hover:bg-[#c47562] transition"
        >
          {isLogin ? 'Zaloguj' : 'Zarejestruj'}
        </button>
      </form>

      <p className="text-center text-xs text-[#8c4a3a] mt-4">
        {isLogin ? 'Nie masz konta?' : 'Masz już konto?'}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[#5c2a1e] underline hover:no-underline transition"
        >
          {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
        </button>
      </p>
    </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#fef0ea] flex flex-col">
      <nav className="flex items-center px-6 py-3 bg-white/60 backdrop-blur-md border-b border-[#e8b4a8]/30 shadow-sm">
        <div className="flex items-center mr-auto gap-40">
          <div className="bg-white rounded-lg shadow px-3 py-1.5">
            <h1 className="text-sm font-serif font-bold text-[#5c2a1e] leading-none">Ogłoszenia</h1>
            <p className="text-[7px] font-light text-[#8c4a3a] tracking-[0.25em] uppercase">Miasteczkowe</p>
          </div>
          <div className="border-b-2 border-[#c98a7a] pb-1">
            <svg className="w-5 h-5 text-[#8c4a3a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3 mr-40">
          <div className="relative">
            <input
              type="text"
              placeholder="Szukaj..."
              className="w-80 pl-3 pr-9 py-1.5 rounded-full bg-white shadow-md border border-[#e8b4a8] text-sm text-[#5c2a1e] placeholder-[#c98a7a] focus:outline-none focus:ring-2 focus:ring-[#d68a78] transition"
            />
            <svg className="w-4 h-4 text-[#c98a7a] absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#d68a78] to-[#e8856e] text-white text-sm font-medium hover:brightness-110 transition shadow">
            + Dodaj posta
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5c2a1e] font-medium">Janusz</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fdd5c8] to-[#d68a78] flex items-center justify-center text-white text-xs font-medium shadow">
            JD
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex flex-1 gap-6">
        <aside className="w-56 shrink-0">
          <div className="bg-white rounded-2xl shadow-md p-5 sticky top-4">
            <h3 className="text-sm font-bold text-[#5c2a1e] mb-4">Filtry</h3>

            <div className="mb-4">
              <label className="block text-xs text-[#8c4a3a] mb-1.5">Kategoria</label>
              <select className="w-full px-3 py-2 rounded-lg bg-white/80 border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]">
                <option>Wszystkie</option>
                <option>Mieszkalne</option>
                <option>Usługi</option>
                <option>Wydarzenia</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[#8c4a3a] mb-1.5">Status</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm text-[#5c2a1e]">
                  <input type="checkbox" className="rounded border-[#e8b4a8] text-[#d68a78] focus:ring-[#d68a78]" /> Aktywne
                </label>
                <label className="flex items-center gap-2 text-sm text-[#5c2a1e]">
                  <input type="checkbox" className="rounded border-[#e8b4a8] text-[#d68a78] focus:ring-[#d68a78]" /> Rozwiązane
                </label>
              </div>
            </div>

            <button className="w-full py-2 rounded-lg bg-[#d68a78] text-white text-sm font-medium hover:bg-[#c47562] transition">
              Zastosuj
            </button>
          </div>
        </aside>

        <div className="bg-white rounded-2xl shadow-md flex-1 p-6">
          <p className="text-[#c98a7a] text-center text-sm">Brak ogłoszeń</p>
        </div>
      </main>
    </div>
  )
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  function handleLogin() {
    setLoggedIn(true)
  }

  if (loggedIn) return <Dashboard />

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative" style={{ backgroundImage: "url('../public/miasteczko.jpg')" }}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10">
        <AuthCard onLogin={handleLogin} />
      </div>
    </div>
  )
}

export default App
