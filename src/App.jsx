import { useState, useEffect, useCallback } from 'react'
import * as api from './api'

function AuthCard({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        const user = await api.login(email, password)
        onLogin(user)
      } else {
        await api.register(email, password)
        const user = await api.login(email, password)
        onLogin(user)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
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
          disabled={loading}
          className="w-full py-2 rounded-lg bg-[#d68a78] text-white text-sm font-medium hover:bg-[#c47562] transition disabled:opacity-50"
        >
          {loading ? '...' : isLogin ? 'Zaloguj' : 'Zarejestruj'}
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

function AdCard({ ad }) {
  return (
    <div className="border border-[#e8b4a8] rounded-xl p-4 hover:shadow-md transition">
      <div className="flex gap-4">
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-24 h-24 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-[#5c2a1e] truncate">{ad.title}</h3>
            <span className="text-sm font-bold text-[#d68a78] whitespace-nowrap">{ad.price} zł</span>
          </div>
          <p className="text-sm text-[#8c4a3a] mt-1 line-clamp-2">{ad.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-[#c98a7a]">
            <span>{ad.category}</span>
            <span>{ad.location}</span>
            <span>{new Date(ad.createdAt).toLocaleDateString('pl-PL')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ user, onLogout }) {
  const [ads, setAds] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [location] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewAd, setShowNewAd] = useState(false)

  const initials = user.email.charAt(0).toUpperCase() + user.email.charAt(1).toUpperCase()

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getAds({ search, category, location })
      setAds(data)
    } catch {
      setAds([])
    } finally {
      setLoading(false)
    }
  }, [search, category, location])

  useEffect(() => {
    const timer = setTimeout(fetchAds, 300)
    return () => clearTimeout(timer)
  }, [fetchAds])

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80 pl-3 pr-9 py-1.5 rounded-full bg-white shadow-md border border-[#e8b4a8] text-sm text-[#5c2a1e] placeholder-[#c98a7a] focus:outline-none focus:ring-2 focus:ring-[#d68a78] transition"
            />
            <svg className="w-4 h-4 text-[#c98a7a] absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <button
            onClick={() => setShowNewAd(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#d68a78] to-[#e8856e] text-white text-sm font-medium hover:brightness-110 transition shadow"
          >
            + Dodaj posta
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5c2a1e] font-medium">{user.email}</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fdd5c8] to-[#d68a78] flex items-center justify-center text-white text-xs font-medium shadow">
            {initials}
          </div>
          <button onClick={onLogout} className="ml-2 text-xs text-[#c98a7a] hover:text-[#8c4a3a] transition">
            wyjście
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex flex-1 gap-6">
        <aside className="w-56 shrink-0">
          <div className="bg-white rounded-2xl shadow-md p-5 sticky top-4">
            <h3 className="text-sm font-bold text-[#5c2a1e] mb-4">Filtry</h3>

            <div className="mb-4">
              <label className="block text-xs text-[#8c4a3a] mb-1.5">Kategoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/80 border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]">
                <option value="">Wszystkie</option>
                <option value="Nauka">Nauka</option>
                <option value="Meble">Meble</option>
                <option value="Elektronika">Elektronika</option>
                <option value="Usługi">Usługi</option>
              </select>
            </div>

            <button
              onClick={() => { setCategory(''); setSearch('') }}
              className="w-full py-2 rounded-lg bg-[#d68a78] text-white text-sm font-medium hover:bg-[#c47562] transition"
            >
              Wyczyść filtry
            </button>
          </div>
        </aside>

        <div className="bg-white rounded-2xl shadow-md flex-1 p-6 space-y-4">
          {loading ? (
            <p className="text-[#c98a7a] text-center text-sm">Ładowanie...</p>
          ) : ads.length === 0 ? (
            <p className="text-[#c98a7a] text-center text-sm">Brak ogłoszeń</p>
          ) : (
            ads.map((ad) => <AdCard key={ad.id} ad={ad} />)
          )}
        </div>
      </main>

      {showNewAd && <NewAdModal onClose={() => { setShowNewAd(false); fetchAds() }} />}
    </div>
  )
}

function NewAdModal({ onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Nauka')
  const [location, setLocation] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await api.uploadImage(file)
      setImageUrl(result.url)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.createAd({ title, description, price: parseFloat(price), category, location, imageUrl })
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#5c2a1e]">Nowe ogłoszenie</h3>
          <button onClick={onClose} className="text-[#c98a7a] hover:text-[#8c4a3a] text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tytuł" required className="w-full px-3 py-2 rounded-lg border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opis" rows={3} required className="w-full px-3 py-2 rounded-lg border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]" />
          <div className="flex gap-3">
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="Cena (zł)" required className="flex-1 px-3 py-2 rounded-lg border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]">
              <option value="Nauka">Nauka</option>
              <option value="Meble">Meble</option>
              <option value="Elektronika">Elektronika</option>
              <option value="Usługi">Usługi</option>
            </select>
          </div>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lokalizacja (np. DS-2 Babilon)" className="w-full px-3 py-2 rounded-lg border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]" />
          <div>
            <label className="block text-xs text-[#8c4a3a] mb-1">Zdjęcie</label>
            <input type="file" accept="image/*" onChange={handleImage} className="text-sm text-[#5c2a1e]" />
            {uploading && <p className="text-xs text-[#c98a7a] mt-1">Przesyłanie...</p>}
            {imageUrl && <p className="text-xs text-green-600 mt-1">Dodano zdjęcie</p>}
          </div>
          <button type="submit" disabled={saving || uploading} className="w-full py-2 rounded-lg bg-gradient-to-r from-[#d68a78] to-[#e8856e] text-white text-sm font-medium hover:brightness-110 transition disabled:opacity-50">
            {saving ? 'Zapisywanie...' : 'Opublikuj'}
          </button>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          token,
          email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
          role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
          userId: payload['UserId'],
        })
      } catch {
        api.logout()
      }
    }
  }, [])

  function handleLogin(userData) {
    setUser(userData)
  }

  function handleLogout() {
    api.logout()
    setUser(null)
  }

  if (user) return <Dashboard user={user} onLogout={handleLogout} />

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
