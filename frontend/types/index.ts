export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface GameRoom {
  room_id: string;
  name: string;
  creator: string;
  players: string[];
  board: string[];       // 9 cells: '', 'X', 'O'
  current_turn: string | null;
  winner: string | null;
  status: 'waiting' | 'active' | 'finished';
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
