import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { HGetAllArgs, ToolResponse } from '../interfaces/types.js';

export class HGetAllTool extends RedisTool {
  name = 'hgetall';
  description = 'Get all the fields and values in a hash';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Hash key' }
    },
    required: ['key']
  };

  validateArgs(args: unknown): args is HGetAllArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string';
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for hgetall');
    }

    try {
      const value = await client.hGetAll(args.key);
      if (Object.keys(value).length === 0) {
        return this.createSuccessResponse('Hash not found or empty');
      }
      return this.createSuccessResponse(JSON.stringify(value, null, 2));
    } catch (error) {
      return this.createErrorResponse(`Failed to get hash: ${error}`);
    }
  }
}