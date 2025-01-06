import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { SMembersArgs, ToolResponse } from '../interfaces/types.js';

export class SMembersTool extends RedisTool {
  name = 'smembers';
  description = 'Get all members in a set';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Set key' }
    },
    required: ['key']
  };

  validateArgs(args: unknown): args is SMembersArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string';
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for smembers');
    }

    try {
      const members = await client.sMembers(args.key);
      if (members.length === 0) {
        return this.createSuccessResponse('Set is empty or does not exist');
      }
      return this.createSuccessResponse(JSON.stringify(members, null, 2));
    } catch (error) {
      return this.createErrorResponse(`Failed to get set members: ${error}`);
    }
  }
}