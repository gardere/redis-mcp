import { ScanTool } from '../scan_tool.js';
import { RedisClientType } from 'redis';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('ScanTool', () => {
  let scanTool: ScanTool;
  let mockRedisClient: jest.Mocked<RedisClientType>;

  beforeEach(() => {
    scanTool = new ScanTool();
    mockRedisClient = {
      keys: jest.fn(),
    } as unknown as jest.Mocked<RedisClientType>;
  });

  describe('validateArgs', () => {
    it('should return true for valid arguments with pattern only', () => {
      expect(scanTool.validateArgs({ pattern: 'user:*' })).toBe(true);
    });

    it('should return true for valid arguments with pattern and count', () => {
      expect(scanTool.validateArgs({ pattern: 'user:*', count: 5 })).toBe(true);
    });

    it('should return true for valid arguments with unlimited parameter', () => {
      expect(scanTool.validateArgs({ pattern: 'user:*', unlimited: true })).toBe(true);
    });

    it('should return true for valid arguments with all parameters', () => {
      expect(scanTool.validateArgs({ pattern: 'user:*', count: 5, unlimited: false })).toBe(true);
    });

    it('should return false for missing pattern', () => {
      expect(scanTool.validateArgs({})).toBe(false);
    });

    it('should return false for invalid count type', () => {
      expect(scanTool.validateArgs({ pattern: 'user:*', count: '5' })).toBe(false);
    });

    it('should return false for null input', () => {
      expect(scanTool.validateArgs(null)).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return error for invalid arguments', async () => {
      const result = await scanTool.execute({}, mockRedisClient);
      expect(result._meta?.error).toBe(true);
      expect(result.content[0].text).toBe('Invalid arguments for scan');
    });

    it('should return success message for no matching keys', async () => {
      mockRedisClient.keys.mockResolvedValue([]);
      const result = await scanTool.execute({ pattern: 'user:*' }, mockRedisClient);
      expect(result._meta?.error).toBeUndefined();
      expect(result.content[0].text).toBe('No keys found matching pattern');
    });

    it('should limit results to 10 keys when more exist', async () => {
      const keys = Array.from({ length: 20 }, (_, i) => `key${i}`);
      mockRedisClient.keys.mockResolvedValue(keys);
      
      const result = await scanTool.execute({ pattern: 'key*' }, mockRedisClient);
      const parsedKeys = JSON.parse(result.content[0].text);
      
      expect(result._meta?.error).toBeUndefined();
      expect(parsedKeys.length).toBe(10);
      expect(parsedKeys).toEqual(keys.slice(0, 10));
    });

    it('should respect count parameter when less than 10', async () => {
      const keys = Array.from({ length: 20 }, (_, i) => `key${i}`);
      mockRedisClient.keys.mockResolvedValue(keys);
      
      const result = await scanTool.execute({ pattern: 'key*', count: 5 }, mockRedisClient);
      const parsedKeys = JSON.parse(result.content[0].text);
      
      expect(result._meta?.error).toBeUndefined();
      expect(parsedKeys.length).toBe(5);
      expect(parsedKeys).toEqual(keys.slice(0, 5));
    });

    it('should limit to 10 keys when count is greater than 10', async () => {
      const keys = Array.from({ length: 20 }, (_, i) => `key${i}`);
      mockRedisClient.keys.mockResolvedValue(keys);
      
      const result = await scanTool.execute({ pattern: 'key*', count: 15 }, mockRedisClient);
      const parsedKeys = JSON.parse(result.content[0].text);
      
      expect(result._meta?.error).toBeUndefined();
      expect(parsedKeys.length).toBe(10);
      expect(parsedKeys).toEqual(keys.slice(0, 10));
    });

    it('should return all keys when unlimited is true', async () => {
      const keys = Array.from({ length: 50 }, (_, i) => `key${i}`);
      mockRedisClient.keys.mockResolvedValue(keys);
      
      const result = await scanTool.execute({ pattern: 'key*', unlimited: true }, mockRedisClient);
      const parsedKeys = JSON.parse(result.content[0].text);
      
      expect(result._meta?.error).toBeUndefined();
      expect(parsedKeys.length).toBe(50);
      expect(parsedKeys).toEqual(keys);
    });

    it('should still limit to 10 keys when unlimited is false', async () => {
      const keys = Array.from({ length: 20 }, (_, i) => `key${i}`);
      mockRedisClient.keys.mockResolvedValue(keys);
      
      const result = await scanTool.execute({ pattern: 'key*', unlimited: false }, mockRedisClient);
      const parsedKeys = JSON.parse(result.content[0].text);
      
      expect(result._meta?.error).toBeUndefined();
      expect(parsedKeys.length).toBe(10);
      expect(parsedKeys).toEqual(keys.slice(0, 10));
    });

    it('should handle Redis client errors', async () => {
      const error = new Error('Redis connection failed');
      mockRedisClient.keys.mockRejectedValue(error);
      
      const result = await scanTool.execute({ pattern: 'key*' }, mockRedisClient);
      expect(result._meta?.error).toBe(true);
      expect(result.content[0].text).toBe('Failed to scan keys: Error: Redis connection failed');
    });
  });
});