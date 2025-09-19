import { RedisTool } from './base_tool.js';
export class GetTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'get';
        this.description = 'Get string value';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Key to get' }
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
            return this.createErrorResponse('Invalid arguments for get');
        }
        try {
            const value = await client.get(args.key);
            if (value === null) {
                return this.createSuccessResponse('Key not found');
            }
            return this.createSuccessResponse(value);
        }
        catch (error) {
            return this.createErrorResponse(`Failed to get key: ${error}`);
        }
    }
}
