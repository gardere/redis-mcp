import { KeysTool } from '../keys_tool.js';
import { RedisClientType } from 'redis';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('KeysTool', () => {
  let keysTool: KeysTool;
  let mockRedisClient: jest.Mocked<RedisClientType>;

  beforeEach(() => {
    keysTool = new KeysTool();
    mockRedisClient = {
      keys: jest.fn(),
    } as unknown as jest.Mocked<RedisClientType>;
  });

  describe('validateArgs', () => {
    it('should return true for valid arguments with pattern', () => {
      expect(keysTool.validateArgs({ pattern: 'user:*' })).toBe(true);
    });

    it('should return true for wildcard pattern', () => {
      expect(keysTool.validateArgs({ pattern: '*' })).toBe(true);
    });

    it('should return false for missing pattern', () => {
      expect(keysTool.validateArgs({})).toBe(false);
    });

    it('should return false for non-string pattern', () => {
      expect(keysTool.validateArgs({ pattern: 123 })).toBe(false);
    });

    it('should return false for null input', () => {
      expect(keysTool.validateArgs(null)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return error for invalid arguments', async () => {
      const result = await keysTool.execute({}, mockRedisClient);
      expect(result._meta?.error).toBe(true);
      expect(result.content[0].text).toBe('Invalid arguments for keys');
    });

    it('should return success message for no matching keys', async () => {
      mockRedisClient.keys.mockResolvedValue([]);
      const result = await keysTool.execute({ pattern: 'user:*' }, mockRedisClient);
      expect(result._meta?.error).toBeUndefined();
      expect(result.content[0].text).toBe('No keys found matching pattern');
    });

    it('should return all matching keys', async () => {
      const keys = ['user:1', 'user:2', 'user:3'];
      mockRedisClient.keys.mockResolvedValue(keys);
      
      const result = await keysTool.execute({ pattern: 'user:*' }, mockRedisClient);
      const parsedKeys = JSON.parse(result.content[0].text);
      
      expect(result._meta?.error).toBeUndefined();
      expect(parsedKeys).toEqual(keys);
    });

    it('should handle wildcard patterns', async () => {
      const keys = ['key1', 'key2', 'user:1', 'session:abc'];
      mockRedisClient.keys.mockResolvedValue(keys);
      
      const result = await keysTool.execute({ pattern: '*' }, mockRedisClient);
      const parsedKeys = JSON.parse(result.content[0].text);
      
      expect(result._meta?.error).toBeUndefined();
      expect(parsedKeys).toEqual(keys);
    });

    it('should handle Redis client errors', async () => {
      const error = new Error('Redis connection failed');
      mockRedisClient.keys.mockRejectedValue(error);
      
      const result = await keysTool.execute({ pattern: 'key*' }, mockRedisClient);
      expect(result._meta?.error).toBe(true);
      expect(result.content[0].text).toBe('Failed to get keys: Error: Redis connection failed');
    });
  });
});
