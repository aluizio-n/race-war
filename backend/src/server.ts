import { createServer } from 'http';
import app from './app';
import { prisma } from './shared/utils/prisma';
import { socketManager } from './shared/ws/socket.manager';

const PORT = Number(process.env.PORT ?? 3333);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    const httpServer = createServer(app);
    socketManager.init(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Race War API running on http://localhost:${PORT}`);
      console.log(`📋 Health: http://localhost:${PORT}/health`);
      console.log(`📡 WebSocket: ws://localhost:${PORT}`);
      console.log(`📖 Docs: http://localhost:${PORT}/api-docs`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} received — graceful shutdown`);
      httpServer.close(async () => {
        await prisma.$disconnect();
        console.log('🔌 Database disconnected');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
