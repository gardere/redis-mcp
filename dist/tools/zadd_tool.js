import { RedisTool } from './base_tool.js';
export class ZAddTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'zadd';
        this.description = 'Add one or more members to a sorted set';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Sorted set key' },
                members: {
                    type: 'array',
                    description: 'Array of score-value pairs to add',
                    items: {
                        type: 'object',
                        properties: {
                            score: { type: 'number', description: 'Score for the member' },
                            value: { type: 'string', description: 'Member value' }
                        },
                        required: ['score', 'value']
                    }
                }
            },
            required: ['key', 'members']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'key' in args && typeof args.key === 'string' &&
            'members' in args && Array.isArray(args.members) &&
            args.members.every((member) => typeof member === 'object' && member !== null &&
                'score' in member && typeof member.score === 'number' &&
                'value' in member && typeof member.value === 'string');
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for zadd');
        }
        try {
            const members = args.members.map(member => ({
                score: member.score,
                value: member.value
            }));
            const result = await client.zAdd(args.key, members);
            return this.createSuccessResponse(`Added ${result} new members to the sorted set`);
        }
        catch (error) {
            return this.createErrorResponse(`Failed to add members to sorted set: ${error}`);
        }
    }
}
