import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom } from '../api/game';
import { getUser, getTokens, clearAuth } from '../utils/auth';
import { GameRoom } from '../types';
import { WS_LOBBY_URL } from '../config/api';

export default function Lobby() {
  const navigate = useNavigate();
  const user = getUser();
  const tokens = getTokens();
  const wsRef = useRef<WebSocket | null>(null);

  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [roomName, setRoomName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!tokens) return;
    const ws = new WebSocket(WS_LOBBY_URL(tokens.access));
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'lobby_update') setRooms(msg.rooms);
    };
    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, []);

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    setError(''); setCreating(true);
    try {
      const res = await createRoom(roomName.trim());
      if (res.success && res.data) {
        navigate(`/game/${res.data.room_id}`);
      } else setError(res.error || 'Failed to create room');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error creating room');
    } finally { setCreating(false); }
  };

  const handleJoin = async (roomId: string) => {
    setError('');
    try {
      const res = await joinRoom(roomId);
      if (res.success && res.data) navigate(`/game/${res.data.room_id}`);
      else setError(res.error || 'Failed to join');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error joining room');
    }
  };

  const handleLogout = () => { wsRef.current?.close(); clearAuth(); navigate('/signin'); };

  const canJoin = (r: GameRoom) =>
    r.status === 'waiting' && r.players.length < 2 && !r.players.includes(user?.username ?? '');

  const isMyRoom = (r: GameRoom) => r.players.includes(user?.username ?? '');

  const statusMeta: Record<string, { label: string; color: string; icon: string }> = {
    waiting:  { label: 'Waiting',     color: '#3b82f6', icon: '⏳' },
    active:   { label: 'In Progress', color: '#22c55e', icon: '⚔️' },
    finished: { label: 'Finished',    color: '#6b7280', icon: '🏁' },
  };

  return (
    <div className="lobby-page">
      {/* Header */}
      <header className="lobby-nav">
        <div className="lobby-nav-brand">
          <span className="brand-name">TicTacToe</span>
        </div>
        <div className="lobby-nav-right">
          <span className={`live-dot ${connected ? 'live' : 'dead'}`} />
          <span className="nav-user">👤 {user?.username}</span>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main className="lobby-main">
        {error && <div className="lobby-error">{error}</div>}

        {/* Create + Join bar */}
        <section className="create-section">
          <div className="create-card">
            <h2 className="create-title">Create a Room</h2>
            <div className="create-row">
              <input
                className="create-input"
                placeholder="Room name..."
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                maxLength={30}
              />
              <button
                className="btn-create"
                onClick={handleCreate}
                disabled={!roomName.trim() || creating}
              >
                {creating ? '...' : '+ Create Room'}
              </button>
            </div>
          </div>

          <div className="divider-or"><span>or</span></div>

          <div className="join-card">
            <h2 className="create-title">Join by ID</h2>
            <div className="create-row">
              <input
                className="create-input"
                placeholder="Enter Room ID..."
                value={joinId}
                onChange={e => setJoinId(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <button
                className="btn-join-id"
                onClick={() => handleJoin(joinId)}
                disabled={!joinId}
              >
                Join →
              </button>
            </div>
          </div>
        </section>

        {/* Rooms list */}
        <section className="rooms-section">
          <div className="rooms-title-row">
            <h2 className="rooms-title">All Rooms</h2>
            <span className="rooms-count">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
          </div>

          {rooms.length === 0 ? (
            <div className="rooms-empty">
              <span className="empty-icon">🎮</span>
              <p>No rooms yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map(room => {
                const meta = statusMeta[room.status];
                const mine = isMyRoom(room);
                const joinable = canJoin(room);
                return (
                  <div key={room.room_id} className={`room-card2 ${mine ? 'room-mine' : ''} ${room.status}`}>
                    <div className="rc-top">
                      <span className="rc-name">{room.name}</span>
                      <span className="rc-badge" style={{ background: meta.color + '22', color: meta.color, border: `1px solid ${meta.color}55` }}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>

                    <div className="rc-mid">
                      <div className="rc-players">
                        {[0, 1].map(i => (
                          <div key={i} className={`rc-slot ${room.players[i] ? 'filled' : 'empty'}`}>
                            {room.players[i] ? (
                              <>
                                <span className="slot-symbol">{i === 0 ? 'X' : 'O'}</span>
                                <span className="slot-name">{room.players[i]}</span>
                                {room.players[i] === user?.username && <span className="slot-you">(you)</span>}
                              </>
                            ) : (
                              <span className="slot-open">Open slot</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="rc-members-bar">
                        <div className="bar-fill" style={{ width: `${(room.players.length / 2) * 100}%` }} />
                      </div>
                      <span className="rc-members-text">{room.players.length}/2 players</span>
                    </div>

                    <div className="rc-footer">
                      <span className="rc-id">ID: {room.room_id}</span>
                      <span className="rc-creator">by {room.creator}</span>
                      {room.winner && <span className="rc-winner">🏆 {room.winner}</span>}
                      <div className="rc-actions">
                        {mine && room.status !== 'finished' && (
                          <button className="btn-rejoin" onClick={() => navigate(`/game/${room.room_id}`)}>
                            Rejoin
                          </button>
                        )}
                        {joinable && (
                          <button className="btn-join-card" onClick={() => handleJoin(room.room_id)}>
                            Join Game →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
