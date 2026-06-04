# Live Ops Helpdesk

## Project Overview

Live Ops Helpdesk is a real-time ticket locking system built using Node.js, Express, and Socket.IO.

The application prevents multiple agents from working on the same ticket simultaneously by maintaining an in-memory lock store on the server. The server acts as the single source of truth for ticket ownership and lock status.

Key Features:

* Real-time ticket locking and unlocking
* In-memory lock management using JavaScript Map()
* Instant synchronization across connected clients
* Automatic lock cleanup on unexpected disconnects
* Prevention of duplicate ticket ownership
* Socket.IO-powered bidirectional communication

---

## Tech Stack

### Backend

* Node.js
* Express.js
* Socket.IO
* CORS

### Frontend

* HTML
* CSS
* JavaScript
* Socket.IO Client

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## Installation Steps

### 1. Clone Repository

```bash
git clone <https://github.com/Hemlata-Chauhan/live-ops-helpdesk.git>
cd live-ops-helpdesk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
node server.js
```

Server will start on:

```text
http://localhost:5000
```

### 4. Open Application

Visit:

```text
http://localhost:5000
```

Open two browser windows to test real-time synchronization.

---

## Application Flow

### Join Dashboard

Agents connect to the dashboard using the `join_dashboard` Socket.IO event.

### Lock Ticket

When an agent locks a ticket:

1. Server checks the in-memory Map.
2. If ticket is already locked, request is rejected.
3. If ticket is available, lock ownership is stored.
4. Lock event is broadcast to all connected clients.

### Unlock Ticket

When the ticket owner unlocks a ticket:

1. Ownership is verified.
2. Lock is removed from memory.
3. Unlock event is broadcast to all clients.

---

## Ghost Disconnect Handler

One of the main requirements of this project is handling ghost disconnects.

### Problem

An agent may:

* Close the browser tab
* Lose internet connection
* Shut down the laptop
* Experience an application crash

In these situations, the agent never sends the `unlock_ticket` event.

Without cleanup logic, tickets would remain locked forever.

### Solution

The application implements a disconnect handler:

```javascript
socket.on("disconnect", () => {
  // release all locks owned by socket
});
```

When a socket disconnects:

1. Server scans the in-memory Map.
2. Finds tickets owned by the disconnected socket.
3. Removes those locks automatically.
4. Broadcasts unlock events to all connected clients.

This guarantees that no ticket remains permanently locked due to unexpected client disconnections.

---

## In-Memory Lock Structure

```javascript
const ticketLocks = new Map();
```

Example:

```javascript
ticketLocks.set("T101", {
  socketId: "abc123",
  agentName: "Hemlata"
});
```

This provides:

* O(1) lookup
* O(1) insert
* O(1) delete

which is ideal for real-time locking systems.

---

## Deployment URLs

### Frontend (Vercel)

https://live-ops-helpdesk-theta.vercel.app/

### Backend (Render)

https://live-ops-helpdesk-backend.onrender.com

### GitHub Repository

https://github.com/Hemlata-Chauhan/live-ops-helpdesk.git

---

## Demo Requirements Covered

* Real-time ticket locking
* Real-time ticket unlocking
* Lock ownership validation
* Duplicate lock prevention
* In-memory state management
* Ghost disconnect recovery
* Multi-client synchronization
* Socket.IO integration

---

## Future Improvements

* Redis for distributed lock management
* Authentication with JWT
* Role-based access control
* Persistent ticket history
* Reconnection recovery
* Lock expiration (TTL)
* Multi-server scalability

---

## Author

Hemlata Chauhan
