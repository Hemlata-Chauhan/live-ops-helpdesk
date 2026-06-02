# AI Usage Log

## Prompt 1

How should I structure an in-memory Map for ticket locking using Socket.IO?

Purpose:
To determine the most efficient structure for storing ticket ownership and socket IDs.

Result:
Implemented:

const ticketLocks = new Map();

with:

ticketId => {
socketId,
agentName
}

---

## Prompt 2

How do I release ticket locks automatically when a Socket.IO client disconnects unexpectedly?

Purpose:
To prevent ghost locks.

Result:
Implemented logic inside:

socket.on("disconnect")

which scans the Map, removes matching locks, and emits ticket_unlocked events.

---

## Prompt 3

Why is Socket.IO firing twice during development?

Purpose:
Debugging duplicate events caused by React Strict Mode.

Result:
Verified that Strict Mode causes duplicate mounting in development and adjusted socket initialization accordingly.
