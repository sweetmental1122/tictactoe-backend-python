# TicTacToe — Django + TypeScript + MongoDB

## Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB running on localhost:27017

## Backend (Django)

```bash
cd backend/src
# Binds to all interfaces so other devices on your network can connect
python manage.py runserver 0.0.0.0:8000
```

## Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Flow
1. Sign Up / Sign In → JWT token stored in localStorage
2. Lobby → Create a room (get a Room ID) or join an existing one
3. Share the Room ID with another player
4. Both players connect → game starts automatically
5. Take turns clicking cells — real-time via WebSocket
6. Winner/draw saved to MongoDB

## Data saved in MongoDB
- `users` collection: id, username, email, password (hashed), created_at
- `gamerooms` collection: room_id, creator, players, board, winner, status, created_at
