import { useState, useEffect, useCallback, useRef } from 'react'
import * as api from './api'

function AuthCard({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        const user = await api.login(email, password)
        onLogin(user)
      } else {
        await api.register(email, password, nickname)
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
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 bg-white rounded-xl shadow-xl shadow-black/15 px-4 sm:px-6 py-2 border border-white/50 whitespace-nowrap">
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

        {!isLogin && (
          <div>
            <label className="block text-xs text-[#8c4a3a] mb-0.5">Nick</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/80 border border-[#e8b4a8] text-sm text-[#5c2a1e] placeholder-[#c98a7a] focus:outline-none focus:ring-2 focus:ring-[#d68a78] transition"
              placeholder="Twój nick"
            />
          </div>
        )}

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

const REACTIONS = [
  { emoji: '👍', label: 'Lubię to' },
  { emoji: '❤️', label: 'Kocham' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Smutne' },
]

function AdCard({ ad, onFavoriteToggle, isFavorited, onContact, onDelete }) {
  const [reactions, setReactions] = useState({})
  const [myReaction, setMyReaction] = useState(null)
  const displayName = ad.user?.nickname || (ad.user?.email ? ad.user.email.split('@')[0] : 'Nieznany')
  const initials = displayName.charAt(0).toUpperCase() + (displayName.charAt(1) || displayName.charAt(0)).toUpperCase()

  useEffect(() => {
    api.getReactions(ad.id).then((data) => {
      const map = {}
      data.reactions.forEach((r) => { map[r.emoji] = r.count })
      setReactions(map)
      setMyReaction(data.userReaction)
    }).catch(() => {})
  }, [ad.id])

  async function handleReaction(emoji) {
    if (!localStorage.getItem('token')) return
    try {
      await api.toggleReaction(ad.id, emoji)
      const data = await api.getReactions(ad.id)
      const map = {}
      data.reactions.forEach((r) => { map[r.emoji] = r.count })
      setReactions(map)
      setMyReaction(data.userReaction)
    } catch {}
  }

  return (
    <div className="border border-gray-300/50 rounded-[2.5rem] p-4 hover:shadow-md transition shadow-sm bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#fdd5c8] to-[#d68a78] flex items-center justify-center text-white text-[10px] font-medium shadow">
            {initials}
          </div>
          <span className="text-xs font-medium text-[#5c2a1e]">{displayName}</span>
          {ad.userId && Number(ad.userId) === Number(api.getUserId()) ? (
            <button onClick={onDelete} className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-400 text-white hover:bg-red-500 transition">
              Usuń
            </button>
          ) : ad.userId ? (
            <button onClick={onContact} className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#d68a78] text-white hover:bg-[#c47562] transition">
              Kontakt
            </button>
          ) : null}
        </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full sm:w-24 h-40 sm:h-24 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-[#5c2a1e] truncate">{ad.title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-[#d68a78] whitespace-nowrap">{ad.price} zł</span>
              <button onClick={() => onFavoriteToggle?.(ad.id)} className="p-1 hover:scale-110 transition">
                <svg className="w-5 h-5" fill={isFavorited ? '#fbbf24' : 'none'} stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-sm text-[#8c4a3a] mt-1 line-clamp-2">{ad.description}</p>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-3">
            <span className="px-3 py-0.5 rounded-full bg-[#f0abfc] text-[10px] font-semibold text-[#6b21a8]">{ad.category}</span>
            <span className="px-3 py-0.5 rounded-full bg-[#a7f3d0] text-[10px] font-semibold text-[#065f46]">{ad.location}</span>
            <span className="px-3 py-0.5 rounded-full bg-[#bfdbfe] text-[10px] font-semibold text-[#1e40af]">{new Date(ad.createdAt).toLocaleDateString('pl-PL')}</span>
            <span className="w-px h-4 bg-gray-300" />
            {REACTIONS.map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReaction(r.emoji)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full hover:bg-gray-100 transition text-xs"
                title={r.label}
              >
                <span className="text-sm">{r.emoji}</span>
                {reactions[r.emoji] > 0 && <span className="text-[10px] text-gray-500 font-medium">{reactions[r.emoji]}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      <CommentSection adId={ad.id} />
    </div>
  )
}

function CommentSection({ adId }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState(null)

  useEffect(() => {
    api.getComments(adId).then(setComments).catch(() => {})
  }, [adId])

  async function handleAddComment() {
    if (!text.trim() || !localStorage.getItem('token')) return
    try {
      const newComment = await api.addComment({
        content: text,
        advertisementId: adId,
        parentCommentId: replyTo?.id ?? null,
      })
      setComments((prev) => [...prev, newComment])
      setText('')
      setReplyTo(null)
    } catch {}
  }

  const topComments = comments.filter((c) => !c.parentCommentId)
  const replies = (parentId) => comments.filter((c) => c.parentCommentId === parentId)

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex gap-2 mb-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          placeholder={replyTo ? `Odpowiedz ${replyTo.userNickname || replyTo.userEmail.split('@')[0]}...` : 'Napisz komentarz...'}
          className="flex-1 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-sm text-[#5c2a1e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d68a78]"
        />
        {replyTo && (
          <button onClick={() => { setReplyTo(null); setText('') }} className="px-2 py-1 rounded-full bg-gray-200 text-xs text-gray-500 hover:bg-gray-300 transition">
            Anuluj
          </button>
        )}
        <button onClick={handleAddComment} className="px-3 py-1.5 rounded-full bg-[#d68a78] text-white text-xs font-medium hover:bg-[#c47562] transition">
          Wyślij
        </button>
      </div>
      {topComments.length > 0 && (
        <div className="space-y-2">
          {topComments.map((c) => (
            <div key={c.id}>
              <div className="flex items-start gap-1.5">
                <span className="text-xs font-medium text-[#5c2a1e] shrink-0">{c.userNickname || c.userEmail.split('@')[0]}</span>
                <span className="text-xs text-gray-600">{c.content}</span>
                <button onClick={() => setReplyTo(c)} className="ml-auto text-[9px] text-[#c98a7a] hover:text-[#8c4a3a] shrink-0">odpowiedz</button>
              </div>
              {replies(c.id).map((r) => (
                <div key={r.id} className="ml-5 mt-1 flex items-start gap-1.5">
                  <span className="text-xs font-medium text-[#8c4a3a] shrink-0">{r.userNickname || r.userEmail.split('@')[0]}</span>
                  <span className="text-xs text-gray-600">{r.content}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChatPanel({ user, chat, chatOpen, showChatPanel, onClose, onSelectChat }) {
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingImage, setSendingImage] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.getMessages().then(setConversations).catch(() => {})
  }, [])

  useEffect(() => {
    if (chat) {
      setLoading(true)
      api.getMessages().then((msgs) => {
        setConversations(msgs)
        const filtered = msgs.filter((m) =>
          (m.senderId === Number(chat.userId) || m.receiverId === Number(chat.userId)) &&
          m.advertisementId === chat.adId
        )
        setMessages(filtered)
      }).catch(() => {}).finally(() => setLoading(false))
    }
  }, [chat])

  function otherName(msg) {
    const isMine = msg.senderId === Number(api.getUserId())
    const nick = isMine ? msg.receiverNickname : msg.senderNickname
    const email = isMine ? msg.receiverEmail : msg.senderEmail
    return nick || email.split('@')[0]
  }

  function otherId(msg) {
    return msg.senderId === Number(api.getUserId()) ? msg.receiverId : msg.senderId
  }

  const convList = Object.values(
    conversations.reduce((acc, m) => {
      const key = `${Math.min(m.senderId, m.receiverId)}-${Math.max(m.senderId, m.receiverId)}-${m.advertisementId}`
      if (!acc[key] || new Date(m.sentAt) > new Date(acc[key].sentAt)) acc[key] = m
      return acc
    }, {})
  )

  async function handleSend() {
    if (!text.trim()) return
    try {
      const msg = await api.sendMessage({
        receiverId: chat.userId,
        advertisementId: chat.adId,
        content: text,
      })
      setMessages((prev) => [...prev, msg])
      setConversations((prev) => [...prev, msg])
      setText('')
    } catch {}
  }

  async function handleSendImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setSendingImage(true)
    try {
      const { url } = await api.uploadImage(file)
      const msg = await api.sendMessage({
        receiverId: chat.userId,
        advertisementId: chat.adId,
        content: '',
        imageUrl: url,
      })
      setMessages((prev) => [...prev, msg])
      setConversations((prev) => [...prev, msg])
    } catch (err) {
      alert(err.message)
    } finally {
      setSendingImage(false)
    }
  }

  const panelVisible = showChatPanel || chatOpen

  return (
    <>
    {panelVisible && <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={onClose} />}
    <aside className={`${panelVisible ? 'fixed inset-0 z-50' : 'hidden lg:block'} lg:w-72 lg:shrink-0`}>
      <div className="bg-white lg:rounded-2xl shadow-md lg:sticky lg:top-4 overflow-hidden flex flex-col" style={{ height: panelVisible ? '100vh' : 'calc(100vh - 8rem)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-bold text-[#5c2a1e]">Czaty</h3>
          <button onClick={onClose} className="text-[#c98a7a] hover:text-[#8c4a3a] text-lg leading-none">&times;</button>
        </div>

        {!chatOpen ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {convList.length === 0 && <p className="text-xs text-gray-400 text-center pt-4">Brak rozmów</p>}
            {convList.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectChat({ otherId: otherId(m), otherEmail: m.senderId === Number(api.getUserId()) ? m.receiverEmail : m.senderEmail, otherNickname: m.senderId === Number(api.getUserId()) ? m.receiverNickname : m.senderNickname, advertisementId: m.advertisementId,                 adTitle: m.advertisementTitle || 'Brak tytułu' })}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#fef0ea] transition text-xs"
              >
                <span className="font-medium text-[#5c2a1e]">{otherName(m)}</span>
                <p className="text-[10px] text-[#c98a7a] truncate">{m.advertisementTitle || 'Brak tytułu'}</p>
                <p className="text-gray-500 truncate">{m.content || (m.imageUrl ? '📷 Zdjęcie' : '')}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
              <button onClick={onClose} className="text-[#c98a7a] hover:text-[#8c4a3a] text-sm">&larr;</button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#5c2a1e] truncate">{chat.nickname || chat.email}</p>
                <p className="text-[10px] text-gray-400 truncate">{chat.adTitle}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading && <p className="text-xs text-gray-400 text-center">Ładowanie...</p>}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderId === Number(api.getUserId()) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-xs space-y-1 ${
                    m.senderId === Number(api.getUserId()) ? 'bg-[#d68a78] text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {m.content && <p>{m.content}</p>}
                    {m.imageUrl && (
                      <img src={m.imageUrl} alt="" className="max-w-full rounded-lg" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1 sm:gap-2 p-2 sm:p-3 border-t border-gray-200 items-center">
              <input
                type="file"
                accept="image/*,.webp,.avif"
                ref={fileInputRef}
                onChange={handleSendImage}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={sendingImage}
                className="shrink-0 p-1.5 sm:p-2 rounded-full text-[#c98a7a] hover:text-[#d68a78] hover:bg-gray-100 transition disabled:opacity-50"
                title="Wyślij zdjęcie"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Napisz wiadomość..."
                className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs text-[#5c2a1e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d68a78]"
              />
              <button onClick={handleSend} className="shrink-0 px-2 sm:px-3 py-1.5 rounded-full bg-[#d68a78] text-white text-xs font-medium hover:bg-[#c47562] transition whitespace-nowrap">
                <span className="sm:hidden">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                  </svg>
                </span>
                <span className="hidden sm:inline">Wyślij</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  )
}

function Dashboard({ user, onLogout, onUpdateUser }) {
  const [ads, setAds] = useState([])
  const [favorites, setFavorites] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [myOnly, setMyOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chat, setChat] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [showChatPanel, setShowChatPanel] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)

  function handleSelectChat(conv) {
    setChat({ userId: conv.otherId, email: conv.otherEmail, nickname: conv.otherNickname, adId: conv.advertisementId, adTitle: conv.adTitle })
    setChatOpen(true)
    setShowChatPanel(true)
  }

  function handleBack() {
    if (chatOpen) {
      setChatOpen(false)
      setChat(null)
    } else {
      setShowChatPanel(false)
    }
  }

  function handleChatBack() {
    setChatOpen(false)
    setChat(null)
  }

  const [showNewAd, setShowNewAd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const displayName = user.nickname || user.email
  const initials = (displayName.charAt(0) + (displayName.charAt(1) || '')).toUpperCase()

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getAds({ search, category, location, myOnly })
      setAds(data)
    } catch {
      setAds([])
    } finally {
      setLoading(false)
    }
  }, [search, category, location, myOnly])

  useEffect(() => {
    const timer = setTimeout(fetchAds, 300)
    return () => clearTimeout(timer)
  }, [fetchAds])

  useEffect(() => {
    api.getFavorites().then(setFavorites).catch(() => {})
  }, [])

  async function handleDelete(adId) {
    if (!confirm('Na pewno usunąć to ogłoszenie?')) return
    try {
      await api.deleteAd(adId)
      fetchAds()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleFavoriteToggle(adId) {
    const isFav = favorites.some((f) => f.id === adId)
    try {
      if (isFav) {
        await api.removeFavorite(adId)
        setFavorites((prev) => prev.filter((f) => f.id !== adId))
      } else {
        await api.addFavorite(adId)
        setFavorites((prev) => [...prev, { id: adId }])
      }
    } catch {}
  }

  function isFavorited(adId) {
    return favorites.some((f) => f.id === adId)
  }

  return (
    <div className="min-h-screen bg-[#fef0ea] flex flex-col">
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 sm:px-6 py-3 bg-white/60 backdrop-blur-md border-b border-[#e8b4a8]/30 shadow-sm relative z-20">
        <div className="flex items-center gap-2 sm:gap-10 lg:gap-40 mr-auto">
          <div className="bg-white rounded-lg shadow px-2 sm:px-3 py-1.5">
            <h1 className="text-xs sm:text-sm font-serif font-bold text-[#5c2a1e] leading-none">Ogłoszenia</h1>
            <p className="text-[6px] sm:text-[7px] font-light text-[#8c4a3a] tracking-[0.25em] uppercase">Miasteczkowe</p>
          </div>
          <div className="border-b-2 border-[#c98a7a] pb-1 hidden sm:block">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#8c4a3a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto order-last sm:order-none mt-1 sm:mt-0">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Szukaj..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 lg:w-80 pl-3 pr-9 py-1.5 rounded-full bg-white shadow-md border border-[#e8b4a8] text-sm text-[#5c2a1e] placeholder-[#c98a7a] focus:outline-none focus:ring-2 focus:ring-[#d68a78] transition"
            />
            <svg className="w-4 h-4 text-[#c98a7a] absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <button
            onClick={() => setShowNewAd(true)}
            className="whitespace-nowrap shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#d68a78] to-[#e8856e] text-xs sm:text-sm font-medium hover:brightness-110 transition shadow"
          >
            + Dodaj
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <button onClick={() => setShowChatPanel(true)} className="lg:hidden p-1.5 text-[#d68a78] hover:text-[#c47562]" title="Czaty">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <span className="hidden sm:inline text-sm text-[#5c2a1e] font-medium">{displayName}</span>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-[#d68a78] shadow" />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#fdd5c8] to-[#d68a78] flex items-center justify-center text-white text-[10px] sm:text-xs font-medium shadow">
                  {initials}
                </div>
              )}
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full mt-2 z-[70] w-48 bg-white rounded-xl shadow-xl border border-[#e8b4a8]/30 py-1.5">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-[#5c2a1e] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#c98a7a] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowEditProfile(true); setShowProfileMenu(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-[#5c2a1e] hover:bg-[#fef0ea] transition"
                  >
                    Edytuj profil
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); onLogout() }}
                    className="w-full text-left px-4 py-2 text-sm text-[#c47562] hover:bg-[#fef0ea] transition"
                  >
                    Wyloguj
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 w-full flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6">
        {/* Filter sidebar - desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
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

            <div className="mb-4">
              <label className="block text-xs text-[#8c4a3a] mb-1.5">Lokalizacja</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/80 border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]">
                <option value="">Wszystkie</option>
                <option value="Ds Akropol">Ds Akropol</option>
                <option value="Ds Alfa">Ds Alfa</option>
                <option value="Ds Babilon">Ds Babilon</option>
                <option value="Ds Olimp">Ds Olimp</option>
                <option value="Ds Itaka">Ds Itaka</option>
                <option value="Ds Arkadia">Ds Arkadia</option>
                <option value="Ds Maraton">Ds Maraton</option>
                <option value="Ds Odyseja">Ds Odyseja</option>
                <option value="Ds Straszny Dwór">Ds Straszny Dwór</option>
                <option value="Ds Stokrotka">Ds Stokrotka</option>
                <option value="Ds Zaścianek">Ds Zaścianek</option>
                <option value="Ds Hajduczek">Ds Hajduczek</option>
                <option value="Ds Bonus">Ds Bonus</option>
                <option value="Ds Promyk">Ds Promyk</option>
                <option value="Ds Kapitol">Ds Kapitol</option>
                <option value="Ds Filutek">Ds Filutek</option>
                <option value="Ds Strumyk">Ds Strumyk</option>
                <option value="Ds Bratek">Ds Bratek</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} className="w-4 h-4 rounded accent-[#d68a78]" />
                <span className="text-xs text-[#5c2a1e] font-medium">Tylko ulubione</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={myOnly} onChange={(e) => setMyOnly(e.target.checked)} className="w-4 h-4 rounded accent-[#d68a78]" />
                <span className="text-xs text-[#5c2a1e] font-medium">Moje ogłoszenia</span>
              </label>
            </div>

            <button
              onClick={() => { setCategory(''); setLocation(''); setSearch(''); setFavoritesOnly(false); setMyOnly(false) }}
              className="w-full py-2 rounded-lg bg-[#d68a78] text-white text-sm font-medium hover:bg-[#c47562] transition"
            >
              Wyczyść filtry
            </button>
          </div>
        </aside>

        {/* Mobile filter toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full mb-3 px-4 py-2 rounded-lg bg-white shadow-md border border-[#e8b4a8] text-sm text-[#5c2a1e] flex items-center justify-between transition"
          >
            <span className="font-medium">Filtry</span>
            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showFilters && (
            <div className="mb-4 bg-white rounded-2xl shadow-md p-5 space-y-4">
              <div>
                <label className="block text-xs text-[#8c4a3a] mb-1.5">Kategoria</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/80 border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]">
                  <option value="">Wszystkie</option>
                  <option value="Nauka">Nauka</option>
                  <option value="Meble">Meble</option>
                  <option value="Elektronika">Elektronika</option>
                  <option value="Usługi">Usługi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#8c4a3a] mb-1.5">Lokalizacja</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/80 border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]">
                  <option value="">Wszystkie</option>
                  <option value="Ds Akropol">Ds Akropol</option>
                  <option value="Ds Alfa">Ds Alfa</option>
                  <option value="Ds Babilon">Ds Babilon</option>
                  <option value="Ds Olimp">Ds Olimp</option>
                  <option value="Ds Itaka">Ds Itaka</option>
                  <option value="Ds Arkadia">Ds Arkadia</option>
                  <option value="Ds Maraton">Ds Maraton</option>
                  <option value="Ds Odyseja">Ds Odyseja</option>
                  <option value="Ds Straszny Dwór">Ds Straszny Dwór</option>
                  <option value="Ds Stokrotka">Ds Stokrotka</option>
                  <option value="Ds Zaścianek">Ds Zaścianek</option>
                  <option value="Ds Hajduczek">Ds Hajduczek</option>
                  <option value="Ds Bonus">Ds Bonus</option>
                  <option value="Ds Promyk">Ds Promyk</option>
                  <option value="Ds Kapitol">Ds Kapitol</option>
                  <option value="Ds Filutek">Ds Filutek</option>
                  <option value="Ds Strumyk">Ds Strumyk</option>
                  <option value="Ds Bratek">Ds Bratek</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} className="w-4 h-4 rounded accent-[#d68a78]" />
                  <span className="text-xs text-[#5c2a1e] font-medium">Tylko ulubione</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={myOnly} onChange={(e) => setMyOnly(e.target.checked)} className="w-4 h-4 rounded accent-[#d68a78]" />
                  <span className="text-xs text-[#5c2a1e] font-medium">Moje ogłoszenia</span>
                </label>
              </div>
              <button
                onClick={() => { setCategory(''); setLocation(''); setSearch(''); setFavoritesOnly(false); setMyOnly(false) }}
                className="w-full py-2 rounded-lg bg-[#d68a78] text-white text-sm font-medium hover:bg-[#c47562] transition"
              >
                Wyczyść filtry
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md flex-1 p-4 sm:p-6 space-y-4">
          {loading ? (
            <p className="text-[#c98a7a] text-center text-sm">Ładowanie...</p>
          ) : ads.length === 0 ? (
            <p className="text-[#c98a7a] text-center text-sm">Brak ogłoszeń</p>
          ) : (
            ads.filter((ad) => !favoritesOnly || isFavorited(ad.id)).map((ad) => <AdCard key={ad.id} ad={ad} isFavorited={isFavorited(ad.id)} onFavoriteToggle={handleFavoriteToggle} onDelete={() => handleDelete(ad.id)} onContact={() => { setChat({ userId: ad.userId, email: ad.user?.email, adId: ad.id, adTitle: ad.title }); setChatOpen(true); setShowChatPanel(true) }} />)
          )}
        </div>
        <ChatPanel user={user} chat={chat} chatOpen={chatOpen} showChatPanel={showChatPanel} onClose={handleBack} onSelectChat={handleSelectChat} />
      </main>

      {showNewAd && <NewAdModal onClose={() => { setShowNewAd(false); fetchAds() }} />}
      {showEditProfile && <EditProfileModal user={user} onClose={(updatedUser) => { setShowEditProfile(false); if (updatedUser) onUpdateUser(updatedUser) }} />}
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
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]">
            <option value="">Wybierz akademik</option>
            <option value="Ds Akropol">Ds Akropol</option>
            <option value="Ds Alfa">Ds Alfa</option>
            <option value="Ds Babilon">Ds Babilon</option>
            <option value="Ds Olimp">Ds Olimp</option>
            <option value="Ds Itaka">Ds Itaka</option>
            <option value="Ds Arkadia">Ds Arkadia</option>
            <option value="Ds Maraton">Ds Maraton</option>
            <option value="Ds Odyseja">Ds Odyseja</option>
            <option value="Ds Straszny Dwór">Ds Straszny Dwór</option>
            <option value="Ds Stokrotka">Ds Stokrotka</option>
            <option value="Ds Zaścianek">Ds Zaścianek</option>
            <option value="Ds Hajduczek">Ds Hajduczek</option>
            <option value="Ds Bonus">Ds Bonus</option>
            <option value="Ds Promyk">Ds Promyk</option>
            <option value="Ds Kapitol">Ds Kapitol</option>
            <option value="Ds Filutek">Ds Filutek</option>
            <option value="Ds Strumyk">Ds Strumyk</option>
            <option value="Ds Bratek">Ds Bratek</option>
          </select>
          <div>
            <label className="block text-xs text-[#8c4a3a] mb-1">Zdjęcie</label>
            <input type="file" accept="image/*,.webp,.avif" onChange={handleImage} className="text-sm text-[#5c2a1e]" />
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

function EditProfileModal({ user, onClose }) {
  const [nickname, setNickname] = useState(user.nickname || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await api.uploadImage(file)
      setAvatarUrl(result.url)
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
      const token = await api.updateProfile({ nickname, avatarUrl })
      const payload = JSON.parse(atob(token.split('.')[1]))
      onClose({
        token,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        userId: payload['UserId'],
        nickname: payload['Nickname'],
        avatarUrl: payload['AvatarUrl'] || null,
      })
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#5c2a1e]">Edytuj profil</h3>
          <button onClick={() => onClose(null)} className="text-[#c98a7a] hover:text-[#8c4a3a] text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#8c4a3a] mb-1">Nick</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Twój nick"
              className="w-full px-3 py-2 rounded-lg border border-[#e8b4a8] text-sm text-[#5c2a1e] focus:outline-none focus:ring-2 focus:ring-[#d68a78]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8c4a3a] mb-1">Zdjęcie profilowe</label>
            {avatarUrl && (
              <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-[#d68a78]" />
            )}
            <input type="file" accept="image/*,.webp,.avif" onChange={handleImage} className="text-sm text-[#5c2a1e]" />
            {uploading && <p className="text-xs text-[#c98a7a] mt-1">Przesyłanie...</p>}
          </div>
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-[#d68a78] to-[#e8856e] text-white text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
          >
            {saving ? 'Zapisywanie...' : 'Zapisz'}
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
          nickname: payload['Nickname'],
          avatarUrl: payload['AvatarUrl'] || null,
        })
      } catch {
        api.logout()
      }
    }
  }, [])

  function handleLogin(userData) {
    setUser(userData)
  }

  function handleUpdateUser(updatedUser) {
    setUser(updatedUser)
  }

  function handleLogout() {
    api.logout()
    setUser(null)
  }

  if (user) return <Dashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />

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
