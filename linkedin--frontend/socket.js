import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;