import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { HGetArgs, ToolResponse } from '../interfaces/types.js';

export class HGetTool extends RedisTool {
  name = 'hget';
  description = 'Get the value of a hash field';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Hash key' },
      field: { type: 'string', description: 'Field to get' }
    },
    required: ['key', 'field']
  };

  validateArgs(args: unknown): args is HGetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'field' in args && typeof (args as any).field === 'string';
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for hget');
    }

    try {
      const value = await client.hGet(args.key, args.field);
      if (value === null || value === undefined) {
        return this.createSuccessResponse('Field not found');
      }
      return this.createSuccessResponse(value);
    } catch (error) {
      return this.createErrorResponse(`Failed to get hash field: ${error}`);
    }
  }
}