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
    const agentId = req.params.agentId as any
    console.log("AGENTID", agentId)

    console.log(agentId)
    return res.send(await prisma.agent.findUnique({
        where:{id: Number(agentId)}
    }))
});




interface AgentRequest {
  name: string;
  prompt: string;
}

app.post('/agent', async (req: Request<{}, {}, AgentRequest>, res: Response) => {
  const { name } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        name: !name ? 'Name is required' : undefined,
      },
    });
  }

  try {
    // Insert agent into database using Prisma
    const agent = await prisma.agent.create({
      data: {
        name,
        prompt: 'Hello world'
      },
    });

    console.log('Agent saved to database:', agent);

    return res.status(201).json({
      message: 'Agent created successfully',
      data: {
        id: agent.id,
        name: agent.name,
      },
    });
  } catch (error) {
    console.error('Error saving agent to database:', error);
    return res.status(500).json({
      error: 'Failed to save agent',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

type EditAgentParams = { agentId: string };
type EditAgentBody = { prompt: string };

app.put(
  '/agent/:agentId',
  async (
    req: Request<EditAgentParams, {}, EditAgentBody>,
    res: Response,
  ) => {
    const { agentId } = req.params;
    const { prompt } = req.body ?? {};

    // Validate agentId
    const id = Number(agentId);
    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: 'Invalid agentId',
        message: 'agentId must be an integer',
      });
    }

    // Validate prompt
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid payload',
        message: 'prompt is required and must be a non-empty string',
      });
    }

    try {
      const agent = await prisma.agent.update({
        where: { id },
        data: { prompt: prompt },
      });

      if (!agent.prompt) {
        return res.status(500).json({
          error: 'Failed to store prompt on agent',
        });
      }
      return res.status(200).json({
        message: 'Agent created',
        data: {
          agent_id: id,
          name,
        },
      });

    } catch (error: unknown) {
      // Prisma P2025: Record to update not found
      if (typeof error === 'object' && error !== null && (error as any).code === 'P2025') {
        return res.status(404).json({
          error: 'Agent not found',
          message: `Agent with id ${id} does not exist`,
        });
      }

      console.error('Error approving agent:', error);
      return res.status(500).json({
        error: 'Failed to approve agent',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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
