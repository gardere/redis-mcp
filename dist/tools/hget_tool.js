import { RedisTool } from './base_tool.js';
export class HGetTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'hget';
        this.description = 'Get the value of a hash field';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Hash key' },
                field: { type: 'string', description: 'Field to get' }
            },
            required: ['key', 'field']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'key' in args && typeof args.key === 'string' &&
            'field' in args && typeof args.field === 'string';
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for hget');
        }
        try {
            const value = await client.hGet(args.key, args.field);
            if (value === null || value === undefined) {
                return this.createSuccessResponse('Field not found');
            }
            return this.createSuccessResponse(value);
        }
        catch (error) {
            return this.createErrorResponse(`Failed to get hash field: ${error}`);
        }
    }
}
