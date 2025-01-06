# Redis MCP Server

A Model Context Protocol (MCP) server that provides access to Redis database operations.

## Project Structure

```
src/
├── interfaces/
│   └── types.ts           # Shared TypeScript interfaces and types
├── tools/
│   ├── base_tool.ts       # Abstract base class for Redis tools
│   ├── tool_registry.ts   # Registry managing all available Redis tools
│   ├── hmset_tool.ts      # HMSET Redis operation
│   ├── hget_tool.ts       # HGET Redis operation
│   ├── hgetall_tool.ts    # HGETALL Redis operation
│   ├── scan_tool.ts       # SCAN Redis operation
│   ├── set_tool.ts        # SET Redis operation
│   ├── get_tool.ts        # GET Redis operation
│   └── del_tool.ts        # DEL Redis operation
└── redis_server.ts        # Main server implementation
```

## Available Tools

| Tool | Type | Description | Input Schema |
|------|------|-------------|--------------|
| hmset | Hash Command | Set multiple hash fields to multiple values | `key`: string (Hash key)<br>`fields`: object (Field-value pairs to set) |
| hget | Hash Command | Get the value of a hash field | `key`: string (Hash key)<br>`field`: string (Field to get) |
| hgetall | Hash Command | Get all fields and values in a hash | `key`: string (Hash key) |
| scan | Key Command | Scan Redis keys matching a pattern | `pattern`: string (Pattern to match, e.g., "user:*")<br>`count`: number, optional (Number of keys to return) |
| set | String Command | Set string value with optional NX and PX options | `key`: string (Key to set)<br>`value`: string (Value to set)<br>`nx`: boolean, optional (Only set if not exists)<br>`px`: number, optional (Expiry in milliseconds) |
| get | String Command | Get string value | `key`: string (Key to get) |
| del | Key Command | Delete a key | `key`: string (Key to delete) |

## Usage

Configure in your MCP client (e.g., Claude Desktop, Cline):

```json
{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": ["redis-mcp", "--redis-host", "localhost", "--redis-port", "6379"],
      "disabled": false
    }
  }
}
```

## Command Line Arguments

- `--redis-host`: Redis server host (default: localhost)
- `--redis-port`: Redis server port (default: 6379)

## Development

To add a new Redis tool:

1. Create a new tool class in `src/tools/` extending `RedisTool`
2. Define the tool's interface in `src/interfaces/types.ts`
3. Register the tool in `src/tools/tool_registry.ts`

Example tool implementation:

```typescript
export class MyTool extends RedisTool {
  name = 'mytool';
  description = 'Description of what the tool does';
  inputSchema = {
    type: 'object',
    properties: {
      // Define input parameters
    },
    required: ['requiredParam']
  };

  validateArgs(args: unknown): args is MyToolArgs {
    // Implement argument validation
  }

  async execute(args: unknown, client: RedisClientType): Promise<ToolResponse> {
    // Implement tool logic
  }
}
```

## License

MIT: https://opensource.org/license/mit