import { RedisTool } from './base_tool.js';
export class SMembersTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'smembers';
        this.description = 'Get all members in a set';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Set key' }
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
            return this.createErrorResponse('Invalid arguments for smembers');
        }
        try {
            const members = await client.sMembers(args.key);
            if (members.length === 0) {
                return this.createSuccessResponse('Set is empty or does not exist');
            }
            return this.createSuccessResponse(JSON.stringify(members, null, 2));
        }
        catch (error) {
            return this.createErrorResponse(`Failed to get set members: ${error}`);
        }
    }
}
