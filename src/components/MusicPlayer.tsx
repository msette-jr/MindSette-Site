import { useEffect, useRef, useState } from "react"

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0
      audioRef.current.loop = true
    }
  }, [])

  const fadeIn = (audio: HTMLAudioElement) => {
    audio.volume = 0
    const step = setInterval(() => {
      if (audio.volume < 0.38) {
        audio.volume = Math.min(0.4, audio.volume + 0.02)
      } else {
        clearInterval(step)
      }
    }, 80)
  }

  const fadeOut = (audio: HTMLAudioElement, cb: () => void) => {
    const step = setInterval(() => {
      if (audio.volume > 0.02) {
        audio.volume = Math.max(0, audio.volume - 0.02)
      } else {
        clearInterval(step)
        audio.pause()
        cb()
      }
    }, 80)
  }

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      fadeOut(audio, () => setPlaying(false))
    } else {
      audio.play().then(() => {
        fadeIn(audio)
        setPlaying(true)
      }).catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/techmologyv3.mp3" preload="none" />

      <button
        onClick={toggle}
        title={playing ? "Pausar música" : "Tocar música"}
        style={{
          position: 'fixed',
          top: '72px',
          right: '20px',
          zIndex: 50,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${playing ? '#00FFE5' : '#FF550066'}`,
          background: playing ? 'rgba(0,255,229,0.08)' : 'rgba(6,6,8,0.85)',
          boxShadow: playing ? '0 0 14px #00FFE5aa' : 'none',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        {playing ? <IconPlaying /> : <IconPaused />}
      </button>
    </>
  )
}

function IconPaused() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 5.5H3.5L7 1v14L3.5 10.5H1V5.5z" fill="#FF5500" />
      <path d="M10 4a5.5 5.5 0 0 1 0 8" stroke="#FF5500" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
    </svg>
  )
}

function IconPlaying() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 5.5H3.5L7 1v14L3.5 10.5H1V5.5z" fill="#00FFE5" />
      <path d="M10 4a5.5 5.5 0 0 1 0 8" stroke="#00FFE5" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12.5 2a8 8 0 0 1 0 12" stroke="#00FFE5" strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.6 }
        }
      `}</style>
    </svg>
  )
}
