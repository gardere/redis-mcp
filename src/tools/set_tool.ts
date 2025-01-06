import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { SetArgs, ToolResponse } from '../interfaces/types.js';

export class SetTool extends RedisTool {
  name = 'set';
  description = 'Set string value with optional NX (only if not exists) and PX (expiry in milliseconds) options';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Key to set' },
      value: { type: 'string', description: 'Value to set' },
      nx: { type: 'boolean', description: 'Only set if key does not exist' },
      px: { type: 'number', description: 'Set expiry in milliseconds' }
    },
    required: ['key', 'value']
  };

  validateArgs(args: unknown): args is SetArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'value' in args && typeof (args as any).value === 'string' &&
      (!('nx' in args) || typeof (args as any).nx === 'boolean') &&
      (!('px' in args) || typeof (args as any).px === 'number');
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for set');
    }

    try {
      const options: any = {};
      if (args.nx) {
        options.NX = true;
      }
      if (args.px) {
        options.PX = args.px;
      }

      const result = await client.set(args.key, args.value, options);
      if (result === null) {
        return this.createSuccessResponse('Key not set (NX condition not met)');
      }
      return this.createSuccessResponse('OK');
    } catch (error) {
      return this.createErrorResponse(`Failed to set key: ${error}`);
    }
  }
}