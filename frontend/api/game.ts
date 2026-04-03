import client from './client';
import { GameRoom, ApiResponse } from '../types';

export const createRoom = async (name: string = '') => {
  const res = await client.post<ApiResponse<GameRoom>>('/rooms/create/', { name });
  return res.data;
};

export const joinRoom = async (roomId: string) => {
  const res = await client.post<ApiResponse<GameRoom>>(`/rooms/${roomId}/join/`);
  return res.data;
};

export const getRoom = async (roomId: string) => {
  const res = await client.get<ApiResponse<GameRoom>>(`/rooms/${roomId}/`);
  return res.data;
};

export const listRooms = async () => {
  const res = await client.get<ApiResponse<GameRoom[]>>('/rooms/');
  return res.data;
};

export const makeMove = async (roomId: string, position: number) => {
  const res = await client.post<ApiResponse<GameRoom>>(`/rooms/${roomId}/move/`, { position });
  return res.data;
};
