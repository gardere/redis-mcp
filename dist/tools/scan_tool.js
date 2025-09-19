import { RedisTool } from './base_tool.js';
export class ScanTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'scan';
        this.description = 'Scan Redis keys matching a pattern';
        this.inputSchema = {
            type: 'object',
            properties: {
                pattern: {
                    type: 'string',
                    description: 'Pattern to match (e.g., "user:*" or "schedule:*")'
                },
                count: {
                    type: 'number',
                    description: 'Number of keys to return per iteration (optional)',
                    minimum: 1
                },
                unlimited: {
                    type: 'boolean',
                    description: 'If true, return all matching keys without the default 10-key limit (optional)'
                }
            },
            required: ['pattern']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'pattern' in args && typeof args.pattern === 'string' &&
            (!('count' in args) || typeof args.count === 'number') &&
            (!('unlimited' in args) || typeof args.unlimited === 'boolean');
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for scan');
        }
        try {
            const { pattern, count = 100, unlimited = false } = args;
            const keys = await client.keys(pattern);
            if (keys.length === 0) {
                return this.createSuccessResponse('No keys found matching pattern');
            }
            let resultKeys = keys;
            if (!unlimited) {
                // Limit keys to at most 10, or less if count is specified and smaller
                const maxKeys = Math.min(count || 10, 10);
                resultKeys = keys.slice(0, maxKeys);
            }
            return this.createSuccessResponse(JSON.stringify(resultKeys, null, 2));
        }
        catch (error) {
            return this.createErrorResponse(`Failed to scan keys: ${error}`);
        }
    }
}
