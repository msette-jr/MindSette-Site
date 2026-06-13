import { useState, useEffect, useRef, useCallback } from 'react'

// ════════════════════════════════════════════════════════════════
// CONFIG — NO DEPLOY ORACLE: troque API_URL pelo endpoint do proxy
// Flask, ex.: "https://seudominio.com.br/api/chat"
// ════════════════════════════════════════════════════════════════
const API_URL = "https://api.mindsette.ia.br/api/mind"
const TELEGRAM_URL = "https://t.me/MindSette_bot"
const INSTAGRAM_URL = "https://instagram.com/mindsette.ai"

// ── Partículas: azul-gelo discreto + raros laranja ───────────────
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

// ── HUD Panel (estilo da arte: MIND_SYSTEM_V5.8) ─────────────────
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

// ── Terminal ─────────────────────────────────────────────────────
const TERMINAL_LOGS = [
  { t: '[03:00:12]', m: '▶ agente iniciado', c: '#00FFE5' },
  { t: '[03:00:13]', m: '✓ 12 mensagens na fila', c: '#E8ECF4' },
  { t: '[03:00:14]', m: '✓ respondendo #1...', c: '#9aa8c4' },
  { t: '[03:00:18]', m: '✓ lead qualificado', c: '#FF5500' },
  { t: '[03:00:21]', m: '✓ agendamento confirmado', c: '#FF5500' },
  { t: '[03:00:41]', m: '✓ respondendo #15...', c: '#9aa8c4' },
  { t: '[03:01:02]', m: '✓ 23 respostas enviadas', c: '#00FFE5' },
  { t: '[03:01:05]', m: '◉ aguardando novas mensagens...', c: '#5A6275' },
]
function Terminal() {
  const [lines, setLines] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      let i = 0
      const run = () => {
        const interval = setInterval(() => {
          i++
          setLines(i)
          if (i >= TERMINAL_LOGS.length) {
            clearInterval(interval)
            setTimeout(() => { i = 0; setLines(0); run() }, 4200)
          }
        }, 680)
      }
      run()
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className="hud-box tech-border overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-[#0d0f16] border-b border-[#1c2230]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#3a3f4e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#3a3f4e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#3a3f4e]" />
        <span className="font-mono text-[13px] text-[#5A6275] ml-3">mindsette.agent — bash</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF5500] live-dot" />
          <span className="font-mono text-[11px] text-[#FF5500] tracking-widest">AO VIVO</span>
        </span>
      </div>
      <div className="p-6 min-h-[320px] font-mono text-[14px] leading-loose bg-[#07080c]">
        {TERMINAL_LOGS.slice(0, lines).map((l, i) => (
          <div key={i} style={{ color: l.c }}>
            <span className="text-[#3a4154]">{l.t}</span> {l.m}
          </div>
        ))}
        <span className="cursor-blink text-[#FF5500]">▮</span>
      </div>
    </div>
  )
}

// ── Chat Mind ────────────────────────────────────────────────────
type Msg = { role: 'user' | 'assistant'; content: string }
function MindChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Oi! Eu sou a Mind, agente de IA da MindSette. Quer aprender automação ou montar o seu próprio agente? Me pergunta qualquer coisa.' },
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
    } catch { /* silencioso */ }
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
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
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
    <div className="hud-box tech-border overflow-hidden flex flex-col" style={{ height: 620 }}>
      <div className="flex items-center gap-3 px-5 py-4 bg-[#0d0f16] border-b border-[#1c2230]">
        <div className="w-10 h-10 rounded-sm border border-[#FF5500] flex items-center justify-center font-mono font-bold text-[#FF5500]">M</div>
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
      <div ref={boxRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#060709]">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed rounded-md ${
              m.role === 'user'
                ? 'bg-[#FF5500] text-black font-medium'
                : 'bg-[#0e1018] border border-[#2a3346] text-[#cfd6e4]'
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
      <div className="p-4 border-t-2 border-[#1c2230] bg-[#0a0c14] flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="pergunte sobre automação, bots, agentes de IA..."
          className="flex-1 bg-[#0a0c14] border border-[#2a3346] rounded-sm px-4 py-3.5 text-[15px] font-mono outline-none focus:border-[#FF5500] focus:bg-[#0d1020] transition-all placeholder:text-[#4a5568] text-white"
        />
        <button onClick={send} disabled={loading}
          className="px-6 rounded-sm bg-[#FF5500] text-black font-bold hover:brightness-110 active:scale-95 transition disabled:opacity-40">
          ➤
        </button>
      </div>
    </div>
  )
}

// ── Service Card monocromático tech ──────────────────────────────
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


