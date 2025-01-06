import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { GetArgs, ToolResponse } from '../interfaces/types.js';

export class GetTool extends RedisTool {
  name = 'get';
  description = 'Get string value';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Key to get' }
    },
    required: ['key']
  };

  validateArgs(args: unknown): args is GetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string';
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for get');
    }

    try {
      const value = await client.get(args.key);
      if (value === null) {
        return this.createSuccessResponse('Key not found');
      }
      return this.createSuccessResponse(value);
    } catch (error) {
      return this.createErrorResponse(`Failed to get key: ${error}`);
    }
  }
}