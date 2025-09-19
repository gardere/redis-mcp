import { RedisTool } from './base_tool.js';
export class DelTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'del';
        this.description = 'Delete a key';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Key to delete' }
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
            return this.createErrorResponse('Invalid arguments for del');
        }
        try {
            const count = await client.del(args.key);
            if (count === 0) {
                return this.createSuccessResponse('Key did not exist');
            }
            return this.createSuccessResponse('Key deleted');
        }
        catch (error) {
            return this.createErrorResponse(`Failed to delete key: ${error}`);
        }
    }
}
