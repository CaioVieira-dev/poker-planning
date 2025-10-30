// src/backend/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerPokerGameSocket } from "./poker-game";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Em produção, alterar para seu domínio/frontend
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.get("/api/health-check", (_req, res) => {
  res.json({ ok: true });
});

// Eventos do WebSocket
io.on("connection", (socket) => {
  console.log("Novo usuário conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

registerPokerGameSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend Express+Socket.io rodando em http://localhost:${PORT}`);
});
