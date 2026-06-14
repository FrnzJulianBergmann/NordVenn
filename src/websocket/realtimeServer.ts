import { Server, Socket } from "socket.io"
import { verifyToken } from "../utils/jwt"
import { getRealtimeMetrics } from "../services/analyticsService"

export function initWebSocket(io: Server) {
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error("Authentication required"))
    const user = await verifyToken(token)
    if (!user) return next(new Error("Invalid token"))
    socket.data.userId = user.id
    next()
  })

  io.on("connection", (socket: Socket) => {
    console.log()

    socket.on("subscribe:repo", async (repoId: string) => {
      socket.join()
      const metrics = await getRealtimeMetrics(repoId)
      socket.emit("metrics:snapshot", metrics)
    })

    socket.on("unsubscribe:repo", (repoId: string) => {
      socket.leave()
    })

    socket.on("disconnect", () => {
      console.log()
    })
  })
}

export function broadcastMetrics(io: Server, repoId: string, metrics: unknown) {
  io.to().emit("metrics:update", metrics)
}
