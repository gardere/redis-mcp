import { RedisClientType } from 'redis';
import { BaseTool, ToolResponse } from '../interfaces/types.js';

export abstract class RedisTool implements BaseTool {
  abstract name: string;
  abstract description: string;
  abstract inputSchema: object;
  
  abstract validateArgs(args: unknown): boolean;
  abstract execute(args: unknown, client: RedisClientType): Promise<ToolResponse>;
  
  protected createSuccessResponse(text: string): ToolResponse {
    return {
      content: [{
        type: 'text',
        text
      }]
    };
  }

  protected createErrorResponse(error: string): ToolResponse {
    return {
      content: [{
        type: 'text',
        text: error
      }],
      _meta: {
        error: true
      }
    };
  }
}