import { RedisTool } from './base_tool.js';
export class HMSetTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'hmset';
        this.description = 'Set multiple hash fields to multiple values';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Hash key' },
                fields: {
                    type: 'object',
                    description: 'Field-value pairs to set',
                    additionalProperties: { type: 'string' }
                }
            },
            required: ['key', 'fields']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'key' in args && typeof args.key === 'string' &&
            'fields' in args && typeof args.fields === 'object';
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for hmset');
        }
        try {
            await client.hSet(args.key, args.fields);
            return this.createSuccessResponse('Hash fields set successfully');
        }
        catch (error) {
            return this.createErrorResponse(`Failed to set hash fields: ${error}`);
        }
    }
}
