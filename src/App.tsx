import { useState, useEffect, useRef, useCallback } from 'react'
import MusicPlayer from './components/MusicPlayer'
const API_URL = "https://api.mindsette.ia.br/api/mind"
const TELEGRAM_URL = "https://t.me/MindSette_bot"
const INSTAGRAM_URL = "https://instagram.com/mindsette.ai"

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    type P = { x: number; y: number; v: number; c: string; col: string; a: number }
    const parts: P[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: 0.15 + Math.random() * 0.5,
      c: Math.random() > 0.5 ? '1' : '0',
      col: Math.random() > 0.16 ? '138,180,248' : '255,122,0',
      a: 0.04 + Math.random() * 0.22,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = '13px monospace'
      for (const p of parts) {
        ctx.fillStyle = `rgba(${p.col},${p.a})`
        ctx.fillText(p.c, p.x, p.y)
        p.y -= p.v
        if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-50" style={{ zIndex: 1 }} />
}

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1600)
        setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{val}{suffix}</span>
}

function HudPanel({ title, lines, accent = false }: { title: string; lines: [string, string][]; accent?: boolean }) {
  return (
    <div className="hud-box tech-border p-4 font-mono text-[11px] leading-relaxed select-none">
      <div className={`mb-2 tracking-widest ${accent ? 'text-[#FF5500]' : 'text-[#00FFE5]'}`}>{title}</div>
      {lines.map(([k, v], i) => (
        <div key={i} className="flex justify-between gap-4 text-[#5A6275]">
          <span>{k}</span><span className="text-[#00FFE5]">{v}</span>
        </div>
      ))}
      <div className="data-bar mt-3" />
    </div>
  )
}

