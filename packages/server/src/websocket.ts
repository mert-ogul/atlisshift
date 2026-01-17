import type { WebSocketServer } from 'ws';
import { jobRunner } from './routes/jobs.js';

/**
 * Sets up WebSocket server for real-time job progress updates
 */
export function setupWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Send job updates to connected clients
    const sendUpdate = (jobId: string, status: unknown) => {
      ws.send(
        JSON.stringify({
          type: 'job-update',
          jobId,
          status,
        }),
      );
    };

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'subscribe' && data.jobId) {
          // Subscribe to job updates
          const status = jobRunner.getJobStatus(data.jobId);
          if (status) {
            sendUpdate(data.jobId, status);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
}
