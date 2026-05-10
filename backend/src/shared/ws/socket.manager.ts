import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

class SocketManager {
  private io: SocketServer | null = null;
  // userId → set of socketIds (suporta múltiplas abas/dispositivos)
  private userSockets = new Map<string, Set<string>>();

  init(httpServer: HttpServer): void {
    this.io = new SocketServer(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) return next(new Error('Token ausente'));
      try {
        const payload = verifyToken(token);
        socket.data.userId = payload.sub;
        next();
      } catch {
        next(new Error('Token inválido'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const userId: string = socket.data.userId;
      this.addSocket(userId, socket.id);
      socket.on('disconnect', () => this.removeSocket(userId, socket.id));
    });
  }

  private addSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private removeSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) this.userSockets.delete(userId);
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    if (!this.io) return;
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    for (const socketId of sockets) {
      this.io.to(socketId).emit(event, data);
    }
  }
}

export const socketManager = new SocketManager();
