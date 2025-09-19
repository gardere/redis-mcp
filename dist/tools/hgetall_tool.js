import { RedisTool } from './base_tool.js';
export class HGetAllTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'hgetall';
        this.description = 'Get all the fields and values in a hash';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Hash key' }
            },
            required: ['key']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'key' in args && typeof args.key === 'string';
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for hgetall');
        }
        try {
            const value = await client.hGetAll(args.key);
            if (Object.keys(value).length === 0) {
                return this.createSuccessResponse('Hash not found or empty');
            }
            return this.createSuccessResponse(JSON.stringify(value, null, 2));
        }
        catch (error) {
            return this.createErrorResponse(`Failed to get hash: ${error}`);
        }
    }
}
