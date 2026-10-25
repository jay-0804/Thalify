import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSockets } from './sockets/index.js';
import { initCronJobs } from './jobs/cron.js';

const server = http.createServer(app);

// Initialize WebSocket server
initSockets(server);

// Start HTTP server immediately so port 5000 is active
const start = async () => {
  server.listen(env.PORT, '0.0.0.0', () => {
    console.log(`[TiffinLoop] 🍱 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`[TiffinLoop] 🚀 Health check: http://localhost:${env.PORT}/api/health`);
  });

  initCronJobs();
  await connectDB();
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { server };
