import { RedisTool } from './base_tool.js';
export class ZRangeTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'zrange';
        this.description = 'Return a range of members from a sorted set by index';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Sorted set key' },
                start: { type: 'number', description: 'Start index (0-based)' },
                stop: { type: 'number', description: 'Stop index (inclusive)' },
                withScores: { type: 'boolean', description: 'Include scores in output', default: false }
            },
            required: ['key', 'start', 'stop']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'key' in args && typeof args.key === 'string' &&
            'start' in args && typeof args.start === 'number' &&
            'stop' in args && typeof args.stop === 'number' &&
            (!('withScores' in args) || typeof args.withScores === 'boolean');
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for zrange');
        }
        try {
            const result = await client.sendCommand([
                'ZRANGE',
                args.key,
                args.start.toString(),
                args.stop.toString(),
                ...(args.withScores ? ['WITHSCORES'] : [])
            ]);
            if (!Array.isArray(result) || result.length === 0) {
                return this.createSuccessResponse('No members found in the specified range');
            }
            if (args.withScores) {
                // Format result with scores when WITHSCORES is used
                const pairs = [];
                for (let i = 0; i < result.length; i += 2) {
                    pairs.push(`${result[i]} (score: ${result[i + 1]})`);
                }
                return this.createSuccessResponse(pairs.join('\n'));
            }
            return this.createSuccessResponse(result.join('\n'));
        }
        catch (error) {
            return this.createErrorResponse(`Failed to get range from sorted set: ${error}`);
        }
    }
}
