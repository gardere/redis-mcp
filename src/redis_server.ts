#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from 'redis';
import { ToolRegistry } from './tools/tool_registry.js';
import { RedisClientType } from './interfaces/types.js';

// Parse command line arguments
let redisHost = 'localhost';
let redisPort = 6379;

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--redis-host') {
    if (!process.argv[i + 1] || process.argv[i + 1].trim() === '') {
      console.error('Error: --redis-host requires a non-empty value');
      process.exit(1);
    }
    redisHost = process.argv[i + 1].trim();
    i++;
  } else if (process.argv[i] === '--redis-port') {
    if (!process.argv[i + 1]) {
      console.error('Error: --redis-port requires a numeric value');
      process.exit(1);
    }
    const port = parseInt(process.argv[i + 1], 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('Error: --redis-port must be a valid port number between 1 and 65535');
      process.exit(1);
    }
    redisPort = port;
    i++;
  }
}

class RedisServer {
  private server: Server;
  private redisClient: RedisClientType;
  private toolRegistry: ToolRegistry;

  constructor() {
    this.server = new Server(
      {
        name: "redis-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.redisClient = createClient({
      url: `redis://${redisHost}:${redisPort}`
    });

    this.toolRegistry = new ToolRegistry();
    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    
    // Handle process termination
    const cleanup = async () => {
      try {
        if (this.redisClient.isOpen) {
          await this.redisClient.quit();
        }
        await this.server.close();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.toolRegistry.getAllTools().map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.ensureConnected();

      const tool = this.toolRegistry.getTool(request.params.name);
      if (!tool) {
        return {
          content: [{
            type: 'text',
            text: `Unknown tool: ${request.params.name}`
          }],
          _meta: { error: true }
        };
      }

      try {
        return await tool.execute(request.params.arguments, this.redisClient);
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error executing tool: ${error}`
          }],
          _meta: { error: true }
        };
      }
    });
  }

  private async ensureConnected() {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
  }

  async run() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.info(`Redis MCP server is running and connected to Redis using url redis://${redisHost}:${redisPort}`);
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1);
    }
  }
}

const server = new RedisServer();
server.run().catch(console.error);