export class RedisTool {
    createSuccessResponse(text) {
        return {
            content: [{
                    type: 'text',
                    text
                }]
        };
    }
    createErrorResponse(error) {
        return {
            content: [{
                    type: 'text',
                    text: error
                }],
            _meta: {
                error: true
            }
        };
    }
}
