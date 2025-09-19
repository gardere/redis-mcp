import { RedisTool } from './base_tool.js';
export class SetTool extends RedisTool {
    constructor() {
        super(...arguments);
        this.name = 'set';
        this.description = 'Set string value with optional NX (only if not exists) and PX (expiry in milliseconds) options';
        this.inputSchema = {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Key to set' },
                value: { type: 'string', description: 'Value to set' },
                nx: { type: 'boolean', description: 'Only set if key does not exist' },
                px: { type: 'number', description: 'Set expiry in milliseconds' }
            },
            required: ['key', 'value']
        };
    }
    validateArgs(args) {
        return typeof args === 'object' && args !== null &&
            'key' in args && typeof args.key === 'string' &&
            'value' in args && typeof args.value === 'string' &&
            (!('nx' in args) || typeof args.nx === 'boolean') &&
            (!('px' in args) || typeof args.px === 'number');
    }
    async execute(args, client) {
        if (!this.validateArgs(args)) {
            return this.createErrorResponse('Invalid arguments for set');
        }
        try {
            const options = {};
            if (args.nx) {
                options.NX = true;
            }
            if (args.px) {
                options.PX = args.px;
            }
            const result = await client.set(args.key, args.value, options);
            if (result === null) {
                return this.createSuccessResponse('Key not set (NX condition not met)');
            }
            return this.createSuccessResponse('OK');
        }
        catch (error) {
            return this.createErrorResponse(`Failed to set key: ${error}`);
        }
    }
}
