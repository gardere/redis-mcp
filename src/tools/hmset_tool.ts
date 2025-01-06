import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { HMSetArgs, ToolResponse } from '../interfaces/types.js';

export class HMSetTool extends RedisTool {
  name = 'hmset';
  description = 'Set multiple hash fields to multiple values';
  inputSchema = {
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
  };

  validateArgs(args: unknown): args is HMSetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'fields' in args && typeof (args as any).fields === 'object';
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for hmset');
    }

    try {
      await client.hSet(args.key, args.fields);
      return this.createSuccessResponse('Hash fields set successfully');
    } catch (error) {
      return this.createErrorResponse(`Failed to set hash fields: ${error}`);
    }
  }
}