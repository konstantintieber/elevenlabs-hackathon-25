import express, { Request, Response, NextFunction } from 'express';
import { prisma, testConnection, closePrisma } from './config/database';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const app = express();
const elevenlabs = new ElevenLabsClient();

app.use(express.json());

// Simple CORS to allow frontend dev server
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Test database connection on startup
testConnection().catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// Public mock data endpoint
app.get('/agents', async (_req: Request, res: Response) => {

    const agents = await elevenlabs.conversationalAi.agents.list();
    return res.send(agents)
    // return res.json(mockData);
});

app.get('/agent/:agentId', async (req: Request, res: Response) => {
    // const agentId = req.params.agentId as any
    return res.status(500).json({
      error: 'Not implemented yet',
    });
});

interface AgentRequest {
  name: string;
  prompt: string;
}

app.post('/agent', async (req: Request<{}, {}, AgentRequest>, res: Response) => {
  return res.status(500).json({
    error: 'Not implemented yet',
  });
});

type EditAgentParams = { agentId: string };
type EditAgentBody = { prompt: string };

app.put(
  '/agent/:agentId',
  async (
    req: Request<EditAgentParams, {}, EditAgentBody>,
    res: Response,
  ) => {
    //const { agentId } = req.params;
    //const { prompt } = req.body ?? {};

    return res.status(500).json({
      error: 'Not implemented yet',
    });
  },
);




const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\nShutting down gracefully...');

  server.close(async () => {
    console.log('HTTP server closed');
    await closePrisma();
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
