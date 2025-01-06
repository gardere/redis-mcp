#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from 'redis';

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

interface HMSetArgs {
  key: string;
  fields: Record<string, string>;
}

interface HGetArgs {
  key: string;
  field: string;
}

interface HGetAllArgs {
  key: string;
}

interface HSetArgs {
  key: string;
  field: string;
  value: string;
}

interface SetArgs {
  key: string;
  value: string;
  nx?: boolean;
  px?: number;
}

interface GetArgs {
  key: string;
}

interface DelArgs {
  key: string;
}

interface ScanArgs {
  pattern: string;
  count?: number;
}

class RedisServer {
  private server: Server;
  private redisClient;
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

  private validateHMSetArgs(args: unknown): args is HMSetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'fields' in args && typeof (args as any).fields === 'object';
  }

  private validateHGetArgs(args: unknown): args is HGetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'field' in args && typeof (args as any).field === 'string';
  }

  private validateHGetAllArgs(args: unknown): args is HGetAllArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string';
  }

  private validateHSetArgs(args: unknown): args is HSetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'field' in args && typeof (args as any).field === 'string' &&
      'value' in args && typeof (args as any).value === 'string';
  }

  private validateScanArgs(args: unknown): args is ScanArgs {
    return typeof args === 'object' && args !== null &&
      'pattern' in args && typeof (args as any).pattern === 'string' &&
      (!('count' in args) || typeof (args as any).count === 'number');
  }

  private validateSetArgs(args: unknown): args is SetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'value' in args && typeof (args as any).value === 'string' &&
      (!('nx' in args) || typeof (args as any).nx === 'boolean') &&
      (!('px' in args) || typeof (args as any).px === 'number');
  }

  private validateGetArgs(args: unknown): args is GetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string';
  }

  private validateDelArgs(args: unknown): args is DelArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string';
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'hmset',
          description: 'Set multiple hash fields to multiple values',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Hash key' },
              fields: { 
                type: 'object',
                description: 'Field-value pairs to set',
                additionalProperties: { type: 'string' }
              }
            },
            required: ['key', 'fields']
          }
        },
        {
          name: 'hget',
          description: 'Get the value of a hash field',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Hash key' },
              field: { type: 'string', description: 'Field to get' }
            },
            required: ['key', 'field']
          }
        },
        {
          name: 'hgetall',
          description: 'Get all the fields and values in a hash',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Hash key' }
            },
            required: ['key']
          }
        },
        {
          name: 'hset',
          description: 'Set the value of a hash field',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Hash key' },
              field: { type: 'string', description: 'Field to set' },
              value: { type: 'string', description: 'Value to set' }
            },
            required: ['key', 'field', 'value']
          }
        },
        {
          name: 'scan',
          description: 'Scan Redis keys matching a pattern',
          inputSchema: {
            type: 'object',
            properties: {
              pattern: {
                type: 'string',
                description: 'Pattern to match (e.g., "user:*" or "schedule:*")'
              },
              count: {
                type: 'number',
                description: 'Number of keys to return per iteration (optional)',
                minimum: 1
              }
            },
            required: ['pattern']
          }
        },
        {
          name: 'set',
          description: 'Set the string value of a key',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Key to set' },
              value: { type: 'string', description: 'Value to set' },
              nx: {
                type: 'boolean',
                description: 'Only set the key if it does not already exist (optional)'
              },
              px: {
                type: 'number',
                description: 'Set the specified expire time, in milliseconds (optional)'
              }
            },
            required: ['key', 'value']
          }
        },
        {
          name: 'get',
          description: 'Get the value of a key',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Key to get' }
            },
            required: ['key']
          }
        },
        {
          name: 'del',
          description: 'Delete a key',
          inputSchema: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Key to delete' }
            },
            required: ['key']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.ensureConnected();

      switch (request.params.name) {
        case 'hmset': {
          if (!this.validateHMSetArgs(request.params.arguments)) {
            throw new Error('Invalid arguments for hmset');
          }
          await this.redisClient.hSet(request.params.arguments.key, request.params.arguments.fields);
          return { content: [{ type: 'text', text: 'Hash fields set successfully' }] };
        }

        case 'hget': {
          if (!this.validateHGetArgs(request.params.arguments)) {
            throw new Error('Invalid arguments for hget');
          }
          const value = await this.redisClient.hGet(request.params.arguments.key, request.params.arguments.field);
          return { 
            content: [{ 
              type: 'text', 
              text: value !== null ? value : 'Field not found' 
            }] 
          };
        }

        case 'hgetall': {
          if (!this.validateHGetAllArgs(request.params.arguments)) {
            throw new Error('Invalid arguments for hgetall');
          }
          const value = await this.redisClient.hGetAll(request.params.arguments.key);
          return { 
            content: [{ 
              type: 'text', 
              text: Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : 'Hash not found or empty' 
            }] 
          };
        }

        case 'hset': {
          if (!this.validateHSetArgs(request.params.arguments)) {
            throw new Error('Invalid arguments for hset');
          }
          await this.redisClient.hSet(
            request.params.arguments.key,
            request.params.arguments.field,
            request.params.arguments.value
          );
          return { content: [{ type: 'text', text: 'Hash field set successfully' }] };
        }

        case 'scan': {
          if (!this.validateScanArgs(request.params.arguments)) {
            throw new Error('Invalid arguments for scan');
          }
          const { pattern, count = 100 } = request.params.arguments;
          const keys = await this.redisClient.keys(pattern);
          return {
            content: [{
              type: 'text',
              text: keys.length > 0 ? JSON.stringify(keys, null, 2) : 'No keys found matching pattern'
            }]
          };
        }

        case 'set': {
          if (!this.validateSetArgs(request.params.arguments)) {
            throw new Error('Invalid arguments for set');
          }
          const { key, value, nx, px } = request.params.arguments;
          const setOptions: any = {};
          
          if (nx) setOptions.NX = true;
          if (px) setOptions.PX = px;

          const result = await this.redisClient.set(key, value, setOptions);
          return {
            content: [{
              type: 'text',
              text: result !== null ? 'Key set successfully' : 'Key not set (NX condition not met)'
            }]
          };
        }

        case 'get': {
          if (!this.validateGetArgs(request.params.arguments)) {
            throw new Error('Invalid arguments for get');
          }
          const value = await this.redisClient.get(request.params.arguments.key);
          return {
            content: [{
              type: 'text',
              text: value !== null ? value : 'Key not found'
            }]
          };
        }

        case 'del': {
          if (!this.validateDelArgs(request.params.arguments)) {
            throw new Error('Invalid arguments for del');
          }
          const result = await this.redisClient.del(request.params.arguments.key);
          return {
            content: [{
              type: 'text',
              text: result > 0 ? 'Key deleted successfully' : 'Key not found'
            }]
          };
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
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