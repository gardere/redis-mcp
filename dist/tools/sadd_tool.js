import { RedisTool } from './base_tool.js';
export class SAddTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'sadd';
        this.description = 'Add one or more members to a set';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Set key' },
                members: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Members to add to the set'
                }
            },
            required: ['key', 'members']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'key' in args && typeof args.key === 'string' &&
            'members' in args && Array.isArray(args.members) &&
            args.members.every((member) => typeof member === 'string');
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for sadd');
        }
        try {
            const result = await client.sAdd(args.key, args.members);
            return this.createSuccessResponse(`Added ${result} new member(s) to the set`);
        }
        catch (error) {
            return this.createErrorResponse(`Failed to add members to set: ${error}`);
        }
    }
}
