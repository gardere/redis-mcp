import { RedisTool } from './base_tool.js';
export class ZRemTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'zrem';
        this.description = 'Remove one or more members from a sorted set';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Sorted set key' },
                members: {
                    type: 'array',
                    description: 'Array of members to remove',
                    items: { type: 'string' }
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
            return this.createErrorResponse('Invalid arguments for zrem');
        }
        try {
            const result = await client.zRem(args.key, args.members);
            return this.createSuccessResponse(`Removed ${result} members from the sorted set`);
        }
        catch (error) {
            return this.createErrorResponse(`Failed to remove members from sorted set: ${error}`);
        }
    }
}
