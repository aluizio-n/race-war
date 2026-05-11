import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { storage } from '../lib/storage';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'http://localhost:3333';

type SpeedViolationEvent = {
  activityId: string;
  mode: string;
  avgSpeedKmh: number;
  limitKmh: number;
};

type FriendRequestEvent = {
  from?: { id: string; name: string; nickname: string };
  to?: { id: string; name: string; nickname: string };
};

interface SocketHandlers {
  onSpeedViolation?: (data: SpeedViolationEvent) => void;
  onFriendRequestReceived?: (data: FriendRequestEvent) => void;
  onFriendRequestSent?: (data: FriendRequestEvent) => void;
  onFriendRequestAccepted?: (data: FriendRequestEvent) => void;
}

export function useSocket(handlers: SocketHandlers = {}) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return;

    const token = await storage.getAccessToken();
    if (!token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('speed_violation', (data: SpeedViolationEvent) => {
      handlersRef.current.onSpeedViolation?.(data);
    });
    socket.on('friend_request_received', (data: FriendRequestEvent) => {
      handlersRef.current.onFriendRequestReceived?.(data);
    });
    socket.on('friend_request_sent', (data: FriendRequestEvent) => {
      handlersRef.current.onFriendRequestSent?.(data);
    });
    socket.on('friend_request_accepted', (data: FriendRequestEvent) => {
      handlersRef.current.onFriendRequestAccepted?.(data);
    });

    socketRef.current = socket;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [connect]);

  return { socket: socketRef.current, reconnect: connect };
}
