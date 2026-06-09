const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

const FRONTEND_URL =
    "https://live-ops-helpdesk-zeta.vercel.app";

app.use(
    cors({
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
    })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
    },
});

const ticketLocks = new Map();

app.get("/", (req, res) => {
    res.send("Live Ops Helpdesk Running");
});

io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    socket.on("join_dashboard", ({ agentName }) => {
        console.log(`${agentName} joined dashboard`);

        socket.emit("joined_successfully", {
            socketId: socket.id,
            currentLocks: Object.fromEntries(ticketLocks),
        });
    });

    socket.on("lock_ticket", ({ ticketId, agentName }) => {
        if (ticketLocks.has(ticketId)) {
            socket.emit("lock_failed", {
                ticketId,
                message: "Ticket already locked",
            });
            return;
        }

        ticketLocks.set(ticketId, {
            socketId: socket.id,
            agentName,
        });

        io.emit("ticket_locked", {
            ticketId,
            lockedBy: agentName,
            socketId: socket.id,
        });
    });

    socket.on("unlock_ticket", ({ ticketId }) => {
        const lockInfo = ticketLocks.get(ticketId);

        if (!lockInfo) return;

        if (lockInfo.socketId !== socket.id) {
            socket.emit("unlock_failed", {
                message: "Only lock owner can unlock ticket",
            });
            return;
        }

        ticketLocks.delete(ticketId);

        io.emit("ticket_unlocked", {
            ticketId,
            reason: "manual",
        });
    });

    socket.on("disconnect", () => {
        const releasedTickets = [];

        for (const [ticketId, lockInfo] of ticketLocks.entries()) {
            if (lockInfo.socketId === socket.id) {
                ticketLocks.delete(ticketId);
                releasedTickets.push(ticketId);
            }
        }

        releasedTickets.forEach((ticketId) => {
            io.emit("ticket_unlocked", {
                ticketId,
                reason: "disconnect",
            });
        });
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});