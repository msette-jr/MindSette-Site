import { useRef, useState } from "react"

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.volume = 0.4
      audio.loop = true
      audio.play().then(() => {
        setPlaying(true)
      }).catch((e) => {
        console.log('Audio error:', e)
      })
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/techmologyv3.mp3" preload="auto" />

      <button
        onClick={toggle}
        title={playing ? "Pausar música" : "Tocar música"}
        style={{
          position: 'fixed',
          top: '88px',
          right: '20px',
          zIndex: 50,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${playing ? '#00FFE5' : '#FFD700'}`,
          background: playing ? 'rgba(0,255,229,0.08)' : 'rgba(255,215,0,0.12)',
          boxShadow: playing ? '0 0 14px #00FFE5aa' : '0 0 14px #FFD700aa',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {playing ? <IconPlaying /> : <IconPaused />}
      </button>
    </>
  )
}

function IconPaused() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <path d="M1 5.5H3.5L7 1v14L3.5 10.5H1V5.5z" fill="#FFD700" />
      <path d="M10 4a5.5 5.5 0 0 1 0 8" stroke="#FFD700" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12.5 2a8 8 0 0 1 0 12" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

function IconPlaying() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 5.5H3.5L7 1v14L3.5 10.5H1V5.5z" fill="#00FFE5" />
      <path d="M10 4a5.5 5.5 0 0 1 0 8" stroke="#00FFE5" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12.5 2a8 8 0 0 1 0 12" stroke="#00FFE5" strokeWidth="1.2" strokeLinecap="round" opacity="0.45"/>
    </svg>
  )
}
