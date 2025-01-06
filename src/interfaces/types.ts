import { RedisClientType as RedisClient } from 'redis';

// Extend RedisClientType to handle the specific client type
export type RedisClientType = RedisClient<any, any, any>;

export interface HMSetArgs {
  key: string;
  fields: Record<string, string>;
}

export interface HGetArgs {
  key: string;
  field: string;
}

export interface HGetAllArgs {
  key: string;
}

export interface HSetArgs {
  key: string;
  field: string;
  value: string;
}

export interface SetArgs {
  key: string;
  value: string;
  nx?: boolean;
  px?: number;
}

export interface GetArgs {
  key: string;
}

export interface DelArgs {
  key: string;
}

export interface ScanArgs {
  pattern: string;
  count?: number;
}

export interface ZAddArgs {
  key: string;
  members: Array<{score: number; value: string}>;
}

export interface ZRangeArgs {
  key: string;
  start: number;
  stop: number;
  withScores?: boolean;
}

export interface ZRangeByScoreArgs {
  key: string;
  min: number;
  max: number;
  withScores?: boolean;
}

export interface ZRemArgs {
  key: string;
  members: string[];
}

// Update ToolResponse to match MCP SDK expectations
export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  _meta?: Record<string, unknown>;
}

export interface BaseTool {
  name: string;
  description: string;
  inputSchema: object;
  validateArgs(args: unknown): boolean;
  execute(args: unknown, client: RedisClientType): Promise<ToolResponse>;
}