const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
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
        console.log(
            `${agentName} wants to lock ${ticketId}`
        );

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

        console.log(
            `Locked ${ticketId} by ${agentName}`
        );

        io.emit("ticket_locked", {
            ticketId,
            lockedBy: agentName,
            socketId: socket.id,
        });
    });

  

    socket.on("unlock_ticket", ({ ticketId }) => {
        const lockInfo = ticketLocks.get(ticketId);

        if (!lockInfo) {
            return;
        }

        if (lockInfo.socketId !== socket.id) {
            socket.emit("unlock_failed", {
                message:
                    "Only lock owner can unlock ticket",
            });

            return;
        }

        ticketLocks.delete(ticketId);

        console.log(`Unlocked ${ticketId}`);

        io.emit("ticket_unlocked", {
            ticketId,
            reason: "manual",
        });
    });


    socket.on("disconnect", () => {
        console.log(
            `Socket disconnected: ${socket.id}`
        );

        const releasedTickets = [];


        for (const [
            ticketId,
            lockInfo,
        ] of ticketLocks.entries()) {
            if (lockInfo.socketId === socket.id) {
                ticketLocks.delete(ticketId);

                releasedTickets.push(ticketId);

                console.log(
                    `Auto-unlocked ${ticketId}`
                );
            }
        }


        releasedTickets.forEach((ticketId) => {
            io.emit("ticket_unlocked", {
                ticketId,
                reason: "disconnect",
            });
        });

        console.log(
            `Released ${releasedTickets.length} ticket(s)`
        );
    });
});


const PORT = 5000;

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});