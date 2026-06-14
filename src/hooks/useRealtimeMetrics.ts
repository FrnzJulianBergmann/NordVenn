import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

export function useRealtimeMetrics(repoId: string | null) {
  const [metrics, setMetrics] = useState<any>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!repoId) return

    const token = localStorage.getItem("vanguard_token")
    const socket = io(process.env.REACT_APP_WS_URL ?? "http://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
    })

    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("subscribe:repo", repoId)
    })

    socket.on("metrics:snapshot", (data) => setMetrics(data))
    socket.on("metrics:update", (data) => setMetrics(data))

    return () => {
      socket.emit("unsubscribe:repo", repoId)
      socket.disconnect()
    }
  }, [repoId])

  return { metrics, isConnected: socketRef.current?.connected ?? false }
}
