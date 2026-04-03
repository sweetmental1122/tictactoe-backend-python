import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from './Board';
import { getUser, getTokens } from '../utils/auth';
import { WS_GAME_URL } from '../config/api';
import { GameRoom } from '../types';

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = getUser();
  const tokens = getTokens();
  const wsRef = useRef<WebSocket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    if (!roomId || !tokens) return;
    const ws = new WebSocket(WS_GAME_URL(roomId, tokens.access));
    wsRef.current = ws;

    ws.onopen = () => setStatus('Connected');
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'room_state') {
        setRoom(msg.data);
        updateStatus(msg.data);
      } else if (msg.type === 'error') {
        setStatus(`Error: ${msg.message}`);
      }
    };
    ws.onclose = () => setStatus('Disconnected');
    ws.onerror = () => setStatus('Connection error');

    return () => ws.close();
  }, [roomId]);

  const updateStatus = (r: GameRoom) => {
    if (r.status === 'waiting') {
      setStatus('Waiting for opponent...');
    } else if (r.status === 'finished') {
      if (r.winner) {
        setStatus(r.winner === user?.username ? 'You won!' : `${r.winner} won!`);
      } else {
        setStatus("It's a draw!");
      }
    } else {
      setStatus(r.current_turn === user?.username ? 'Your turn' : `${r.current_turn}'s turn`);
    }
  };

  const handleCellClick = (index: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'move', position: index }));
  };

  const isMyTurn = room?.status === 'active' && room?.current_turn === user?.username;

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Room: {roomId}</h1>
        <button onClick={() => navigate('/lobby')} className="btn-secondary">Back to Lobby</button>
      </div>

      <div className="game-info">
        <p className="status-text">{status}</p>
        {room && (
          <div className="players-info">
            {room.players.map((p, i) => (
              <span key={p} className={`player-badge ${p === user?.username ? 'me' : ''}`}>
                {p} ({i === 0 ? 'X' : 'O'})
              </span>
            ))}
          </div>
        )}
      </div>

      {room ? (
        <Board
          board={room.board}
          onCellClick={handleCellClick}
          disabled={!isMyTurn || room.status !== 'active'}
        />
      ) : (
        <p>Loading game...</p>
      )}

      {room?.status === 'finished' && (
        <button onClick={() => navigate('/lobby')} className="btn-primary">
          Back to Lobby
        </button>
      )}
    </div>
  );
}
