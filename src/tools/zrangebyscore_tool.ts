import { RedisClientType } from 'redis';
import { RedisTool } from './base_tool.js';
import { ZRangeByScoreArgs, ToolResponse } from '../interfaces/types.js';

export class ZRangeByScoreTool extends RedisTool {
  name = 'zrangebyscore';
  description = 'Return members from a sorted set with scores between min and max';
  inputSchema = {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Sorted set key' },
      min: { type: 'number', description: 'Minimum score' },
      max: { type: 'number', description: 'Maximum score' },
      withScores: { type: 'boolean', description: 'Include scores in output', default: false }
    },
    required: ['key', 'min', 'max']
  };

  validateArgs(args: unknown): args is ZRangeByScoreArgs {
    return typeof args === 'object' && args !== null &&
      'key' in args && typeof (args as any).key === 'string' &&
      'min' in args && typeof (args as any).min === 'number' &&
      'max' in args && typeof (args as any).max === 'number' &&
      (!('withScores' in args) || typeof (args as any).withScores === 'boolean');
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    if (!this.validateArgs(args)) {
      return this.createErrorResponse('Invalid arguments for zrangebyscore');
    }

    try {
      const result = await client.sendCommand([
        'ZRANGEBYSCORE',
        args.key,
        args.min.toString(),
        args.max.toString(),
        ...(args.withScores ? ['WITHSCORES'] : [])
      ]) as string[];

      if (!Array.isArray(result) || result.length === 0) {
        return this.createSuccessResponse('No members found in the specified score range');
      }

      if (args.withScores) {
        // Format result with scores when WITHSCORES is used
        const pairs = [];
        for (let i = 0; i < result.length; i += 2) {
          pairs.push(`${result[i]} (score: ${result[i + 1]})`);
        }
        return this.createSuccessResponse(pairs.join('\n'));
      }

      return this.createSuccessResponse(result.join('\n'));
    } catch (error) {
      return this.createErrorResponse(`Failed to get range by score from sorted set: ${error}`);
    }
  }
}