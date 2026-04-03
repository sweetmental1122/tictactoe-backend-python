export const BASE_URL = '/api';

const WS_HOST = window.location.hostname;

export const WS_LOBBY_URL = (token: string) =>
  `ws://${WS_HOST}:8000/ws/lobby/?token=${token}`;

export const WS_GAME_URL = (roomId: string, token: string) =>
  `ws://${WS_HOST}:8000/ws/game/${roomId}/?token=${token}`;
