const socket = io(
    "https://live-ops-helpdesk-backend.onrender.com",
    {
        transports: ["websocket"],
    }
);

const agentInput =
    document.getElementById("agentName");

const ticketInput =
    document.getElementById("ticketId");

const logs =
    document.getElementById("logs");

const joinBtn =
    document.getElementById("joinBtn");

const lockBtn =
    document.getElementById("lockBtn");

const unlockBtn =
    document.getElementById("unlockBtn");

function addLog(message) {
    const li = document.createElement("li");

    li.textContent = message;

    logs.prepend(li);
}

function joinDashboard() {
    const agentName = agentInput.value.trim();

    if (!agentName) {
        return addLog("⚠️ Enter agent name");
    }

    socket.emit("join_dashboard", {
        agentName,
    });
}

function lockTicket() {
    const ticketId = ticketInput.value.trim();

    const agentName =
        agentInput.value.trim();

    if (!ticketId || !agentName) {
        return addLog(
            "⚠️ Agent Name and Ticket ID required"
        );
    }

    socket.emit("lock_ticket", {
        ticketId,
        agentName,
    });
}

function unlockTicket() {
    const ticketId =
        ticketInput.value.trim();

    if (!ticketId) {
        return addLog("⚠️ Enter ticket ID");
    }

    socket.emit("unlock_ticket", {
        ticketId,
    });
}

joinBtn.addEventListener(
    "click",
    joinDashboard
);

lockBtn.addEventListener(
    "click",
    lockTicket
);

unlockBtn.addEventListener(
    "click",
    unlockTicket
);

socket.on("connect", () => {
    addLog(
        `🟢 Connected: ${socket.id}`
    );
});

socket.on(
    "joined_successfully",
    (data) => {
        addLog(
            `✅ Joined Dashboard (${data.socketId})`
        );
    }
);

socket.on("ticket_locked", (data) => {
    addLog(
        `🔒 ${data.ticketId} locked by ${data.lockedBy}`
    );
});

socket.on("ticket_unlocked", (data) => {
    addLog(
        `🔓 ${data.ticketId} unlocked (${data.reason})`
    );
});

socket.on("lock_failed", (data) => {
    addLog(
        `❌ Lock Failed: ${data.message}`
    );
});

socket.on("unlock_failed", (data) => {
    addLog(
        `❌ Unlock Failed: ${data.message}`
    );
});

socket.on("disconnect", () => {
    addLog(
        "🔴 Disconnected from server"
    );
});