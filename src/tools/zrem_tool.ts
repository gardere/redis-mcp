import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { ZRemArgs, ToolResponse } from '../interfaces/types.js';

export class ZRemTool extends RedisTool {
  name = 'zrem';
  description = 'Remove one or more members from a sorted set';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Sorted set key' },
      members: {
        type: 'array',
        description: 'Array of members to remove',
        items: { type: 'string' }
      }
    },
    required: ['key', 'members']
  };

  validateArgs(args: unknown): args is ZRemArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'members' in args && Array.isArray((args as any).members) &&
      (args as any).members.every((member: any) => typeof member === 'string');
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for zrem');
    }

    try {
      const result = await client.zRem(args.key, args.members);
      return this.createSuccessResponse(`Removed ${result} members from the sorted set`);
    } catch (error) {
      return this.createErrorResponse(`Failed to remove members from sorted set: ${error}`);
    }
  }
}