// ── Chat Mind ────────────────────────────────────────────────────
type Msg = { role: 'user' | 'assistant'; content: string }
function MindChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Oi, eu sou a Mind.\nUma agente de IA ligada ao Claude.\nPosso te ensinar a criar bots, prompts, agentes e automações.\nMe pergunte o que você quer automatizar.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversas, setConversas] = useState<number | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => { boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' }) }, [msgs, loading])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(API_URL + '/stats')
      const data = await res.json()
      setConversas(data.conversas ?? null)
    } catch { }
  }, [])

  useEffect(() => { fetchStats() }, [])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    const history = [...msgs, { role: 'user' as const, content: text }]
    setMsgs(history)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      const reply = data.reply || 'Não consegui responder agora. Tenta de novo ou me chama no Telegram.'
      setMsgs((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Conexão indisponível. Me chama no Telegram que respondo na hora.' }])
    } finally {
      setLoading(false)
      fetchStats()
    }
  }, [input, loading, msgs])

  return (
    <div className="hud-box tech-border overflow-hidden flex flex-col" style={{ height: 560 }}>
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#0d0f16] to-[#0f1220] border-b border-[#FF5500]/30">
        <img src="/logo-mind.png" alt="Mind" className="w-11 h-11 rounded-full object-contain flex-shrink-0" />
        <div>
          <div className="font-bold tracking-wide">MIND</div>
          <div className="font-mono text-[11px] text-[#00FFE5] flex items-center gap-1.5 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] live-dot" /> NEURAL INTERFACE ACTIVE
          </div>
        </div>
        <a href={TELEGRAM_URL} target="_blank" rel="noreferrer"
           className="ml-auto font-mono text-xs px-3.5 py-2 border border-[#2a3142] text-[#00FFE5] hover:border-[#FF5500] hover:text-[#FF5500] transition-colors rounded-sm">
          ✈ TELEGRAM
        </a>
      </div>
      <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#07090e] to-[#060708]">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed rounded-md whitespace-pre-line ${
              m.role === 'user'
                ? 'bg-[#FF5500] text-black font-medium'
                : 'bg-[#0d1018] border border-[#FF5500]/20 text-[#dde3f0] shadow-[0_0_12px_rgba(255,85,0,0.05)]'
            }`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#10131c] border border-[#1c2230] px-4 py-3 rounded-md font-mono text-sm text-[#00FFE5]">
              processando<span className="cursor-blink">_</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[#FF5500]/20 bg-[#08090f] flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="pergunte sobre bots, prompts, agentes, Claude, Python..."
          className="flex-1 bg-[#0a0c14] border border-[#2a3346] rounded-sm px-4 py-3.5 text-[15px] font-mono outline-none focus:border-[#FF5500]/70 focus:bg-[#0c0e1a] focus:shadow-[0_0_16px_rgba(255,85,0,0.08)] transition-all placeholder:text-[#3d4658] text-[#e8ecf4]"
        />
        <button onClick={send} disabled={loading}
          className="px-6 rounded-sm bg-[#FF5500] text-black font-bold hover:brightness-110 active:scale-95 transition disabled:opacity-40">
          ➤
        </button>
      </div>
    </div>
  )
}

// ── Service Card ──────────────────────────────────────────────────
function ServiceCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="reveal group hud-box tech-border p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FF5500]/40 cursor-default">
      <div className="font-mono text-[#FF5500] text-sm mb-4 tracking-widest">{num}</div>
      <h3 className="text-2xl font-extrabold mb-3 text-[#E8ECF4] group-hover:text-[#00FFE5] transition-colors">{title}</h3>
      <p className="text-[#7a8398] leading-relaxed text-[15px]">{desc}</p>
      <div className="mt-6 h-[2px] w-10 bg-[#FF5500] group-hover:w-full transition-all duration-500" />
    </div>
  )
}

// ── Hero Terminal ─────────────────────────────────────────────────
const PYTHON_SCRIPTS = [
  {
    filename: 'mind_agent_claude.py',
    lines: [
      'import anthropic, json',
      'from telegram import Bot',
      '',
      'client = anthropic.Anthropic()',
      'bot = Bot(token=TELEGRAM_TOKEN)',
      '',
      '# [13:30:21] pergunta recebida no site',
      'def processar_pergunta(mensagem: str) -> dict:',
      '    response = client.messages.create(',
      '        model="claude-haiku-4-5",',
      '        system=SYSTEM_PROMPT,',
      '        messages=[{"role":"user","content":mensagem}]',
      '    )',
      '    return json.loads(response.content[0].text)',
      '',
      '# [13:30:24] Claude processando contexto',
      '# [13:30:28] resposta enviada pela Mind',
    ]
  },
  {
    filename: 'automacao_relatorio.py',
    lines: [
      'import schedule, time',
      'from datetime import datetime',
      '',
      '# [03:00:01] iniciando automação...',
      'def gerar_relatorio_diario():',
      '    dados = buscar_dados_crm()',
      '    relatorio = processar_com_ia(dados)',
      '    enviar_email(relatorio)',
      '    print(f"[{datetime.now()}] ✓ enviado")',
      '',
      'schedule.every().day.at("07:00").do(',
      '    gerar_relatorio_diario',
      ')',
      '',
      'while True:',
      '    schedule.run_pending()',
      '    time.sleep(60)',
      '',
      '# [03:01:00] ✓ sistema ativo',
    ]
  }
]

function HeroTerminal() {
  const [scriptIdx, setScriptIdx] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [displayed, setDisplayed] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState('')
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = PYTHON_SCRIPTS[scriptIdx]
    const lines = script.lines
    if (lineIdx >= lines.length) {
      const t = setTimeout(() => {
        setScriptIdx((i) => (i + 1) % PYTHON_SCRIPTS.length)
        setLineIdx(0); setCharIdx(0); setDisplayed([]); setCurrentLine('')
      }, 3000)
      return () => clearTimeout(t)
    }
    const line = lines[lineIdx]
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setCurrentLine(line.slice(0, charIdx + 1))
        setCharIdx((c) => c + 1)
      }, line.startsWith('#') ? 28 : 20)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setDisplayed((d) => [...d, line])
        setCurrentLine(''); setCharIdx(0); setLineIdx((l) => l + 1)
      }, line === '' ? 80 : 100)
      return () => clearTimeout(t)
    }
  }, [scriptIdx, lineIdx, charIdx])

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' })
  }, [displayed, currentLine])

  const script = PYTHON_SCRIPTS[scriptIdx]
  const getColor = (line: string) => {
    if (line.startsWith('#')) return '#5A6275'
    if (line.startsWith('import') || line.startsWith('from')) return '#00FFE5'
    if (line.includes('def ')) return '#FF5500'
    if (line.includes('✓')) return '#FF5500'
    if (line.includes('"') || line.includes("'")) return '#a8c7fa'
    return '#E8ECF4'
  }

  return (
    <div className="hud-box tech-border overflow-hidden w-full" style={{ borderLeft: "2px solid rgba(255,85,0,0.5)", boxShadow: "-4px 0 20px rgba(255,85,0,0.08)" }}>
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0d0f16] border-b border-[#1c2230]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="font-mono text-[12px] text-[#5A6275] ml-3">
          ~/mindsette/<span className="text-[#00FFE5]">{script.filename}</span>
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF5500] live-dot" />
          <span className="font-mono text-[10px] text-[#FF5500] tracking-widest">AO VIVO</span>
        </span>
      </div>
      <div ref={termRef} className="p-5 font-mono text-[13px] leading-relaxed bg-[#07080c] overflow-y-auto" style={{ height: 440 }}>
        <div className="text-[#5A6275] mb-2 text-[11px]">
          <span className="text-[#FF5500]">mind@mindsette</span>
          <span className="text-[#3a4154]">:~$ </span>
          <span className="text-[#00FFE5]">python3 {script.filename}</span>
        </div>
        {displayed.map((line, i) => (
          <div key={i} style={{ color: getColor(line), minHeight: '1.5rem' }}>
            {line === '' ? '\u00A0' : line}
          </div>
        ))}
        <div style={{ color: getColor(currentLine), minHeight: '1.5rem' }}>
          {currentLine}<span className="cursor-blink text-[#FF5500]">▮</span>
        </div>
      </div>
    </div>
  )
}

// ── Cookie Consent ────────────────────────────────────────────────
function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem('ms_cookies') } catch { return true }
  })
  const [showDetails, setShowDetails] = useState(false)
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false })

  const accept = () => { localStorage.setItem('ms_cookies', JSON.stringify({ all: true })); setVisible(false) }
  const savePrefs = () => { localStorage.setItem('ms_cookies', JSON.stringify(prefs)); setVisible(false) }
  const reject = () => { localStorage.setItem('ms_cookies', JSON.stringify({ all: false })); setVisible(false) }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] p-4 md:p-6">
      <div className="max-w-4xl mx-auto hud-box tech-border bg-[#0a0c14] border border-[#2a3346] p-5">
        {!showDetails ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="font-mono text-[11px] text-[#FF5500] tracking-widest mb-2">// POLÍTICA DE COOKIES</div>
              <p className="text-[#7a8398] text-sm leading-relaxed">
                Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{" "}
                <button onClick={() => setShowDetails(true)} className="text-[#00FFE5] underline hover:text-[#FF5500] transition-colors">política de cookies</button>.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0 flex-wrap">
              <button onClick={reject} className="font-mono text-xs px-4 py-2.5 border border-[#2a3346] text-[#5A6275] hover:border-[#FF5500] hover:text-[#FF5500] transition-all">REJEITAR</button>
              <button onClick={() => setShowDetails(true)} className="font-mono text-xs px-4 py-2.5 border border-[#00FFE5]/40 text-[#00FFE5] hover:border-[#00FFE5] transition-all">PREFERÊNCIAS</button>
              <button onClick={accept} className="font-mono text-xs px-5 py-2.5 bg-[#FF5500] text-black font-bold hover:brightness-110 transition-all">ACEITAR TUDO</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="font-mono text-[11px] text-[#FF5500] tracking-widest mb-4">// GERENCIAR PREFERÊNCIAS</div>
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between p-3 bg-[#060709] border border-[#1c2230]">
                <div>
                  <div className="font-mono text-sm text-white">Cookies Essenciais</div>
                  <div className="font-mono text-[11px] text-[#5A6275] mt-0.5">Necessários para o funcionamento do site</div>
                </div>
                <span className="font-mono text-[11px] text-[#00FFE5] tracking-wider">SEMPRE ATIVO</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#060709] border border-[#1c2230]">
                <div>
                  <div className="font-mono text-sm text-white">Analytics</div>
                  <div className="font-mono text-[11px] text-[#5A6275] mt-0.5">Nos ajudam a entender como você usa o site</div>
                </div>
                <button onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                  className={"w-10 h-5 rounded-full transition-colors relative " + (prefs.analytics ? "bg-[#FF5500]" : "bg-[#2a3346]")}>
                  <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all " + (prefs.analytics ? "left-5" : "left-0.5")} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#060709] border border-[#1c2230]">
                <div>
                  <div className="font-mono text-sm text-white">Marketing</div>
                  <div className="font-mono text-[11px] text-[#5A6275] mt-0.5">Usados para anúncios personalizados</div>
                </div>
                <button onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                  className={"w-10 h-5 rounded-full transition-colors relative " + (prefs.marketing ? "bg-[#FF5500]" : "bg-[#2a3346]")}>
                  <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all " + (prefs.marketing ? "left-5" : "left-0.5")} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDetails(false)} className="font-mono text-xs px-4 py-2.5 border border-[#2a3346] text-[#5A6275] hover:text-white transition-all">VOLTAR</button>
              <button onClick={savePrefs} className="font-mono text-xs px-5 py-2.5 bg-[#FF5500] text-black font-bold hover:brightness-110 transition-all">SALVAR</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  useReveal()
  return (
    <div className="scanlines relative">
      <ParticleCanvas />
      <MusicPlayer />

      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#08090f]/95 border-b-2 border-[#FF5500]/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="font-extrabold text-xl md:text-3xl tracking-tight">
            Mind<span className="text-[#ffffff]">Sette</span><span className="text-[#FF5500]">.AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-mono text-[13px] text-[#c8d0e0] tracking-wide">
            <a href="#mind" className="hover:text-[#FF5500] transition-colors">// mind</a>
            <a href="#servicos" className="hover:text-[#FF5500] transition-colors">// serviços</a>
            <a href="#contato" className="hover:text-[#FF5500] transition-colors">// contato</a>
          </div>
          <a href="#mind" className="font-mono text-[11px] md:text-[13px] px-3 md:px-6 py-2 md:py-3 rounded-sm bg-[#FF5500] text-black font-bold hover:brightness-110 transition tracking-widest">
            TESTAR MIND →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative z-10 min-h-screen flex items-center px-6 pt-16 pb-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
          <div>
            <div className="font-mono text-[12px] text-[#00FFE5] tracking-[0.25em] mb-6 reveal visible">
              // MIND_AGENT — CLAUDE API <span className="text-[#FF5500]">CONNECTED</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.02] mb-7">
              Converse com uma IA<br />
              <span className="text-[#FF5500] glow-orange">que ensina automação.</span>
            </h1>
            <p className="text-lg text-[#7a8398] max-w-md mb-10 leading-relaxed">
              A Mind é uma agente conectada à API do Claude, funcionando no site e no Telegram para ensinar bots, agentes e automações na prática.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#mind" className="pulse-soft px-6 py-3 rounded-sm bg-[#FF5500] text-black font-extrabold text-sm hover:brightness-110 transition text-center font-mono tracking-wide">
                TESTAR A MIND
              </a>
              <a href="#servicos" className="px-6 py-3 rounded-sm border border-[#00FFE5] text-[#00FFE5] font-mono font-bold text-sm hover:border-[#FF5500] hover:text-[#FF5500] transition text-center tracking-wide">
                COMO FUNCIONA →
              </a>
            </div>
            <div className="hidden">
              <HudPanel title="PROCESSING.." accent lines={[['uptime', '97.3%'], ['data stream', 'secure'], ['link', 'encrypted']]} />
              <HudPanel title="CORE STATUS" lines={[['learning core', 'adaptive'], ['personality', 'stable'], ['sys id', 'MND-7X21']]} />
            </div>
          </div>
          <div className="relative">
            <HeroTerminal />
          </div>
        </div>
      </header>

      {/* CHAT */}
      <section id="mind" className="relative z-10 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="reveal mb-12 text-center">
            <div className="font-mono text-[12px] text-[#FF5500] mb-3 tracking-[0.25em]">// EXPERIMENTE AGORA</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Converse com a <span className="text-[#00FFE5] glow-ice">Mind.</span></h2>
            <p className="text-[#7a8398] text-lg max-w-md mx-auto">Nossa agente de IA ensina automação e tira suas dúvidas — aqui ou no Telegram.</p>
          </div>
          <div className="reveal shadow-[0_0_40px_rgba(255,85,0,0.06)] rounded-sm"><MindChat /></div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-14">
            <div className="font-mono text-[12px] text-[#FF5500] mb-3 tracking-[0.25em]">// O QUE A GENTE CONSTRÓI</div>
            <h2 className="text-4xl md:text-5xl font-extrabold">Inteligência que <span className="text-[#00FFE5] glow-ice">executa.</span></h2>
            <p className="text-[#7a8398] text-lg mt-4 max-w-2xl">Da ideia ao agente funcionando: site, Telegram, atendimento, alertas e fluxos automatizados.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ServiceCard num="[ 01 ]" title="Agentes de IA"
              desc="Assistentes conectados ao Claude para responder, orientar, organizar informações e executar tarefas com contexto." />
            <ServiceCard num="[ 02 ]" title="Bots sob medida"
              desc="Bots para site, Telegram ou WhatsApp, integrados à IA para atender, ensinar, qualificar e automatizar conversas." />
            <ServiceCard num="[ 03 ]" title="Automações"
              desc="Fluxos que conectam ferramentas, reduzem tarefas repetitivas e fazem o sistema trabalhar por você." />
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="relative z-10 py-28 px-6 bg-[#06070b]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="reveal mb-10">
            <div className="font-mono text-[12px] text-[#FF5500] mb-3 tracking-[0.25em]">// RESPONSÁVEL PELO PROJETO</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Marcelo <span className="text-[#00FFE5] glow-ice">Sette</span></h2>
            <p className="text-[#7a8398] text-lg mb-2">Criador da MindSette.AI e da agente Mind.</p>
            <p className="text-[#7a8398] text-base max-w-md mx-auto">Desenvolvo projetos práticos com IA, bots, automações, segurança digital e aplicações para negócios.</p>
          </div>
          <div className="reveal hud-box tech-border p-8 max-w-md mx-auto">
            <div className="font-mono text-[11px] text-[#00FFE5] tracking-widest mb-6">// ENTRE EM CONTATO</div>
            <div className="flex flex-col gap-4">
              <a href="mailto:msettejunior@icloud.com"
                className="flex items-center gap-3 px-6 py-4 rounded-sm bg-[#FF5500] text-black font-extrabold font-mono text-sm hover:brightness-110 transition justify-center tracking-wide">
                ✉ msettejunior@icloud.com
              </a>
              <a href="https://instagram.com/mindsette.ai" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 px-6 py-4 rounded-sm border border-[#2a3142] text-[#00FFE5] font-mono text-sm hover:border-[#FF5500] hover:text-[#FF5500] transition justify-center tracking-wide">
                ◉ @mindsette.ai
              </a>
              <a href="https://t.me/MindSette_bot" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 px-6 py-4 rounded-sm border border-[#2a3142] text-[#00FFE5] font-mono text-sm hover:border-[#FF5500] hover:text-[#FF5500] transition justify-center tracking-wide">
                ✈ Telegram — @MindSette_bot
              </a>
              <a href="https://github.com/msette-jr" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 px-6 py-4 rounded-sm border border-[#2a3142] text-[#00FFE5] font-mono text-sm hover:border-[#FF5500] hover:text-[#FF5500] transition justify-center tracking-wide">
                ⌥ github.com/msette-jr
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#161a26] py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-extrabold text-2xl">MindSette<span className="text-[#FF5500]">.AI</span></div>
            <div className="font-mono text-[12px] text-[#5A6275] mt-1 tracking-wider">IA APLICADA • AGENTE MIND • BOTS • AUTOMAÇÕES</div>
          </div>
          <div className="flex gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
               className="font-mono text-[13px] px-5 py-3 rounded-sm border border-[#2a3142] text-[#00FFE5] hover:border-[#FF5500] hover:text-[#FF5500] transition">
              ◉ @mindsette.ai
            </a>
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer"
               className="font-mono text-[13px] px-5 py-3 rounded-sm border border-[#2a3142] text-[#00FFE5] hover:border-[#FF5500] hover:text-[#FF5500] transition">
              ✈ TELEGRAM
            </a>
          </div>
        </div>
        <div className="text-center font-mono text-[11px] text-[#2e3342] mt-10 tracking-widest">
          © 2026 MINDSETTE.AI — SYS ID: MND-7X21
        </div>
      </footer>
      <CookieConsent />
    </div>
  )
}
