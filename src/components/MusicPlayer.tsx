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
        className={`
          fixed top-20 right-6 z-50git add src/components/MusicPlayer.tsx
          w-12 h-12 rounded-full
          flex items-center justify-center
          border transition-all duration-300
          ${playing
            ? "bg-[#00FFE5]/10 border-[#00FFE5] shadow-[0_0_20px_#00FFE5aa]"
            : "bg-[#060608]/80 border-[#FF5500]/50 hover:border-[#FF5500] hover:shadow-[0_0_16px_#FF5500aa]"
          }
          backdrop-blur-sm
        `}
      >
        {playing ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M2 8h3l4-5v18l-4-5H2V8z" fill="#00FFE5" />
            <path d="M14 5.5a8 8 0 0 1 0 11" stroke="#00FFE5" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            <path d="M17 3a11 11 0 0 1 0 16" stroke="#00FFE5" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
        </svg>
        ) : (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M2 8h3l4-5v18l-4-5H2V8z" fill="#FF5500" />
            <path d="M14 5.5a8 8 0 0 1 0 11" stroke="#FF5500" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.3"/>
        </svg>
        )}
      </button>
    </>
  )
}

function Equalizer() {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-[3px] bg-[#00FFE5] rounded-sm"
          style={{
            animation: `eq${i} 0.${4 + i}s ease-in-out infinite alternate`,
            height: `${8 + i * 4}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes eq1 { from { height: 4px } to { height: 16px } }
        @keyframes eq2 { from { height: 8px } to { height: 20px } }
        @keyframes eq3 { from { height: 4px } to { height: 12px } }
      `}</style>
    </div>
  )
}