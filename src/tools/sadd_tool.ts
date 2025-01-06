import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { SAddArgs, ToolResponse } from '../interfaces/types.js';

export class SAddTool extends RedisTool {
  name = 'sadd';
  description = 'Add one or more members to a set';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Set key' },
      members: {
        type: 'array',
        items: { type: 'string' },
        description: 'Members to add to the set'
      }
    },
    required: ['key', 'members']
  };

  validateArgs(args: unknown): args is SAddArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'members' in args && Array.isArray((args as any).members) &&
      (args as any).members.every((member: unknown) => typeof member === 'string');
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for sadd');
    }

    try {
      const result = await client.sAdd(args.key, args.members);
      return this.createSuccessResponse(`Added ${result} new member(s) to the set`);
    } catch (error) {
      return this.createErrorResponse(`Failed to add members to set: ${error}`);
    }
  }
}