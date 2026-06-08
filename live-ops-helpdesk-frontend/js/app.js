const socket = io(
    "https://live-ops-helpdesk-backend-edpp.onrender.com",
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

function addLog(message, type = "info") {
    const li = document.createElement("li");

    li.textContent = message;
    li.classList.add(type);

    logs.prepend(li);
}


function joinDashboard() {
    const agentName =
        agentInput.value.trim();

    if (!agentName) {
        addLog(
            "⚠️ Please enter agent name",
            "warning"
        );
        return;
    }

    socket.emit("join_dashboard", {
        agentName,
    });
}

function lockTicket() {
    const ticketId =
        ticketInput.value.trim();

    const agentName =
        agentInput.value.trim();

    if (!ticketId || !agentName) {
        addLog(
            "⚠️ Agent Name and Ticket ID are required",
            "warning"
        );
        return;
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
        addLog(
            "⚠️ Please enter Ticket ID",
            "warning"
        );
        return;
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
        `🟢 Connected: ${socket.id}`,
        "success"
    );
});

socket.on(
    "joined_successfully",
    (data) => {
        addLog(
            `✅ Joined Dashboard (${data.socketId})`,
            "success"
        );

        console.log(
            "Current Locks:",
            data.currentLocks
        );
    }
);

socket.on(
    "ticket_locked",
    (data) => {
        addLog(
            `🔒 ${data.ticketId} locked by ${data.lockedBy}`,
            "warning"
        );
    }
);

socket.on(
    "ticket_unlocked",
    (data) => {
        addLog(
            `🔓 ${data.ticketId} unlocked (${data.reason})`,
            "success"
        );
    }
);

socket.on(
    "lock_failed",
    (data) => {
        addLog(
            `❌ Lock Failed: ${data.message}`,
            "error"
        );
    }
);

socket.on(
    "unlock_failed",
    (data) => {
        addLog(
            `❌ Unlock Failed: ${data.message}`,
            "error"
        );
    }
);

socket.on("disconnect", () => {
    addLog(
        "🔴 Disconnected from server",
        "error"
    );
});