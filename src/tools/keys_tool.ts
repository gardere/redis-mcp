import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { KeysArgs, ToolResponse } from '../interfaces/types.js';

export class KeysTool extends RedisTool {
  name = 'keys';
  description = 'Get all Redis keys matching a pattern';
  inputSchema = {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'Pattern to match (e.g., "user:*" or "*" for all keys)'
      }
    },
    required: ['pattern']
  };

  validateArgs(args: unknown): args is KeysArgs {
    return typeof args === 'object' && args !== null &&
      'pattern' in args && typeof (args as any).pattern === 'string';
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for keys');
    }

    try {
      const { pattern } = args;
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        return this.createSuccessResponse('No keys found matching pattern');
      }

      return this.createSuccessResponse(JSON.stringify(keys, null, 2));
    } catch (error) {
      return this.createErrorResponse(`Failed to get keys: ${error}`);
    }
  }
}
