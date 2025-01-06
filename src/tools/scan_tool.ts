import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { ScanArgs, ToolResponse } from '../interfaces/types.js';

export class ScanTool extends RedisTool {
  name = 'scan';
  description = 'Scan Redis keys matching a pattern';
  inputSchema = {
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
  };

  validateArgs(args: unknown): args is ScanArgs {
    return typeof args === 'object' && args !== null &&
      'pattern' in args && typeof (args as any).pattern === 'string' &&
      (!('count' in args) || typeof (args as any).count === 'number');
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for scan');
    }

    try {
      const { pattern, count = 100 } = args;
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        return this.createSuccessResponse('No keys found matching pattern');
      }

      // If count is specified, limit the number of returned keys
      const limitedKeys = count ? keys.slice(0, count) : keys;
      return this.createSuccessResponse(JSON.stringify(limitedKeys, null, 2));
    } catch (error) {
      return this.createErrorResponse(`Failed to scan keys: ${error}`);
    }
  }
}