import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { DelArgs, ToolResponse } from '../interfaces/types.js';

export class DelTool extends RedisTool {
  name = 'del';
  description = 'Delete a key';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Key to delete' }
    },
    required: ['key']
  };

  validateArgs(args: unknown): args is DelArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string';
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for del');
    }

    try {
      const count = await client.del(args.key);
      if (count === 0) {
        return this.createSuccessResponse('Key did not exist');
      }
      return this.createSuccessResponse('Key deleted');
    } catch (error) {
      return this.createErrorResponse(`Failed to delete key: ${error}`);
    }
  }
}