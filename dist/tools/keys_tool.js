import { RedisTool } from './base_tool.js';
export class KeysTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'keys';
        this.description = 'Get all Redis keys matching a pattern';
        this.inputSchema = {
            type: 'object',
            properties: {
                pattern: {
                    type: 'string',
                    description: 'Pattern to match (e.g., "user:*" or "*" for all keys)'
                }
            },
            required: ['pattern']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'pattern' in args && typeof args.pattern === 'string';
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for keys');
        }
        try {
            const { pattern } = args;
            const keys = await client.keys(pattern);
            if (keys.length === 0) {
                return this.createSuccessResponse('No keys found matching pattern');
            }
            return this.createSuccessResponse(JSON.stringify(keys, null, 2));
        }
        catch (error) {
            return this.createErrorResponse(`Failed to get keys: ${error}`);
        }
    }
}
