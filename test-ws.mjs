
import { io } from "socket.io-client";
const socket = io("http://localhost:4000/tracking");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("delivery:status-update", {
    route_stop_id: "2eca6c38-c8d2-4734-a6ca-703ec80df2ab",
    status: "arrived",
    note: "Arrived at delivery point",
  });
});

// Dashboard listens
socket.on("driver:position-updated", (data) => {
  console.log("Position update:", data);
});