// ── Hero Terminal — digitação de scripts Python ──────────────────
const PYTHON_SCRIPTS = [
  {
    filename: 'agente_qualificacao.py',
    lines: [
      'import anthropic, json',
      'from telegram import Bot',
      '',
      'client = anthropic.Anthropic()',
      'bot = Bot(token=TELEGRAM_TOKEN)',
      '',
      '# [03:00:14] processando lead #12...',
      'def qualificar_lead(mensagem: str) -> dict:',
      '    response = client.messages.create(',
      '        model="claude-haiku-4-5",',
      '        system=SYSTEM_PROMPT,',
      '        messages=[{"role":"user","content":mensagem}]',
      '    )',
      '    return json.loads(response.content[0].text)',
      '',
      '# [03:00:21] ✓ lead qualificado',
      '# [03:00:22] ✓ agendamento confirmado',
      '# [03:01:02] ✓ 23 respostas enviadas',
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
    <div className="hud-box tech-border overflow-hidden w-full">
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
      <div ref={termRef} className="p-5 font-mono text-[13px] leading-relaxed bg-[#07080c] overflow-y-auto" style={{ height: 420 }}>
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

  const accept = () => {
    localStorage.setItem('ms_cookies', JSON.stringify({ all: true }))
    setVisible(false)
  }
  const savePrefs = () => {
    localStorage.setItem('ms_cookies', JSON.stringify(prefs))
    setVisible(false)
  }
  const reject = () => {
    localStorage.setItem('ms_cookies', JSON.stringify({ all: false }))
    setVisible(false)
  }

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
                <button onClick={() => setShowDetails(true)} className="text-[#00FFE5] underline hover:text-[#FF5500] transition-colors">
                  política de cookies
                </button>.
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

      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#050507]/80 border-b border-[#161a26]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-extrabold text-3xl tracking-tight">
            Mind<span className="text-white">Sette</span><span className="text-[#FF5500]">.AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-mono text-[13px] text-[#7a8398] tracking-wide">
            <a href="#mind" className="hover:text-[#FF5500] transition-colors">// mind</a>
            <a href="#servicos" className="hover:text-[#FF5500] transition-colors">// serviços</a>
            <a href="#contato" className="hover:text-[#FF5500] transition-colors">// contato</a>
          </div>
          <a href="#mind" className="font-mono text-[13px] px-4 py-2 rounded-sm bg-[#FF5500] text-black font-bold hover:brightness-110 transition tracking-wide">
            INICIAR →
          </a>
        </div>
      </nav>

      {/* HERO com a logo */}
      <header className="relative z-10 min-h-screen flex items-center px-6 pt-20 pb-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="font-mono text-[12px] text-[#00FFE5] tracking-[0.25em] mb-6 reveal visible">
              // MIND_SYSTEM_V5.8 — NEURAL INTERFACE <span className="text-[#FF5500]">ACTIVE</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.06] mb-7">
              Enquanto você dorme,<br />
              <span className="text-[#FF5500] glow-orange">seu agente trabalha.</span>
            </h1>
            <p className="text-lg text-[#7a8398] max-w-xl mb-10 leading-relaxed">
              Agentes de IA, bots e automações que respondem, agendam e qualificam — 24 horas por dia, do jeito que o seu negócio precisa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#mind" className="pulse-soft px-8 py-4 rounded-sm bg-[#FF5500] text-black font-extrabold text-base hover:brightness-110 transition text-center font-mono tracking-wide">
                FALAR COM A MIND
              </a>
              <a href="#mind" className="px-8 py-4 rounded-sm border border-[#2a3142] text-[#00FFE5] font-mono font-bold text-base hover:border-[#00FFE5] transition text-center tracking-wide">
                VER AGENTE AO VIVO
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-12 max-w-md">
              <HudPanel title="PROCESSING.." accent lines={[['uptime', '97.3%'], ['data stream', 'secure'], ['link', 'encrypted']]} />
              <HudPanel title="CORE STATUS" lines={[['learning core', 'adaptive'], ['personality', 'stable'], ['sys id', 'MND-7X21']]} />
            </div>
          </div>
          <div className="relative">
            <HeroTerminal />
          </div>
        </div>
      </header>

      {/* SERVIÇOS */}
      <section id="servicos" className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-14">
            <div className="font-mono text-[12px] text-[#FF5500] mb-3 tracking-[0.25em]">// O QUE A GENTE CONSTRÓI</div>
            <h2 className="text-4xl md:text-5xl font-extrabold">Inteligência que <span className="text-[#00FFE5] glow-ice">executa.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ServiceCard num="[ 01 ]" title="Agentes de IA"
              desc="Atendentes virtuais com personalidade, memória e contexto. Respondem clientes, qualificam leads e agendam — sem você levantar um dedo." />
            <ServiceCard num="[ 02 ]" title="Bots sob medida"
              desc="Telegram, WhatsApp ou site. Bots que conversam de verdade, integrados com a API Claude e o seu negócio." />
            <ServiceCard num="[ 03 ]" title="Automações"
              desc="Fluxos que conectam suas ferramentas e eliminam trabalho repetitivo. Você define a regra, o sistema faz o resto." />
          </div>
        </div>
      </section>



      {/* CHAT */}
      <section id="mind" className="relative z-10 py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="reveal mb-12 text-center">
            <div className="font-mono text-[12px] text-[#FF5500] mb-3 tracking-[0.25em]">// EXPERIMENTE AGORA</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Converse com a <span className="text-[#00FFE5] glow-ice">Mind.</span></h2>
            <p className="text-[#7a8398] text-lg">Nossa agente de IA ensina automação e tira suas dúvidas — aqui ou no Telegram.</p>
          </div>
          <div className="reveal"><MindChat /></div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="relative z-10 py-28 px-6 bg-[#06070b]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="reveal mb-10">
            <div className="font-mono text-[12px] text-[#FF5500] mb-3 tracking-[0.25em]">// RESPONSÁVEL PELO PROJETO</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Marcelo <span className="text-[#00FFE5] glow-ice">Sette</span></h2>
            <p className="text-[#7a8398] text-lg mb-2">Fundador da MindSette.AI — Advogado & Dev em formação</p>
            <p className="text-[#7a8398] text-base">Arquiteto de aplicações em IA, automações e bots para negócios.</p>
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
            <div className="font-mono text-[12px] text-[#5A6275] mt-1 tracking-wider">IA APLICADA • AGENTES • BOTS • AUTOMAÇÕES</div>
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
