import { useEffect, useRef, useState } from "react"

export default function CameraFeed({ candidateId, onAlert }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const audioContextRef = useRef(null)
  const processorRef = useRef(null)
  const [status, setStatus] = useState("Connexion...")
  const [gaze, setGaze] = useState("—")
  const [faces, setFaces] = useState(0)
  const [volumeDb, setVolumeDb] = useState(0)
  const [voiceDetected, setVoiceDetected] = useState(false)
  const audioBufferRef = useRef([])

  useEffect(() => {
    // Connexion WebSocket
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${candidateId}`)
    wsRef.current.onopen = () => setStatus("Connecté")
    wsRef.current.onclose = () => setStatus("Déconnecté")

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setGaze(data.gaze)
      setFaces(data.faces_count)
      setVolumeDb(data.volume_db || 0)
      setVoiceDetected(data.voice_detected || false)
      if (data.alerts?.length > 0) {
        data.alerts.forEach(alert => onAlert(alert))
      }
    }

    // Accès webcam + micro
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        // Vidéo
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Audio — Web Audio API
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        audioContextRef.current = new AudioCtx({ sampleRate: 16000 })
        const source = audioContextRef.current.createMediaStreamSource(stream)

        // ScriptProcessor pour capturer les samples (512 samples à la fois)
        const processor = audioContextRef.current.createScriptProcessor(512, 1, 1)
        processorRef.current = processor

        processor.onaudioprocess = (e) => {
          const channelData = e.inputBuffer.getChannelData(0)
          audioBufferRef.current.push(...channelData)
        }

        source.connect(processor)
        processor.connect(audioContextRef.current.destination)
      })
      .catch(() => setStatus("Caméra/micro refusé"))

    // Envoi frames + audio toutes les 500ms
    const interval = setInterval(() => {
      if (!canvasRef.current || !videoRef.current) return
      if (wsRef.current?.readyState !== WebSocket.OPEN) return

      // Capture frame vidéo
      const ctx = canvasRef.current.getContext("2d")
      canvasRef.current.width = 320
      canvasRef.current.height = 240
      ctx.drawImage(videoRef.current, 0, 0, 320, 240)

      canvasRef.current.toBlob(blob => {
        if (!blob) return
        blob.arrayBuffer().then(buf => {
          // Encode frame en base64
          const frameB64 = btoa(String.fromCharCode(...new Uint8Array(buf)))

          // Encode audio buffer en base64 (Float32Array → bytes)
          let audioB64 = ""
          if (audioBufferRef.current.length > 0) {
            const samples = new Float32Array(audioBufferRef.current.splice(0))
            const bytes = new Uint8Array(samples.buffer)
            audioB64 = btoa(String.fromCharCode(...bytes))
          }

          wsRef.current.send(JSON.stringify({
            frame: frameB64,
            audio: audioB64
          }))
        })
      }, "image/jpeg", 0.7)
    }, 500)

    return () => {
      clearInterval(interval)
      wsRef.current?.close()
      processorRef.current?.disconnect()
      audioContextRef.current?.close()
    }
  }, [candidateId])

  // Couleur indicateur volume
  const volumeColor = voiceDetected ? "#a32d2d" : volumeDb > -45 ? "#854f0b" : "#0f6e56"

  return (
    <div style={{
      background: "#fff",
      border: "0.5px solid #e0e0e0",
      borderRadius: 12,
      overflow: "hidden"
    }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", display: "block", maxHeight: 240, objectFit: "cover" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Infos détection */}
      <div style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: status === "Connecté" ? "#0f6e56" : "#a32d2d" }}>
            ● {status}
          </span>
          <span style={{ color: "#555" }}>
            Regard : <strong>{gaze}</strong> | Visages : <strong>{faces}</strong>
          </span>
        </div>

        {/* Indicateur audio */}
        <div style={{
          background: voiceDetected ? "#fcebeb" : "#f5f5f3",
          borderRadius: 8,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <span style={{ fontSize: 16 }}>{voiceDetected ? "🔊" : "🔇"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>Niveau audio</div>
            {/* Barre de volume */}
            <div style={{
              height: 6, background: "#e0e0e0",
              borderRadius: 99, overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, (volumeDb + 60) / 60 * 100))}%`,
                background: volumeColor,
                borderRadius: 99,
                transition: "width 0.2s"
              }} />
            </div>
          </div>
          <span style={{ fontSize: 11, color: volumeColor, fontWeight: 500, minWidth: 50 }}>
            {voiceDetected ? "VOIX !" : `${volumeDb} dB`}
          </span>
        </div>
      </div>
    </div>
  )
}