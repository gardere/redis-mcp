import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { ZAddArgs, ToolResponse } from '../interfaces/types.js';

export class ZAddTool extends RedisTool {
  name = 'zadd';
  description = 'Add one or more members to a sorted set';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Sorted set key' },
      members: {
        type: 'array',
        description: 'Array of score-value pairs to add',
        items: {
          type: 'object',
          properties: {
            score: { type: 'number', description: 'Score for the member' },
            value: { type: 'string', description: 'Member value' }
          },
          required: ['score', 'value']
        }
      }
    },
    required: ['key', 'members']
  };

  validateArgs(args: unknown): args is ZAddArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'members' in args && Array.isArray((args as any).members) &&
      (args as any).members.every((member: any) =>
        typeof member === 'object' && member !== null &&
        'score' in member && typeof member.score === 'number' &&
        'value' in member && typeof member.value === 'string'
      );
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for zadd');
    }

    try {
      const members = args.members.map(member => ({
        score: member.score,
        value: member.value
      }));

      const result = await client.zAdd(args.key, members);
      return this.createSuccessResponse(`Added ${result} new members to the sorted set`);
    } catch (error) {
      return this.createErrorResponse(`Failed to add members to sorted set: ${error}`);
    }
  }
}