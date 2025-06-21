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

// Rota de teste HTTP opcional
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Eventos do WebSocket
io.on("connection", (socket) => {
  console.log("Novo usuário conectado:", socket.id);

  // Mensagem de exemplo do frontend
  socket.on("msgToServer", (dados) => {
    // Broadcast de volta para todos os clientes
    io.emit("msgToClient", dados);
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

registerPokerGameSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend Express+Socket.io rodando em http://localhost:${PORT}`);
});
